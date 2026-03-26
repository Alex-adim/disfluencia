import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-green-100', 'text-green-800', 'border-green-300', 'bg-green-50',
    'bg-yellow-100', 'text-yellow-800', 'border-yellow-300', 'bg-yellow-50',
    'bg-red-100', 'text-red-800', 'border-red-300', 'bg-red-50',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
