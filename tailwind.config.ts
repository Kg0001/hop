import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vitBlue: '#1E40AF',
        vitBlueLight: '#3B82F6',
        vitBlueDark: '#1E3A8A',
        vitGrey: '#F8FAFC',
        vitBorder: '#E2E8F0',
      },
      boxShadow: {
        card: '0 6px 24px rgba(0, 0, 0, 0.06)',
      },
      maxWidth: {
        screenMobile: '640px',
      },
    },
  },
  plugins: [],
};

export default config;
