/**
 * tailwind.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MiniFanzo — Tailwind CSS Configuration
 *
 * Extends Tailwind with MiniFanzo brand tokens:
 *   - Custom color palette
 *   - Custom font families
 *   - Additional border radius, box shadows
 *   - Animation utilities
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ── Content paths — Tailwind scans these files for class names ────────────
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── Brand Colors ───────────────────────────────────────────────────────
      colors: {
        // 60% — Base/Background
        base:    "#ECF0EF",

        // 30% — Primary green
        primary: {
          DEFAULT: "#005840",
          dark:    "#003d2c",
          light:   "#007a5c",
          50:      "#e6f5ef",
          100:     "#b3ddd0",
          200:     "#80c4b0",
          300:     "#4dac90",
          400:     "#1a9470",
          500:     "#005840",
          600:     "#004d38",
          700:     "#003d2c",
          800:     "#002e21",
          900:     "#001f16",
        },

        // 10% — Accent lime
        accent: {
          DEFAULT: "#D1F843",
          dark:    "#aed623",
          light:   "#e2fb7b",
          50:      "#f7ffd9",
          100:     "#eeffa3",
          200:     "#e4ff6d",
          300:     "#D1F843",
          400:     "#aed623",
          500:     "#8bb400",
        },
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        // heading: Poppins
        heading: ["'Poppins'", "sans-serif"],
        // body: Inter
        body:    ["'Inter'", "sans-serif"],
        // default sans (Tailwind's 'font-sans' will use Inter)
        sans:    ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      // ── Font sizes ─────────────────────────────────────────────────────────
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1" }], // 10px
      },

      // ── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        card:     "0 2px 16px rgba(0,88,64,0.08)",
        "card-hover": "0 8px 32px rgba(0,88,64,0.16)",
        btn:      "0 4px 14px rgba(0,88,64,0.30)",
        "btn-accent": "0 4px 14px rgba(209,248,67,0.50)",
        modal:    "0 20px 60px rgba(0,0,0,0.3)",
      },

      // ── Custom Keyframe Animations ──────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,88,64,0.4)" },
          "70%":       { boxShadow: "0 0 0 8px rgba(0,88,64,0)" },
        },
        "scale-in": {
          "0%":   { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
      },
      animation: {
        "fade-in":        "fade-in 0.3s ease forwards",
        "slide-right":    "slide-in-right 0.3s ease forwards",
        "slide-out-right":"slide-out-right 0.3s ease forwards",
        "slide-up":       "slide-in-up 0.4s ease forwards",
        "pulse-green":    "pulse-green 2s infinite",
        "scale-in":       "scale-in 0.2s ease forwards",
      },

      // ── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        "18":  "4.5rem",
        "72":  "18rem",
        "80":  "20rem",
        "88":  "22rem",
        "96":  "24rem",
        "128": "32rem",
      },

      // ── Z-index ────────────────────────────────────────────────────────────
      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },

      // ── Max Width ──────────────────────────────────────────────────────────
      maxWidth: {
        "8xl": "88rem",   // 1408px
        "9xl": "96rem",   // 1536px
      },
    },
  },

  plugins: [],
};
