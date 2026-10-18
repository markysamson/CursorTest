/** Tailwind v4 for `next build --webpack` (EC2 production). Dev uses @tailwindcss/turbopack in next.config. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
