"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartService, type CartData } from "@/lib/cart-service";
import { useAuth } from "@/context/auth-context";

interface CartContextType {
  cart: CartData;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const defaultCart: CartData = {
  items: [],
  summary: { totalItems: 0, subtotal: 0 },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartData>(defaultCart);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(defaultCart);
      setIsLoading(false);
      return;
    }

    try {
      const data = await cartService.getMyCart();
      setCart(data);
    } catch {
      setCart(defaultCart);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
    const data = await cartService.addItem(productId, quantity);
    setCart(data);
  }, []);

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    const data = await cartService.updateItem(itemId, quantity);
    setCart(data);
  }, []);

  const removeCartItem = useCallback(async (itemId: number) => {
    const data = await cartService.removeItem(itemId);
    setCart(data);
  }, []);

  const clearCart = useCallback(async () => {
    const data = await cartService.clearCart();
    setCart(data);
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
    }),
    [cart, isLoading, refreshCart, addToCart, updateCartItem, removeCartItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
