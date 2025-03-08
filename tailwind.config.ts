import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        scaleIn: {
          '0%': { 
            transform: 'translate(20%, 20%) scale(0.9)',
            opacity: '0',
            transformOrigin: 'bottom right'
          },
          '100%': { 
            transform: 'translate(0%, 0%) scale(1)',
            opacity: '1',
            transformOrigin: 'bottom right'
          },
        }
      },
      animation: {
        scaleIn: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
