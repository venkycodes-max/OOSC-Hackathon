/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2340",      // primary dark navy
        paper: "#EEF1F6",    // cool paper background (not the generic warm cream)
        gold: "#D9A441",     // wayfinding accent
        moss: "#4C7A5E",     // mastered / success
        rust: "#B5533C",     // weak topic / alert
        slate: "#5B6478",    // muted text
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
