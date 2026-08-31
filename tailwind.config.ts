import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: "#0a0a09",
          soft: "#141412",
          line: "#2a2a26",
        },
        ivoire: {
          DEFAULT: "#f6f2ea",
          soft: "#efe9dd",
          muted: "#e6ded0",
        },
        bronze: {
          DEFAULT: "#b08d5b",
          soft: "#c7a875",
          faint: "#8a6f47",
        },
      },
      fontFamily: {
        serif: ["var(--font-editorial)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
        widest3: "0.5em",
      },
      maxWidth: {
        content: "1600px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1s cubic-bezier(0.19, 1, 0.22, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
