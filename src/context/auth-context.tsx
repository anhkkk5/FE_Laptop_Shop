"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService, type User } from "@/lib/auth-service";

const ADMIN_ROLES = new Set(["admin"]);
const ADMIN_APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003";
const AUTH_SYNC_EVENT_KEY = "auth_sync_event";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const redirectToAdminIfInternal = useCallback((userData: User): boolean => {
    if (!ADMIN_ROLES.has(userData.role)) return false;
    if (typeof window !== "undefined") {
      window.location.assign(ADMIN_APP_URL);
    }
    return true;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);

      if (redirectToAdminIfInternal(userData)) {
        return;
      }
    } catch {
      setUser(null);
    }
  }, [redirectToAdminIfInternal]);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const userData = await authService.login(email, password);

      if (redirectToAdminIfInternal(userData)) {
        return;
      }

      await refreshUser();
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_SYNC_EVENT_KEY, String(Date.now()));
      }
      router.push("/");
    },
    [refreshUser, redirectToAdminIfInternal, router],
  );

  const register = useCallback(
    async (data: { email: string; password: string; fullName: string }) => {
      await authService.register(data);
      await refreshUser();
      router.push("/verify-email");
    },
    [refreshUser, router],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore API errors during logout
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_SYNC_EVENT_KEY, String(Date.now()));
    }
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== AUTH_SYNC_EVENT_KEY) {
        return;
      }
      void refreshUser();
    }

    function handleFocus() {
      void refreshUser();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
