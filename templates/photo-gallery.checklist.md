# Photo Gallery Checklist

Use this checklist for a new image-based project detail page.

## Assets

- [ ] Copy source photos from the working folder without modifying the originals.
- [ ] Optimize each image into `assets/images/<gallery-slug>/` with FFmpeg.
- [ ] Confirm every copied file opens correctly and matches the source filename.
- [ ] Record every filename in the gallery script and keep the list in display order.

## Page and interaction

- [ ] Add or update the detail-page entry point and its page-specific gallery script.
- [ ] Use square `object-fit: cover` thumbnails for the layout.
- [ ] Open the selected image in a lightbox using its natural proportions.
- [ ] Support click/touch, Escape, backdrop close, lazy loading, and reduced motion.
- [ ] Bump the image cache version whenever the asset set changes.

## Validation

- [ ] Update the Playwright gallery count and interaction assertion.
- [ ] Run `npm run check` and `git diff --check`.
- [ ] Check one desktop and one narrow mobile viewport for overflow and spacing.
