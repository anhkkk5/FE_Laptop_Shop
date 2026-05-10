"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { siteSettingService, SiteSettings } from "@/lib/site-setting-service";

interface SiteSettingContextType {
  logoUrl: string | null;
  logoText: string;
  isLoading: boolean;
}

const SiteSettingContext = createContext<SiteSettingContextType | undefined>(
  undefined,
);

export function SiteSettingProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoText, setLogoText] = useState<string>("SMART LAPTOP");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await siteSettingService.getPublicSettings();
        setLogoUrl(settings.logoUrl);
        setLogoText(settings.logoText);
      } catch {
        // Use defaults on error
        console.error("Failed to load site settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SiteSettingContext.Provider value={{ logoUrl, logoText, isLoading }}>
      {children}
    </SiteSettingContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingContext);
  if (context === undefined) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingProvider",
    );
  }
  return context;
}
