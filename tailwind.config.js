/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'note-red': '#fef2f2',
        'note-red-accent': '#f87171',
        'note-yellow': '#fefce8',
        'note-yellow-accent': '#facc15',
        'note-green': '#f0fdf4',
        'note-green-accent': '#4ade80',
        'note-blue': '#eff6ff',
        'note-blue-accent': '#60a5fa',
        'note-purple': '#faf5ff',
        'note-purple-accent': '#c084fc',
        'note-orange': '#fff7ed',
        'note-orange-accent': '#fb923c',
        'note-pink': '#fdf2f8',
        'note-pink-accent': '#f472b6',
      }
    },
  },
  plugins: [],
}
