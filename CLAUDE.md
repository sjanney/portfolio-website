# Claude Context

This repository is a static HTML/CSS/JavaScript portfolio. Read `AGENTS.md` before making changes; it contains the project map, coding conventions, responsive-motion requirements, and validation workflow.

The quickest useful commands are:

```bash
npm run dev
npm run check
```

Keep changes focused, preserve the framework-free architecture, and update `tests/portfolio.spec.js` when behavior changes.

For photo-based project pages, use `templates/photo-gallery.config.json` as the starting shape and follow `templates/photo-gallery.checklist.md`. The Slawn gallery is the reference implementation: optimized assets live under `assets/images/slawn/`, filenames are listed in `assets/js/slawn-gallery.js`, and thumbnail/lightbox behavior is shared through `assets/css/styles.css`.
