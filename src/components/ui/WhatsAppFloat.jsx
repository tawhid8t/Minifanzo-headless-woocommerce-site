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
  phoneNumber = "8801700000000",
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
      className="whatsapp-float group"
    >
      <div className="flex items-center gap-2 bg-[#25D366] text-white
                      rounded-full shadow-btn
                      px-4 py-3 sm:py-3.5
                      hover:bg-[#20ba57] transition-all duration-200
                      hover:shadow-xl hover:scale-105 active:scale-95">
        <FaWhatsapp className="w-6 h-6 flex-shrink-0" />
        {/* Label — visible on desktop hover */}
        <span className="hidden sm:block text-sm font-semibold whitespace-nowrap
                         max-w-0 overflow-hidden group-hover:max-w-xs
                         transition-all duration-300 ease-in-out">
          Chat with us
        </span>
      </div>
    </a>
  );
}
