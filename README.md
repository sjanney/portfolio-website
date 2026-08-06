# Shane Janney — Portfolio

A beautiful, responsive, gallery-style portfolio website showcasing creative work.

## Features
- **Minimalist Aesthetic:** Clean, typography-focused design using Helvetica Neue.
- **Dynamic Interactions:** Custom mouse-follow cursor glow and subtle staggered entrance animations.
- **Live Location & Time:** Automatically fetches the user's current city and local time on the top right.
- **Responsive Layout:** Beautifully scales and adjusts for tablets and mobile devices.
- **Framework-Free:** Built with plain HTML, CSS, and JavaScript, with React/Motion available for isolated experiments.

## Setup & Local Development

Install the development dependencies once:

```bash
npm install
```

Start the local site with:

```bash
npm run dev
```

Then visit `http://localhost:8080` in your browser. The site needs a local server because several browser features and relative asset paths do not work reliably from `file://` URLs.

## Checks and Tests

Run the JavaScript syntax checks and the Playwright suite together:

```bash
npm run check
```

Useful focused commands:

```bash
npm run check:js       # Validate shared JavaScript syntax
npm test               # Run the browser suite
npm run test:headed    # Run Playwright with a visible browser
npm run test:mobile    # Run the mobile overflow smoke test
```

Playwright starts its own `python3` server on port `8080` through `playwright.config.js`.

## Project Map

| Path | Purpose |
| --- | --- |
| `index.html` | Full-screen home/hero page |
| `work.html` | Scrollable creative work gallery |
| `contact.html` | Contact form and interactive card |
| `assets/css/styles.css` | Shared layout, responsive rules, and motion |
| `assets/js/script.js` | Shared navigation, motion, location, and form behavior |
| `assets/js/grainient.js` | Footer canvas effect |
| `tests/portfolio.spec.js` | Navigation, page, form, and mobile checks |

Read `AGENTS.md` for the project conventions used when adding pages or changing interactions.
Then visit `http://localhost:8080` in your browser.

## Deployment
This website is completely static and ready to be deployed for free on any modern hosting provider:
1. **Vercel / Netlify / Cloudflare Pages:** Connect this GitHub repository and deploy the repository root as a static site.
2. **GitHub Pages:** Enable Pages from the repository's `master` branch (or configure the Actions workflow if the repository uses Actions-based deployment).

## Adding Content
- **Images:** Add your photos to the `assets/images/` directory.
- **Pages:** Create new HTML pages (like `work.html` or `bio.html`) in the root directory and link them in the `<nav>` section of `index.html`.
