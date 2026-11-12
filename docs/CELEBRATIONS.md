# Illustrated celebrations timeline

## Reference reviewed

The attached recording was inspected frame by frame at 34–45 seconds. Frames 34–37 show the transition from the album to the heading; frames 38–40 show the alternating scenes and event details; frames 41–43 show the final wedding entry, line ending, and lotus-leaf accent. Frames 39 and 40 were reviewed individually at full resolution.

The reference's composition uses a thin champagne centre line, small pink floral markers, circular garden miniatures, calligraphic times, readable serif function names, Hindi names, and very light italic venue/actions. It renders directly on dusty pink paper without card borders. The local design now follows that arrangement, with actual original miniature assets and an alternating illustration/text grid at 390 CSS pixels. Below 360 CSS pixels, the content switches to a single spacious column with the spine along its side.

## Original artwork

Created using the built-in image generation tool. These are decorative interpretations of the functions, not illustrations of the actual venues. Original PNG masters are preserved in the same folder. The active assets are 640 × 640 transparent WebP images, approximately 188–208 KB each, lazy-loaded on the page.

- `assets/events/keertan.webp`: devotional garden, flowers, cushions, book stand and diyas.
- `assets/events/cocktail.webp`: evening garden, lounge seating, lanterns and fairy lights.
- `assets/events/haldi.webp`: marigold canopy, yellow cushions and turmeric bowls.
- `assets/events/wedding.webp`: ivory floral mandap in a lotus garden.

No Mehendi event exists in the project, so none was added. Keertan remains in the unassigned-events disclosure with its own artwork until its family allocation is confirmed. Missing future illustration types explicitly display “Illustration to be added”; no generic symbol is silently substituted.

## Content and interaction

Both family views include their own Cocktail and Haldi plus exactly one shared wedding in the continuous timeline. Confirmed dates and times determine ordering; undated entries are clearly labelled as awaiting a date. No family-specific dates, times or venues were invented. “Time to be announced” remains prominent for unconfirmed times. The wedding also retains its known night-time context and confirmed venue.

The timeline's calendar actions appear only for events with both a confirmed date and time. The separate scratch-date section still offers its clearly labelled date-only wedding reminder.

An IntersectionObserver reveals each illustration with a slight 10px entrance, then its text 150ms afterwards. The spine fills according to reading position. Reduced-motion mode shows everything immediately and keeps the spine fully visible. Switching family updates this timeline without replaying the introduction, preserves keyboard focus, and retains RSVP choices.

## Verification and preview

Run `npm run check`. All 24 tests pass, including alternating positions, scene assets, one shared wedding, confirmed date/time sorting, calendar eligibility, scroll progress, animation sequencing, reduced motion, and explicit missing-art labels, plus all previous invitation checks.

Local preview: http://localhost:5173/#celebrations . Family links: http://localhost:5173/?side=groom#celebrations and http://localhost:5173/?side=bride#celebrations . The user authorized pushing and deploying this revision on 12 November 2026.

**Visual capture limitation:** the Browser runtime reports no connected browsers. A real 390px screenshot of the rendered section could not be captured or compared against the recording in this session. Artwork was visually inspected directly; CSS syntax, image references and interaction logic were checked, but those are not substitutes for a rendered mobile comparison. The requested screenshot and physical Safari/Chrome visual checks remain pending.

## Generation prompts

### Keertan

Use case: illustration-story. Asset type: detailed miniature scene for an Indian wedding invitation's alternating illustrated timeline. A single circular garden diorama seen from above at a gentle 3/4 overhead angle, with a soft organic scalloped botanical perimeter, painted in refined miniature watercolour and gouache on paper, charming very fine decorative details, consistent muted sage and deep leaf green foliage, lotus pink flowers, dusty blush, muted champagne gold and warm cream. Transparent exterior background. Fill most of a square canvas with the complete circular scene, with a small transparent margin, no text, no lettering, no people, no modern 3D rendering, no picture frame, no shadow outside the circular scene. The scene must remain legible as a 150-pixel circular illustration. Not an icon, not a symbol, not an asset sheet. Subject: a serene devotional garden setting, a small cream-and-gold low platform draped in ivory fabric at the back, marigold and pink flower garlands, two brass diya oil lamps with tiny warm flames, an open devotional book resting on a little wooden stand, a ring of pale cushions on a patterned blush rug, lush flowering shrubs and broad lotus leaves around the circular edge. Gentle daylight, peaceful intimate ceremony.

### Cocktail

Use case: illustration-story. Asset type: detailed miniature scene for an Indian wedding invitation's alternating illustrated timeline. A single circular garden diorama seen from above at a gentle 3/4 overhead angle, with a soft organic scalloped botanical perimeter, painted in refined miniature watercolour and gouache on paper, charming very fine decorative details, consistent muted sage and deep leaf green foliage, lotus pink flowers, dusty blush, muted champagne gold and warm cream. Transparent exterior background. Fill most of a square canvas with the complete circular scene, with a small transparent margin, no text, no lettering, no people, no modern 3D rendering, no picture frame, no shadow outside the circular scene. The scene must remain legible as a 150-pixel circular illustration. Not an icon, not a symbol, not an asset sheet. Subject: an intimate evening garden celebration, a round pink sandstone terrace enclosed by flowering greenery and tiny lotus pools, three elegant low lounge seating groups with dusty rose and sage cushions, small tables holding floral arrangements and glasses, fine strings of warm fairy lights between slim garden posts, softly glowing little brass lanterns. Delicate dusky warm lighting, deep but muted greens, no dark black background.

### Haldi

Use case: illustration-story. Asset type: detailed miniature scene for an Indian wedding invitation's alternating illustrated timeline. A single circular garden diorama seen from above at a gentle 3/4 overhead angle, with a soft organic scalloped botanical perimeter, painted in refined miniature watercolour and gouache on paper, charming very fine decorative details, consistent muted sage and deep leaf green foliage, lotus pink flowers, dusty blush, muted champagne gold and warm cream. Transparent exterior background. Fill most of a square canvas with the complete circular scene, with a small transparent margin, no text, no lettering, no people, no modern 3D rendering, no picture frame, no shadow outside the circular scene. The scene must remain legible as a 150-pixel circular illustration. Not an icon, not a symbol, not an asset sheet. Subject: a sunlit yellow floral ceremony garden, a low mustard-and-ivory ceremonial seat beneath a light canopy of cascading marigold garlands, two brass bowls filled with yellow turmeric paste and floating flowers on a cream round patterned rug, pale yellow cushions, small baskets of marigolds, lush green leaves and pink blossoms around the circular perimeter. Soft warm morning light, yellow as the delicate accent, not oversaturated.

### Wedding

Use case: illustration-story. Asset type: detailed miniature scene for an Indian wedding invitation's alternating illustrated timeline. A single circular garden diorama seen from above at a gentle 3/4 overhead angle, with a soft organic scalloped botanical perimeter, painted in refined miniature watercolour and gouache on paper, charming very fine decorative details, consistent muted sage and deep leaf green foliage, lotus pink flowers, dusty blush, muted champagne gold and warm cream. Transparent exterior background. Fill most of a square canvas with the complete circular scene, with a small transparent margin, no text, no lettering, no people, no modern 3D rendering, no picture frame, no shadow outside the circular scene. The scene must remain legible as a 150-pixel circular illustration. Not an icon, not a symbol, not an asset sheet. Subject: an ornate ivory-and-antique-gold wedding mandap on a little cream square platform at the centre of a circular lotus garden, four carved pillars and a delicate canopy draped with pink and white flower garlands, two ceremonial seats, a small sacred fire bowl, shallow blue-green water with pink lotus flowers and round lily pads around the platform, elegant leafy perimeter. Soft romantic warm light, lots of fine floral detail, a complete overhead miniature scene.

