/**
 * components/ui/WhatsAppFloat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating WhatsApp button — MiniFanzo
 * Very common on Bangladeshi e-commerce sites.
 *
 * Props:
 *   phoneNumber {string}  — e.g. "8801700000000" (country code, no +)
 *   message     {string}  — pre-filled message (optional)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppFloat({
  phoneNumber = "8801788039222",
  message     = "Hello! I'm interested in your mini fans.",
}) {
  const encodedMsg = encodeURIComponent(message);
  const href       = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-float"
    >
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-label">Chat with us</span>
    </a>
  );
}
