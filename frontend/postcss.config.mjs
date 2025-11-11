const config = {
  // Usar '@tailwindcss/postcss' en entornos como Turbopack/Next.js 15+ con
  // Tailwind v4, que expone el plugin PostCSS separado.
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
