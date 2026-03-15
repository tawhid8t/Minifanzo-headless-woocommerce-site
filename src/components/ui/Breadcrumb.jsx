/**
 * components/ui/Breadcrumb.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Breadcrumb navigation — MiniFanzo
 *
 * Renders accessible breadcrumbs with structured data (JSON-LD) for SEO.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "Home",  href: "/" },
 *     { label: "Shop",  href: "/shop" },
 *     { label: "Neck Fan" }  ← current page (no href)
 *   ]} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { FiChevronRight, FiHome } from "react-icons/fi";

export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  // Build JSON-LD structured data for Google breadcrumb rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type":    "ListItem",
      position:   index + 1,
      name:       item.label,
      item:       item.href ? `${process.env.NEXT_PUBLIC_SITE_URL || ""}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* ── Structured Data ────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Visual Breadcrumb ──────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="py-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1">
                {/* Separator (not shown for first item) */}
                {index > 0 && (
                  <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}

                {isLast ? (
                  // Current page — not a link, visually distinct
                  <span
                    aria-current="page"
                    className="text-primary font-medium truncate max-w-[200px]"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Link item
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
                  >
                    {/* Home icon for first item */}
                    {index === 0 && <FiHome className="w-3.5 h-3.5" />}
                    <span className="hover:underline">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
