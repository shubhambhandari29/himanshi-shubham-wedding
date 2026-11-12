# Himanshi & Shubham — an invitation on the water

A static, mobile-first wedding invitation, with an animated flower boat, independent watercolour lotus layers, a real scratch-to-reveal date, a framed invitation, family-specific celebrations, a swipeable album, an IST countdown, venue/travel cards, and a WhatsApp draft builder. No backend, guest database, tracking, or stored RSVP data.

## Local preview

```sh
npm run dev
```

Open **http://localhost:5173**. Python 3 is required for the lightweight preview server; there is no build step. For a family-specific preview:

- http://localhost:5173/?side=groom
- http://localhost:5173/?side=bride

GitHub Pages serves the invitation from `main`. Live website: https://shubhambhandari29.github.io/himanshi-shubham-wedding/ . The local preview is available for future edits before publication.

## Editable content

`content.js` is the single source for events, family contacts, verified family members, story paragraphs, captions, photos, optional licensed music, and animation settings.

- Shared wedding: **10 February 2027**, **Shivpriya Farms, Dehradun**, at night. Exact time is unconfirmed.
- The bride's and groom's Cocktail and Haldi dates, times, and venues are deliberately `null` until their separate information is supplied. Unknown facts display “To be announced”. No maps/calendar actions are offered for unavailable facts.
- Prior facts remain in a clearly labelled disclosure, awaiting family allocation: Keertan on 8 February; Cocktail on 9 February at Sky Garden, Jogiwala, Dehradun; Haldi on 10 February at 10 AM IST. They are not assigned to either family or offered as family-specific RSVP options.
- Family members and relationships are empty until verified. Accommodation and exact street addresses have not been invented. Dress details remain unconfirmed.
- Add confirmed contacts as international digits (e.g. an Indian phone number prefixed with `91`). Until then, the WhatsApp action is disabled and the copy-reply option remains available.
- Music is hidden until both a suitable `music.src` and licence information are configured. It never autoplays.
- Ambient motion, intro duration, scratch brush size, and the completion threshold are adjustable. All motion respects reduced-motion preferences.

The opening and scratch state remain in memory during page navigation. RSVP selections are retained per function while switching family views, without browser storage. Reloading starts a new visit.

## RSVP privacy and behaviour

Guests enter their name, choose functions, set a count for each, and optionally add a note. The site validates the draft locally. “Send on WhatsApp” opens an encoded message for the selected family; the guest reviews and sends it in WhatsApp. The website itself does not submit replies. Missing/denied clipboard access falls back to a visible, selectable message. Tests never send an RSVP.

## Verification

```sh
npm install
npm run check
```

Development dependencies are used only for verification: Node's test runner, jsdom, a native canvas for real pixel erasure tests, and a CSS parser. The invitation has no runtime package dependencies.

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the tested behaviours and remaining physical-browser checks. Artwork provenance, the generation prompts, and active asset paths are in [docs/ARTWORK.md](docs/ARTWORK.md).

## Files

- `index.html`: accessible invitation structure and static fallbacks
- `style.css`: watercolour design, motion, reduced-motion and narrow-screen layouts
- `script.js`: opening, scratch canvases, event rendering, album, countdown, calendars, RSVP and optional music
- `content.js`: editable content and confirmed facts
- `assets/`: original photos/artwork plus lightweight transparent WebP artwork
- `tests/invitation.test.cjs`: reproducible interaction and integrity checks

Existing hosting: https://shubhambhandari29.github.io/himanshi-shubham-wedding/ . The user explicitly authorized publishing this revision on 12 November 2026. Future publishing should follow the scope of the current request. GitHub Pages serves `main` from the repository root. The existing GitHub Pages hosting configuration is reused.

## Illustrated celebrations revision
The celebration cards have been replaced by a continuous, alternating illustrated timeline on the blush background. The four original circular watercolour scenes are in `assets/events/`; `content.js` maps each function to its illustration. Both family views include the shared wedding in date/time order. Timeline calendar actions require a confirmed time; the date section retains its date-only reminder. See [docs/CELEBRATIONS.md](docs/CELEBRATIONS.md) for the reviewed recording frames, asset paths and prompts, responsive behaviour, 24 passing checks, and the outstanding 390px visual screenshot comparison.

Jump straight to the preview: http://localhost:5173/#celebrations . This revision is included in the GitHub Pages publication.
