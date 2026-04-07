import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0A192F",
                    50: "#f0f2f5",
                    100: "#dadddf",
                    200: "#b5bbc1",
                    300: "#8f99a3",
                    400: "#6a7785",
                    500: "#455567",
                    600: "#364352",
                    700: "#27313c",
                    800: "#181f27",
                    900: "#090d11",
                    950: "#050608",
                },
                accent: {
                    DEFAULT: "#2563EB",
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                gold: {
                    DEFAULT: "#DAAF37",
                    50: "#fdfbed",
                    100: "#f8f3cc",
                    200: "#f1e499",
                    300: "#e8d15e",
                    400: "#daaf37",
                    500: "#c7982e",
                    600: "#aa7a24",
                    700: "#885d1f",
                    800: "#714c1e",
                    900: "#61401c",
                },
                dark: {
                    DEFAULT: "#0A192F",
                    card: "#131B2B",
                    border: "#1E293B",
                    muted: "#0F172A",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-primary":
                    "linear-gradient(135deg, #0A192F 0%, #131B2B 100%)",
                "gradient-accent":
                    "linear-gradient(135deg, #2563EB 0%, #1e3a8a 100%)",
                "gradient-gold":
                    "linear-gradient(135deg, #DAAF37 0%, #e8d15e 50%, #DAAF37 100%)",
            },
            boxShadow: {
                accent: "0 0 20px rgba(37, 99, 235, 0.20)",
                "accent-lg": "0 0 40px rgba(37, 99, 235, 0.35)",
                card: "0 4px 24px rgba(0, 0, 0, 0.3)",
                "card-hover": "0 8px 40px rgba(0, 0, 0, 0.4)",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-gold": "pulseGold 2s ease-in-out infinite",
                shimmer: "shimmer 2s linear infinite",
                "scale-in": "scaleIn 0.25s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseGold: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.15)" },
                    "50%": { boxShadow: "0 0 40px rgba(201, 168, 76, 0.35)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
