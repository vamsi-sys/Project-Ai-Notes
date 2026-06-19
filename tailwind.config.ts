import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — deep ink + electric violet accent
        ink: {
          50:  "#f0f0f8",
          100: "#e0e0f0",
          200: "#c0c1e2",
          300: "#9a9bce",
          400: "#7374b8",
          500: "#5253a2",
          600: "#3e3f82",
          700: "#2c2d60",
          800: "#1a1b3d",
          900: "#0e0f22",
          950: "#07080f",
        },
        violet: {
          50:  "#f4f0ff",
          100: "#ede5ff",
          200: "#dcceff",
          300: "#c4a8ff",
          400: "#a878ff",
          500: "#8b47ff",
          600: "#7a28f7",
          700: "#6817e3",
          800: "#5512bf",
          900: "#47109c",
          950: "#2a0669",
        },
        teal: {
          50:  "#effffe",
          100: "#c7fffd",
          200: "#90fffc",
          300: "#51f6f7",
          400: "#1de3e8",
          500: "#04c7ce",
          600: "#069faa",
          700: "#0c7e89",
          800: "#12646f",
          900: "#14525d",
          950: "#063640",
        },
        // Semantic tokens mapped via CSS vars below
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-dark":
          "radial-gradient(at 40% 20%, hsla(265,100%,60%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(265,100%,40%,0.1) 0px, transparent 50%)",
        "mesh-light":
          "radial-gradient(at 40% 20%, hsla(265,100%,90%,0.4) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,80%,0.3) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
