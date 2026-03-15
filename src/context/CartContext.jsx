/**
 * context/CartContext.jsx — MiniFanzo
 * Cart state with localStorage persistence.
 * Works with both WooCommerce products and local product objects.
 */

import { createContext, useContext, useReducer, useEffect, useState } from "react";

const CartContext = createContext(null);

const FREE_DELIVERY_THRESHOLD = 1500;

// ── Reducer ───────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD_CART":
      return action.payload;

    case "ADD_ITEM": {
      const { item } = action.payload;
      const existingIndex = state.findIndex(
        i => i.id === item.id && (i.variationId || 0) === (item.variationId || 0)
      );
      if (existingIndex !== -1) {
        return state.map((i, idx) =>
          idx === existingIndex
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...state, { ...item, quantity: item.quantity || 1 }];
    }

    case "REMOVE_ITEM":
      return state.filter(
        i => !(i.id === action.payload.id && (i.variationId || 0) === (action.payload.variationId || 0))
      );

    case "UPDATE_QTY": {
      const { id, variationId, quantity } = action.payload;
      if (quantity < 1) {
        return state.filter(
          i => !(i.id === id && (i.variationId || 0) === (variationId || 0))
        );
      }
      return state.map(i =>
        i.id === id && (i.variationId || 0) === (variationId || 0)
          ? { ...i, quantity }
          : i
      );
    }

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [customDeliveryFee, setCustomDeliveryFee] = useState(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mfz_cart");
      if (saved) {
        // Normalize legacy 'qty' field to 'quantity'
        const parsed = JSON.parse(saved).map(item => ({
          ...item,
          quantity: item.quantity || item.qty || 1,
        }));
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch {
      localStorage.removeItem("mfz_cart");
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem("mfz_cart", JSON.stringify(cart));
  }, [cart]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function addToCart(product, quantity = 1, variation = null) {
    // Support both WooCommerce products and local product objects
    const price = product.price
      ? (typeof product.price === "string" ? parseFloat(product.price) : product.price)
      : 0;

    const image = product.image
      || product.images?.[0]?.src
      || "/images/placeholder.jpg";

    const item = {
      id:          product.id,
      variationId: variation?.id || 0,
      name:        product.name,
      price,
      image,
      slug:        product.slug || String(product.id),
      quantity,
      attributes:  variation?.attributes || [],
    };

    dispatch({ type: "ADD_ITEM", payload: { item } });
  }

  function removeFromCart(id, variationId = 0) {
    dispatch({ type: "REMOVE_ITEM", payload: { id, variationId } });
  }

  function updateQty(id, variationId = 0, quantity) {
    dispatch({ type: "UPDATE_QTY", payload: { id, variationId, quantity } });
  }

  function clearCart() {
    dispatch({ type: "CLEAR_CART" });
    setCustomDeliveryFee(null);
  }

  function setDeliveryFee(fee) {
    setCustomDeliveryFee(fee);
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const cartCount    = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * (i.quantity || 0), 0);
  const deliveryFee  = customDeliveryFee !== null 
    ? customDeliveryFee 
    : (cartSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : (cart.length > 0 ? 80 : 0));
  const cartTotal    = cartSubtotal + deliveryFee;

  function getLineItems() {
    return cart.map(item => ({
      product_id:   item.id,
      variation_id: item.variationId || undefined,
      quantity:     item.quantity || 1,
    }));
  }

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      getLineItems,
      setDeliveryFee,
      FREE_DELIVERY_THRESHOLD,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
