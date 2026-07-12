/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#1dd4f4", // page background
          900: "#0b70eac0", // card background
          800: "#181C20", // elevated card / hover
          700: "#232830", // borders
          600: "#2E353F",
        },
        sage: {
          400: "#A9B98E", // primary accent - matches wireframe olive tone
          500: "#8FA073",
          600: "#748757",
          900: "#2B331F",
        },
        maroon: {
          400: "#C97575",
          500: "#A24B4B", // alert/conflict tone from wireframes
          900: "#3A1616",
        },
        ink: {
          50: "#F4F5F2",
          200: "#C7CCC3",
          400: "#8B9188",
          600: "#5B615C",
        },
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
