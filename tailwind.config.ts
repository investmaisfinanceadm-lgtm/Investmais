import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0A1628",
                    50: "#e8edf4",
                    100: "#c5d0e0",
                    200: "#9fb1cb",
                    300: "#7892b5",
                    400: "#547aa7",
                    500: "#305f9a",
                    600: "#244d8a",
                    700: "#163b77",
                    800: "#092863",
                    900: "#0A1628",
                    950: "#060e1a",
                },
                gold: {
                    DEFAULT: "#C9A84C",
                    50: "#fdf9ee",
                    100: "#f8efcc",
                    200: "#f1de99",
                    300: "#e8c85e",
                    400: "#C9A84C",
                    500: "#b8922e",
                    600: "#9e7520",
                    700: "#7e591b",
                    800: "#69491b",
                    900: "#5b3e1a",
                },
                dark: {
                    DEFAULT: "#0A1628",
                    card: "#0f1e35",
                    border: "#1a2d4a",
                    muted: "#162236",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-primary":
                    "linear-gradient(135deg, #0A1628 0%, #162236 50%, #0f1e35 100%)",
                "gradient-gold":
                    "linear-gradient(135deg, #C9A84C 0%, #e8c85e 50%, #C9A84C 100%)",
            },
            boxShadow: {
                gold: "0 0 20px rgba(201, 168, 76, 0.15)",
                "gold-lg": "0 0 40px rgba(201, 168, 76, 0.25)",
                card: "0 4px 24px rgba(0, 0, 0, 0.3)",
                "card-hover": "0 8px 40px rgba(0, 0, 0, 0.4)",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-gold": "pulseGold 2s ease-in-out infinite",
                shimmer: "shimmer 2s linear infinite",
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
            },
        },
    },
    plugins: [],
};
export default config;
