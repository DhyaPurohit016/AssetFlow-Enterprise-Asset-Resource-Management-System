/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#0F172A", // page
          900: "#172033", // cards
          800: "#1E293B", // hover/elevated
          700: "#334155", // borders
        },
        sage: {
          400: "#38BDF8", // primary accent
          500: "#0EA5E9",
          600: "#0284C7",
        },
        maroon: {
          400: "#FCA5A5",
          500: "#EF4444",
          900: "#450A0A",
        },
        ink: {
          50: "#F8FAFC",
          200: "#CBD5E1",
          400: "#94A3B8",
          600: "#64748B",
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
