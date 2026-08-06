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

## Reusable photo galleries

- Start from `templates/photo-gallery.config.json` and `templates/photo-gallery.checklist.md` when adding a project gallery.
- Keep source photos outside the repository, then copy optimized JPEGs into `assets/images/<gallery-slug>/`.
- Use FFmpeg for optimization; avoid macOS `sips`, which has previously produced invalid black gallery copies in this project.
- Add the filenames to the page-specific gallery script, bump its image cache version, and update the gallery count assertion in `tests/portfolio.spec.js`.
- Preserve the interaction pattern: square `object-fit: cover` thumbnails, a click-to-open lightbox with natural image proportions, lazy loading, and reduced-motion support.

## Before handoff

- Run `npm run check`.
- Check at least one narrow mobile viewport and one desktop viewport.
- Confirm there is no horizontal overflow.
- Confirm `prefers-reduced-motion` still produces usable content.
- Keep pull requests focused and describe any browser-only limitations.
