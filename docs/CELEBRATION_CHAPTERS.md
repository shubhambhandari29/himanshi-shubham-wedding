# Celebration chapters

Prepared from the couple’s redesign request. The user authorized pushing this revision. It replaces production `2104df0` through the existing main-branch GitHub Pages deployment.

Preview:

- Groom: http://localhost:5173/?v=celebration-chapters-1&side=groom#celebrations
- Bride: http://localhost:5173/?v=celebration-chapters-1&side=bride#celebrations

## Composition

The celebrations now use date-generated chapters, each with one clear date heading and a restrained floral divider. Events are ordered by the existing dates/times. Per-event dates remain available to assistive technology, while the wedding also displays its date visibly in the feature. The bride’s undated Vidaai has its own “विवाह के बाद” chapter; no date has been inferred from the wedding.

- Mehendi/Cocktail: horizontal garden, dusty rose/plum wash, warm lanterns, art beside details on desktop and stacked on phones.
- Satsang/Keertan: separate open portrait scenes in ivory/saffron. The bride’s two devotional gatherings form one related pair on 8 February, retaining their own times, venues and actions.
- Haldi: asymmetric marigold strands, loose drapes, brass bowls and pale turmeric wash. Art is placed opposite the evening scene on larger screens; morning time remains prominent.
- Baraat: wide horizontal procession above centered departure details. Its time and departure home have extra emphasis.
- Shared wedding: largest centered mandap, a cream/blush panel with restrained maroon/gold, large couple names, date/time, venue and comfortable directions/calendar actions. Identical shared-event rendering appears once in both family views.
- Welcome/Vidaai: smaller dawn and moonlight compositions, respectively. Known facts remain as supplied; Vidaai has no calendar action, date/time or venue invented.

Short connectors join appropriate events within a day, ending before the wedding feature and at day boundaries. The previous one-spine alternating sequence and redundant floral ending were removed. All other invitation sections and interactions are unchanged.

`celebrations.css` contains the new section-scoped layout. At 360–430px, wide illustrations stack, devotional/closing vignettes use a compact image/detail composition, practical text remains 16–18px or larger, action targets remain at least 44px, and grids use shrinkable columns. Artwork is contained at its real aspect ratio, not cropped into a mask.

## Original artwork

Generated with the imagegen skill and the built-in image generator, one call per asset, without third-party stock images. Original masters and transparent WebP display files are in `assets/events/chapters/`. Old artwork is retained for history; active mappings use the new files.

Common art brief: refined hand-painted watercolor with Indian-miniature detail, delicate pigments, restrained antique gold, true transparent outer edges, no lettering/logos/people, no circular/scalloped wreath, no all-round leafy border and no clipping of meaningful objects.

| Asset | Distinct scene and silhouette | Display size |
| --- | --- | --- |
| cocktail | Wide dusk lounge with dusty rose/plum flowers, lanterns and warm string lights | 960 × 640 |
| satsang | Portrait open courtyard, scripture stand, diya and one saffron garland | 520 × 650 |
| keertan | Portrait harmonium/tabla/cymbals vignette, diya and restrained distant arch | 520 × 650 |
| haldi | Asymmetric floral seat, hanging marigolds, turmeric bowls and ivory drapes | 860 × 573 |
| baraat | Horse stepping forward, trailing ribbons, canopy, dhol and brass instruments in warm evening light | 1080 × 720 |
| wedding | Broad symmetric gold mandap, restrained maroon floral canopy, ceremonial chairs and sacred fire | 1200 × 800 |
| welcome | Compact dawn doorway, toran, aarti thali, kalash and soft foothills | 560 × 373 |
| vidaai | Compact moonlit doli, lantern path, crescent and blue-grey foothills | 560 × 373 |

The eight active display files total approximately 1.31 MiB and load lazily. New artwork was inspected together on a blush/cream contact sheet (`/tmp/chapter-art-sheet.png`), confirming varied composition, silhouette and palette without repeated circular borders. The scenes are decorative interpretations, not portraits of the couple or photographs of the venues.

## Motion

Viewport entry gently reveals art before details. Baraat enters horizontally; the wedding uses a slower reveal. Lantern glow and diya flicker run only twice, and three Haldi petals drift once after entrance. No new continuous loops are used. Without IntersectionObserver all information is immediately visible. Reduced motion skips viewport animations and hides accent animations; family switching never replays the boat opening.

## Verification and review limits

`npm run check`: **50/50 passed**, including the final connector refinement. Checks cover both family schedules, chronological groups and devotional pairing, unknown Vidaai date handling, identical shared wedding rendering, new portrait/wide artwork dimensions and transparency, viewport animation differences, reduced motion, family deep links/history, dates/times, maps, calendars, opening/scratch, gallery, music, contacts, asset paths, unique IDs, SVG controls and CSS parsing.

A direct comparison with `HEAD:content.js` confirmed every event object, full venue/address/map data, family details, music, photos and story remain identical; only artwork mappings changed. Local HTTP serves the preview and section stylesheet successfully.

Browser selection/discovery and prescribed troubleshooting were attempted; no browser is connected. **Actual desktop/mobile layout screenshots and rendered overflow checks could not be performed.** The artwork contact sheet is an artwork comparison, not a browser screenshot. The running preview is ready for those final visual checks before publication.

Outstanding event facts are unchanged: Vidaai location is now confirmed as Himanshi’s home; its exact date/time remain unconfirmed; the wedding’s 8 PM is still generic (not specifically guest arrival/pherās); Sathi’s full postal address and exact Maps pins for the bride’s home and wedding venue remain unconfirmed. No new event facts are needed for the visual redesign itself.
