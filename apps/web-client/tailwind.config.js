/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "neo-mint": "#bef264",
        "neo-lavender": "#d8b4fe",
        "neo-coral": "#fda4af",
        "neo-black": "#000000",
        "on-secondary": "#67001b",
        "on-surface-variant": "#bbcabf",
        "tertiary-fixed": "#e9ddff",
        "on-tertiary-fixed-variant": "#5516be",
        "background": "#0f172a",
        "on-primary": "#003824",
        "surface-bright": "#31394d",
        "on-secondary-container": "#ffc2c4",
        "surface-container": "#1e293b",
        "surface-dim": "#0b1326",
        "on-tertiary": "#3c0091",
        "primary-fixed": "#6ffbbe",
        "tertiary-fixed-dim": "#d0bcff",
        "secondary-fixed-dim": "#ffb2b7",
        "error-container": "#93000a",
        "tertiary-container": "#b090ff",
        "surface-tint": "#4edea3",
        "primary": "#4edea3",
        "error": "#ffb4ab",
        "surface-container-lowest": "#020617",
        "on-secondary-fixed": "#40000d",
        "tertiary": "#d0bcff",
        "outline-variant": "#3c4a42",
        "secondary-fixed": "#ffdadb",
        "surface-container-low": "#0f172a",
        "primary-fixed-dim": "#4edea3",
        "on-primary-fixed": "#002113",
        "on-secondary-fixed-variant": "#92002a",
        "inverse-primary": "#006c49",
        "inverse-surface": "#dae2fd",
        "outline": "#86948a",
        "on-primary-container": "#00422b",
        "on-surface": "#dae2fd",
        "inverse-on-surface": "#283044",
        "on-primary-fixed-variant": "#005236",
        "on-error": "#690005",
        "surface-container-highest": "#334155",
        "on-background": "#f8fafc",
        "secondary": "#ffb2b7",
        "on-tertiary-container": "#4600a7",
        "secondary-container": "#b50036",
        "surface-container-high": "#1e293b",
        "on-error-container": "#ffdad6",
        "surface-variant": "#334155",
        "primary-container": "#10b981",
        "on-tertiary-fixed": "#23005c",
        "surface": "#1e293b"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "max-width": "1400px",
        "base": "8px",
        "margin-desktop": "32px",
        "gutter": "24px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "label-mono": ["JetBrains Mono", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "score-display": ["VT323", "monospace"],
        "headline-lg-mobile": ["Oswald", "sans-serif"],
        "display-xl": ["Oswald", "sans-serif"],
        "headline-lg": ["Oswald", "sans-serif"]
      },
      fontSize: {
        "label-mono": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "700" }],
        "body-md": ["18px", { lineHeight: "28px", fontWeight: "500" }],
        "score-display": ["64px", { lineHeight: "64px", fontWeight: "400" }],
        "headline-lg-mobile": ["32px", { lineHeight: "40px", fontWeight: "700", textTransform: "uppercase" }],
        "display-xl": ["80px", { lineHeight: "88px", letterSpacing: "-0.02em", fontWeight: "700", textTransform: "uppercase" }],
        "headline-lg": ["40px", { lineHeight: "48px", fontWeight: "700", textTransform: "uppercase" }]
      }
    }
  },
  plugins: [],
}
