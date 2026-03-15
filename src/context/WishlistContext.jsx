/**
 * context/WishlistContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global Wishlist State — MiniFanzo
 *
 * Provides wishlist data and actions to ALL components via React Context.
 * Wishlist is persisted in localStorage so it survives page refreshes.
 *
 * Usage in any component:
 *   import { useWishlist } from "@/context/WishlistContext";
 *   const { wishlist, addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
 *
 * Wishlist item shape:
 *   {
 *     id:          number,   // WooCommerce product ID
 *     name:        string,
 *     price:       number,
 *     image:       string,
 *     slug:        string,
 *     on_sale:     boolean,
 *     sale_price:  string,
 *     regular_price: string,
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

// ── 1. Create the context ──────────────────────────────────────────────────
const WishlistContext = createContext(null);

// ── 2. WishlistProvider ────────────────────────────────────────────────────
export function WishlistProvider({ children }) {
  // Initialize from localStorage (client-side only)
  const [wishlist, setWishlist] = useState([]);

  // Hydrate wishlist from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mfz_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {
      localStorage.removeItem("mfz_wishlist");
    }
  }, []);

  // Persist wishlist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("mfz_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ── Actions ─────────────────────────────────────────────────────────────

  /**
   * addToWishlist — Add a product to wishlist
   * Does nothing if product is already wishlisted.
   *
   * @param {object} product - WC product object (or simplified card object)
   */
  function addToWishlist(product) {
    setWishlist((prev) => {
      if (prev.find((i) => i.id === product.id)) return prev;
      toast.success(`"${product.name}" added to wishlist!`, {
        icon: "❤️",
        style: { background: "#005840", color: "#fff" },
      });
      return [
        ...prev,
        {
          id:             product.id,
          name:           product.name,
          price:          parseFloat(product.price || 0),
          image:          product.images?.[0]?.src || product.image || "/images/placeholder.jpg",
          slug:           product.slug,
          on_sale:        product.on_sale,
          sale_price:     product.sale_price,
          regular_price:  product.regular_price,
        },
      ];
    });
  }

  /**
   * removeFromWishlist — Remove a product from wishlist by ID
   * @param {number} id - product ID
   */
  function removeFromWishlist(id) {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
    toast("Removed from wishlist", {
      icon: "💔",
      style: { background: "#333", color: "#fff" },
    });
  }

  /**
   * toggleWishlist — Add if not wishlisted, remove if already wishlisted
   * @param {object} product
   */
  function toggleWishlist(product) {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  /**
   * isWishlisted — Check if a product is in the wishlist
   * @param {number} id - product ID
   * @returns {boolean}
   */
  function isWishlisted(id) {
    return wishlist.some((i) => i.id === id);
  }

  /** Total wishlist item count */
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

// ── 3. Custom hook ─────────────────────────────────────────────────────────
/** useWishlist — access wishlist context in any client component */
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
