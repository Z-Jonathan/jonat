/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Urgency palette — drives the time-pressure visual language inside
        // the product. Not for brand voice (see PRODUCT.md, Principle 3).
        urgent: '#ef4444', // expiring < 2h
        soon: '#f59e0b', // expiring < 24h
        brand: '#0f172a',
        // Brand voice color: warm cream that reads as paper/ink on the dark
        // surface. Used for display type on landing / marketing surfaces.
        paper: '#f7eedd',
      },
    },
  },
  plugins: [],
};
