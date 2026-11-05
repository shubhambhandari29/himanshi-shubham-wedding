# Himanshi & Shubham wedding invitation
A responsive, static wedding invitation. No backend, forms, tracking, or stored guest data.

## Local preview
Run `npm run dev` (requires Python 3), then open http://localhost:5173.

## Customise
- Names, story, event details: `index.html`
- Calendar entries and countdown: `script.js`
- Colours and layout: `style.css`
- Couple artwork: `assets/couple.svg` — replace with your own photo/artwork and update the image in `index.html`.

Keertan: 8 February 2027 (time and venue unconfirmed). Cocktail: 9 February 2027 (evening, time unconfirmed). Haldi: 10 February 2027, 10 AM IST. Wedding: 10 February 2027 (night, time unconfirmed). Wedding: Shivpriya Farms, Dehradun. Cocktail: Sky Garden, Jogiwala, Dehradun. Haldi and Keertan venues are unconfirmed. Calendar downloads use all-day date reminders for events without confirmed times. The countdown is to the beginning of the wedding day in IST, not an assumed ceremony time.

Deploy the root folder to any static hosting service or GitHub Pages. No build step required. Google Fonts are optional; local serif/sans-serif fallbacks are provided.

## Photo album
The hero, story, and closing sections now feature the supplied photographs, alongside a ten-photo memories gallery. All photo buttons share one full-screen viewer with previous/next controls, arrow-key navigation, touch swipes, Escape dismissal, and restored keyboard focus. The original uploads are preserved. Images below the opening portrait load lazily; motion follows the visitor's reduced-motion preference. Gallery selections are in `index.html` (`data-photo` and `data-caption`).

## Hosting
Live invitation: https://shubhambhandari29.github.io/himanshi-shubham-wedding/
GitHub Pages publishes `main` from the repository root. Commit and push to update the live site. Only the selected photographs are tracked; unselected JPEG uploads are ignored.

## Mountain redesign
The new invitation has original mountain artwork, large calligraphic names, a clickable three-day calendar, full-width celebration sections, venue and travel cards, responsive navigation, reading progress, and the existing accessible photo album. See `DESIGN_NOTES.md` for artwork provenance and its generation prompt. No guest information is stored.
