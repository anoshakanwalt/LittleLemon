import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// Cart items: { name, price, image, emoji, qty }. The menu has unique dish names, so name is the key.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore the cart when the app starts, and save it whenever it changes.
  useEffect(() => {
    AsyncStorage.getItem('cart')
      .then((v) => {
        if (!v) return;
        const saved = JSON.parse(v);
        if (Array.isArray(saved)) setItems(saved);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem('cart', JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  const addItem = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.name === item.name);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { name: item.name, price: Number(item.price), image: item.image, emoji: item.emoji, qty }];
    });
  }, []);

  const setQty = useCallback((name, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((x) => x.name !== name) : prev.map((x) => (x.name === name ? { ...x, qty } : x))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, x) => n + x.qty, 0), [items]);
  const total = useMemo(() => items.reduce((n, x) => n + x.qty * x.price, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, setQty, clear, count, total }),
    [items, addItem, setQty, clear, count, total]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
