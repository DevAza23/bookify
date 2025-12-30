import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--tg-theme-bg-color, #ffffff)',
        text: 'var(--tg-theme-text-color, #000000)',
        hint: 'var(--tg-theme-hint-color, #999999)',
        link: 'var(--tg-theme-link-color, #2481cc)',
        button: 'var(--tg-theme-button-color, #2481cc)',
        buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
        secondaryBg: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
      },
    },
  },
  plugins: [],
}
export default config

