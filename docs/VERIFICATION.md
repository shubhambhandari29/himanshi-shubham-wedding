# Verification and content review

## Reference reviewed

The supplied screen recording is 73.03 seconds long, 512 × 1112 pixels, at 30 fps. Frames at 3, 5, 8, and 12 seconds show the pale mint/aqua and peach water scene, side lotus clusters, a flower-filled wooden boat moving from a diagonal lower-left position to upright near the centre, and staggered welcome text. Frames at 18 and 25 seconds show three champagne scratch cards and the blush framed formal invitation. The 35-second frame shows a portrait carousel with arched frames and calligraphic headings; the 50- and 70-second frames show travel and WhatsApp RSVP sections.

The implementation uses original artwork with a consistent watercolour style, the project's own photos, and Himanshi and Shubham's details. No reference-site artwork, audio, names, or family information were copied.

## Automated checks

Run `npm run check`. All **24 tests passed** in this session. They cover:

1. Opening idle → sailing → revealed state; tap ripple; immediate skip; no replay on family changes.
2. Static, fully revealed opening for reduced-motion visitors.
3. Progressive erasure of **real canvas pixels**, automatic completion at the configured threshold, and the reveal-date alternative.
4. Partial masks and fully revealed cards surviving resize; high-density canvas/pointer alignment; fallback when canvas is unavailable.
5. Groom/bride direct links, switching, preserved unrelated query parameters, history navigation, consistent RSVP options, retained keyboard focus, and one shared wedding.
6. No assumed family allocation, maps for unconfirmed venues, or calendar files for undated functions.
7. Correct all-day wedding calendar export with the venue and an explicit unconfirmed-time note.
8. The date-only countdown in IST and a post-date celebratory message.
9. Gallery scrolling, lightbox next/previous wrapping, keyboard navigation, horizontal versus vertical touch gestures, close, and focus restoration.
10. RSVP required fields and function selection, per-family retained choices, per-function counts, correct message contents, and exclusion of the other family's functions.
11. Clipboard-copy and selectable-text fallback.
12. Encoded WhatsApp drafts opened only on an explicit submission, with a test fixture contact; no message is actually sent.
13. Bounded guest-count controls.
14. Optional music hidden when unconfigured, no autoplay, explicit play/pause behaviour, and a rejected-playback fallback with test fixtures.
15. Mobile-menu state, all image/anchor references, unique IDs, no RSVP network submission or browser storage, and stylesheet syntax.

The served local page, styles, scripts, both opening layers and all ten selected photographs were verified over HTTP (16 resources). Original photos remain unchanged and lazy-load below the opening. The two active opening WebP layers are approximately 324 KB and 418 KB, compared with around 4 MB combined PNG originals. Text and helper colours were reviewed for contrast; decorative borders and disabled states intentionally remain softer.

## Browser checks still required

The in-app Browser connection reports no available browsers in this session. DOM/native-canvas tests do **not** verify real layout, animation appearance, native scroll behaviour, or browser-specific rendering. Before publication, review the local preview on:

- iPhone Safari at 320–430 CSS-pixel widths: touch scratch, ordinary scrolling outside the cards, soft keyboard, native selects, date reveal after orientation change, album swipe, modal sizing and focus.
- Android Chrome: the same touch/resize interactions, clipboard permission fallback, and WhatsApp handoff.
- Desktop Chrome/Safari/Firefox: entrance pacing, pointer scratching, tab navigation, native dialog focus, Escape, and reduced-motion settings.

CSS includes layouts down to 320 px, normal page scrolling outside the scratch canvases, minimum 44 px touch controls for the important actions, flexible form controls, and horizontal overflow confined to the intentional album track. Actual no-overflow and appearance checks remain pending a visual browser preview.

## Missing inputs

- Family assignment for the already supplied Keertan, Cocktail and Haldi facts.
- Separate dates, times, venues and optional dress codes for both families' pre-wedding functions.
- Exact wedding time; countdown and calendar currently save the confirmed date, not an assumed ceremony time.
- Family member names and relationships.
- Verified WhatsApp contact for each family.
- Exact venue street address, accommodation/arrival information, if desired.
- A suitable licensed music file, title, and licence information if music is wanted.

The preview was prepared locally first. On 12 November 2026 the user explicitly requested pushing and deploying it through the existing GitHub Pages configuration.


## Illustrated timeline revision

See [CELEBRATIONS.md](CELEBRATIONS.md) for the frame-by-frame reference review and current visual verification status. Five additional tests cover the alternating layout structure, miniatures, chronological date/time sorting, calendar eligibility, scroll-progress logic, staged entrance animations, and missing-art fallback. A rendered 390px screenshot remains pending because no Browser connection is available.
