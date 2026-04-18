# NAZM · نَظْم

**Intelligence Hub** — ذكاء يرتّب حياتك.

A bilingual (Arabic / English) productivity hub built with React + Vite + Tailwind and the lucide-react icon set. Ships a single-component system with three views: marketing landing, unified auth, and an analytics dashboard.

## Tech stack

- **Vite** + **React 18** (JSX, no TypeScript)
- **Tailwind CSS 3** with a `nazm-purple` / `nazm-cyan` accent theme
- **lucide-react** icons

## Development

```bash
cd nazm-app
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deployment

Published to GitHub Pages via `.github/workflows/pages.yml`:

- App: `https://<owner>.github.io/<repo>/app/`
- Root redirects to the app.
