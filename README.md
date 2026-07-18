# Shane Janney — Portfolio

A beautiful, responsive, gallery-style portfolio website showcasing creative work.

## Features
- **Minimalist Aesthetic:** Clean, typography-focused design using Helvetica Neue.
- **Dynamic Interactions:** Custom mouse-follow cursor glow and subtle staggered entrance animations.
- **Live Location & Time:** Automatically fetches the user's current city and local time on the top right.
- **Responsive Layout:** Beautifully scales and adjusts for tablets and mobile devices.
- **Zero Dependencies:** Built entirely with plain HTML, CSS, and JavaScript.

## Setup & Local Development
Since this project uses plain HTML, CSS, and JS, you can run it using any local web server.

Using Python (Mac/Linux default):
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

## Deployment
This website is completely static and ready to be deployed for free on any modern hosting provider:
1. **Vercel / Netlify / Cloudflare Pages:** Simply drag and drop the root folder into their dashboard, or connect this GitHub repository and it will deploy instantly.
2. **GitHub Pages:** You can enable GitHub Pages in your repository settings to host directly from the `main` branch.

## Adding Content
- **Images:** Add your photos to the `assets/images/` directory.
- **Pages:** Create new HTML pages (like `work.html` or `bio.html`) in the root directory and link them in the `<nav>` section of `index.html`.
