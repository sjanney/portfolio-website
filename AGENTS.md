# Portfolio Website Development Guide

## Project shape

- This is a static, multi-page portfolio site.
- HTML pages live at the repository root.
- Shared styles live in `assets/css/styles.css`.
- Shared behavior lives in `assets/js/script.js`.
- Page-specific scripts and visual experiments live beside them in `assets/js/`.
- Browser coverage lives in `tests/portfolio.spec.js`.

## Working rules

- Keep the site framework-free unless a change clearly requires one.
- Prefer semantic HTML, shared CSS variables, and small focused JavaScript helpers.
- Treat touch devices and reduced-motion users as first-class experiences.
- Use `transform` and `opacity` for motion whenever possible; avoid layout-triggering animation.
- Keep external APIs optional. A missing geolocation response must never block the page.
- Add or update a Playwright check when changing navigation, responsive behavior, forms, or interactive effects.
- Avoid editing generated artifacts, large media files, or unrelated pages in the same change.

## Local workflow

```bash
npm install
npm run dev
npm run check
```

The local server runs at `http://localhost:8080`. Playwright starts its own server during tests.

## Before handoff

- Run `npm run check`.
- Check at least one narrow mobile viewport and one desktop viewport.
- Confirm there is no horizontal overflow.
- Confirm `prefers-reduced-motion` still produces usable content.
- Keep pull requests focused and describe any browser-only limitations.
