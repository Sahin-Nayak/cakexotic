import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    setCart(prev => {
      if (!item.is_custom) {
        const existing = prev.find(c => c.product_id === item.product_id && !c.is_custom);
        if (existing) {
          return prev.map(c => c.product_id === item.product_id && !c.is_custom
            ? { ...c, quantity: c.quantity + item.quantity, subtotal: (c.quantity + item.quantity) * c.unit_price }
            : c);
        }
      }
      return [...prev, { ...item, id: Date.now() }];
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty, subtotal: qty * c.unit_price } : c));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0);
  const count = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
