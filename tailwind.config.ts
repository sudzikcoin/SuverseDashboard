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
        brand: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        'su-base': '#0B1220',
        'su-card': '#0F172A',
        'su-text': '#EAF2FB',
        'su-muted': '#AFC3D6',
        'su-emerald': '#34D399',
        'su-emerald-700': '#059669',
        'su-sky': '#38BDF8',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
