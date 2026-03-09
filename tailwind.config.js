/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#00c896', dim: '#00a07a', bg: 'rgba(0, 200, 150, 0.08)' },
        'dark-base': '#0b0f0d',
        'dark-surface': '#111714',
        'dark-surface-2': '#161e1a',
        'dark-border': '#1f2b24',
        'light-base': '#f4f1eb',
        'light-surface': '#ffffff',
        'light-border': '#e5e1d8',
        'light-text': '#0f1710',
        'light-muted': '#6b7280',
        'dark-text': '#f0ede8',
        'dark-muted': '#6b7a72',
        'dark-muted-2': '#4a5550',
        sidebar: '#0d1210',
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '20px' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
