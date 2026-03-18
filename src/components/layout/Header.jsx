/**
 * components/layout/Header.jsx — MiniFanzo
 * Exact design match to original HTML/CSS/JS site
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Header({ logo = null }) {
  const router = useRouter();
  const { cartCount } = useCart();

  const defaultLogo = "https://admin.minifanzo.com/wp-content/uploads/2026/03/logo-2.png";
  const [logoUrl, setLogoUrl] = useState(logo || defaultLogo);

  useEffect(() => {
    if (!logo) {
      const WC_URL = process.env.NEXT_PUBLIC_WC_URL || '';
      const baseUrl = WC_URL.replace(/\/$/, '').replace('/wp-json', '');
      fetch(`${baseUrl}/wp-json/minifanzo/v1/homepage`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data?.logo?.url) {
            setLogoUrl(data.logo.url);
          }
        })
        .catch(() => {});
    }
  }, [logo]);

  const [isScrolled,   setIsScrolled]   = useState(false);
  const [isCartOpen,   setIsCartOpen]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const searchInputRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    function onScroll() {
      // Header shadow
      setIsScrolled(window.scrollY > 10);

      // Active nav link
      const sections = ["home", "products", "features", "about", "contact"];
      const scrollY = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
          setActiveSection(id);
          break;
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [router.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = (isMobileOpen || isCartOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen, isCartOpen]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }

  function scrollToSection(id) {
    if (router.pathname !== "/") {
      router.push("/").then(() => {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const offset = 80;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 400);
      });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setIsMobileOpen(false);
  }

  const navItems = [
    { id: "home",     label: "Home",           href: "/",         section: "home" },
    { id: "products", label: "Products",       href: "/shop",     section: "products" },
    { id: "features", label: "Why Choose Us",  href: "#features", section: "features" },
    { id: "about",    label: "About",          href: "#about",    section: "about" },
    { id: "contact",  label: "Contact",        href: "#contact",  section: "contact" },
  ];

  return (
    <>
      {/* ── TOP ANNOUNCEMENT BAR ────────────────────────────────────────── */}
      <div className="announcement-bar">
        <div className="container">
          <div className="announcement-content">
            <span><i className="fas fa-shipping-fast" /> Pay when your order arrives</span>
            <span className="divider">|</span>
            <span><i className="fas fa-headset" /> 24/7 Customer Support</span>
            <span className="divider">|</span>
            <span><i className="fas fa-shield-alt" /> 30-Day Easy Returns</span>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ─────────────────────────────────────────────────── */}
      <header className={`header${isScrolled ? " scrolled" : ""}`} id="header">
        <div className="container">
          <nav className="navbar">
            {/* Logo */}
            <Link href="/" className="logo">
              <img src={logoUrl} alt="MiniFanzo Logo" />
            </Link>

            {/* Nav Links */}
            <ul 
              className={`nav-links${isMobileOpen ? " active" : ""}`} 
              id="navLinks"
            >
              {navItems.map(item => (
                <li key={item.id}>
                  {item.href.startsWith("#") || item.section !== "home" && router.pathname === "/" ? (
                    <button
                      className={`nav-link${activeSection === item.section || (item.id === "home" && router.pathname === "/") ? " active" : ""}`}
                      onClick={() => scrollToSection(item.section)}
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`nav-link${router.pathname === item.href ? " active" : ""}`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Nav Actions */}
            <div className="nav-actions">
              <button
                className="btn-icon search-toggle"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Search"
              >
                <i className="fas fa-search" />
              </button>
              <button
                className="btn-icon cart-btn"
                onClick={() => setIsCartOpen(true)}
                title="Cart"
              >
                <i className="fas fa-shopping-cart" />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </button>
              <button
                className={`hamburger${isMobileOpen ? " open" : ""}`}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                title="Menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </nav>
        </div>

        {/* Search Bar */}
        <div className={`search-bar${isSearchOpen ? " active" : ""}`}>
          <div className="container">
            <form onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <i className="fas fa-search" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for fans..."
                />
                <button
                  type="button"
                  className="search-close"
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Back to Top */}
      <BackToTop />
    </>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`back-to-top${show ? " show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
    >
      <i className="fas fa-arrow-up" />
    </button>
  );
}
