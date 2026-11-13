# Transparent wedding identity

The previous square `assets/logo.png` was opaque cream paper. CSS blending and a radial mask did not consistently remove the square and faded fine details at small sizes. All six displayed logo placements now reference new real-alpha files; the source image remains unchanged.

Two imagegen edits used the supplied logo as reference:

- `logo-emblem.png`: preserve the intertwined S/H initials and existing illustrated frame (peacock, foothills, leaves, phones, laptop, bowl, parasol and eye), remove blank paper outside and inside the frame to actual transparency, strengthen initials to antique bronze, preserve objects and avoid clipping.
- `logo-monogram.png`: retain only the intertwined S/H geometry, with stronger antique bronze strokes and genuine transparent counters/background; omit decorations for clarity at small sizes.

Display derivatives preserve alpha: `logo-emblem.webp` at 800 × 800 and `logo-monogram.webp` at 320 × 320. Full emblem is used at 260px desktop / up to 240px mobile in the formal invitation, and 230px / 210px in the closing. Compact monogram is used in the opening corner, sticky header, photo toolbar and footer. No blend mode, fading mask, white backing, crest border or outline remains on logo elements. Photo toolbar brightens the bronze for its dark background.

Both edits and a raster composition on the site's blush and cream backgrounds were visually inspected. Automated checks verify actual transparent corners and substantial transparent blank space in both assets, retained visible artwork, all six image references, no old logo image references, CSS syntax, existing interactions, dates and schedules. Rendered browser layout verification remains unavailable because no preview browser is connected.
