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
        // Urgency palette — drives the time-pressure visual language.
        urgent: '#ef4444', // expiring < 2h
        soon: '#f59e0b', // expiring < 24h
        brand: '#0f172a',
      },
    },
  },
  plugins: [],
};
