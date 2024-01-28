/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {
        colors: {
            "bestmods-1": "#03045E",
            "bestmods-2": "#023E8A",
            "bestmods-3": "#0077B6",
            "bestmods-4": "#0096C7",
            "bestmods-5": "#00B4D8",
            "bestmods-6": "#48CAE4",
            "bestmods-7": "#46494C"
        },
        animation: {
          "menu-left-to-right": "menu-left-to-right 0.5s",
          "menu-right-to-left": "menu-right-to-left 0.5s",
          "fade-out-in": "fade-out-in 1.0s"
        },
        fontFamily: {
            title: ["var(--font-title)"],
            base: ["var(--font-base)"]
        }
    },
  },
  plugins: [],
};
