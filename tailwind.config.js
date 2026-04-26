/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'media', // Uses system color scheme automatically
  theme: {
    extend: {
      colors: {
        text: 'var(--color-text)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: {
          DEFAULT: 'var(--color-background)',
          element: 'var(--color-background-element)',
          selected: 'var(--color-background-selected)',
        },
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
      },
      spacing: {
        'half': '2px',
        'one': '4px',
        'two': '8px',
        'three': '16px',
        'four': '24px',
        'five': '32px',
        'six': '64px',
        'eight': '128px',
      },
    },
  },
  plugins: [],
}