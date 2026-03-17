/**
 * components/layout/Footer.jsx — MiniFanzo
 * Exact design match to original HTML/CSS/JS site
 */

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const defaultLogo = "https://minifanzo.com/wp-content/uploads/2026/03/logo-2-1.png";
  const [logoUrl, setLogoUrl] = useState(defaultLogo);

  useEffect(() => {
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
  }, []);

  function handleNewsletter() {
    if (email && email.includes("@")) {
      setEmail("");
      // toast handled at app level — just reset
    }
  }

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col brand-col">
              <img
                src={logoUrl}
                alt="MiniFanzo"
                className="footer-logo"
              />
              <p>
                Bangladesh&apos;s #1 portable mini fan store. We bring premium cooling products from
                China, made affordable for every Bangladeshi.
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/minifanzo" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" /></a>
                <a href="#"><i className="fab fa-instagram" /></a>
                <a href="https://wa.me/8801788039222" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /></a>
                <a href="#"><i className="fab fa-youtube" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/#home">Home</a></li>
                <li><a href="/#products">Products</a></li>
                <li><a href="/#features">Why Choose Us</a></li>
                <li><a href="/#about">About Us</a></li>
                <li><a href="/#contact">Contact</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                <li><Link href="/shop?category=neck">Neck Fans</Link></li>
                <li><Link href="/shop?category=desk">Desk Fans</Link></li>
                <li><Link href="/shop?category=handheld">Handheld Fans</Link></li>
                <li><Link href="/shop?category=clip">Clip-on Fans</Link></li>
                <li><Link href="/shop">New Arrivals</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className="footer-col">
              <h4>Policies</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">Shipping Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-col newsletter-col">
              <h4>Stay Updated</h4>
              <p>Subscribe to get deals, new arrivals &amp; cooling tips.</p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button className="btn-subscribe" onClick={handleNewsletter}>
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
              <div className="payment-icons">
                <span className="payment-badge"><i className="fas fa-mobile-alt" /> bKash</span>
                <span className="payment-badge"><i className="fas fa-mobile-alt" /> Nagad</span>
                <span className="payment-badge"><i className="fas fa-credit-card" /> Card</span>
                <span className="payment-badge"><i className="fas fa-money-bill" /> COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © 2026 MiniFanzo. All rights reserved. Made with{" "}
            <i className="fas fa-heart" style={{ color: "#D1F843" }} /> in Bangladesh
          </p>
          <p>Product No: YS-2522 &amp; more | Imported from China</p>
        </div>
      </div>
    </footer>
  );
}
