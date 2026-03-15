import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WHO Brand Colors
        "hc-navy": "#1A2B4A",
        "hc-cyan": "#009ADE",
        "hc-light-gray": "#F5F7FB",
        "hc-dark-gray": "#374151",
        
        // Neumorphic Palette
        "neu-bg": "var(--neu-bg)",
        "neu-elevation": "var(--neu-elevation)",
        "neu-emboss": "var(--neu-emboss)",
        "neu-shadow-dark": "var(--neu-shadow-dark)",
        "neu-shadow-light": "var(--neu-shadow-light)",
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        full: "9999px",
      },
      boxShadow: {
        // Neumorphic shadows
        "neu-inset": "inset 2px 2px 5px #e3e7f3, inset -2px -2px 5px #ffffff",
        "neu-outset": "2px 2px 5px #e3e7f3, -2px -2px 5px #ffffff",
        "neu-sm": "1px 1px 3px #e3e7f3",
        "neu-md": "2px 2px 8px rgba(0,0,0,0.1)",
      },
      spacing: {
        "4.5": "18px",
        "5.5": "22px",
        "13": "52px",
        "15": "60px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
