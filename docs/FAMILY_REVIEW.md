# Latest family/contacts review

Implemented from the couple’s latest pasted review. Their direct instruction also authorizes deployment after checks.

## Completed

- Every separate event now carries its family’s exact label (`शुभम के समारोह` / `हिमांशी के समारोह`) inside the event details, so an individual screenshot retains context. The shared wedding says `दोनों परिवारों का साझा समारोह`. The previously removed global status sentence remains removed.
- Confirmed family contacts are stored only in `families.groom.contacts` and `families.bride.contacts` in `content.js`. There are no individual names or relationships associated with these numbers.

| Family | Display | Call | WhatsApp |
| --- | --- | --- | --- |
| Shubham | 96343 87491 | tel:+919634387491 | https://wa.me/919634387491 |
| Shubham | 97601 82277 | tel:+919760182277 | https://wa.me/919760182277 |
| Himanshi | 73514 15376 | tel:+917351415376 | https://wa.me/917351415376 |
| Himanshi | 78956 63687 | tel:+917895663687 | https://wa.me/917895663687 |

The contact section follows venue information. Each family card contains two separately displayed numbers, each with accessible call and WhatsApp actions, inline SVG icons and 44px touch targets. Invalid/empty contact data is hidden. WhatsApp opens a conversation for the guest to compose a message; no message is sent automatically, and no attendance workflow was created.

- Gallery opening is now the original lantern celebration portrait, original school-uniform photo, and original travel photo showing both people. All ten photo objects (filename/caption/alt/position) are retained unchanged, and both gallery and viewer use the same reordered array. The travel photo was inspected.
- Removed only the gallery’s redundant `हमारी तस्वीरें` overline. Reduced gallery top padding, divider/caption gaps and carousel top padding.
- Reduced formal invitation top/bottom padding, crest margin/size modestly, blessing and related-line gaps. Parents, relationships, invocation, blessing and type line heights remain readable and intact.
- Directions links are filled primary actions using each ritual’s existing color. Calendar downloads are quieter secondary actions, retaining 44px touch targets and keyboard focus styles.
- Added `word-spacing: .16em` only to `हमारे समारोह`; Devanagari letter spacing remains normal. Existing Amita/Tiro/Noto pairing is retained.

## Confirmed and unconfirmed facts

Every event object, time, date, venue, address and Maps URL matches the previous production version. The changes do not infer new event facts.

- **Vidai location is explicitly confirmed.** The couple’s earlier direct instruction was: “vidaai doesnt have place. it is from himanshi home”. `bride-vidaai` retains `venueKey: homeVenue`, the home address/Maps search, `विवाह के बाद` and `तारों की छाँव में` without inventing a date or hour.
- **Wedding time meaning remains unconfirmed.** Repository data and the couple’s supplied schedule say wedding at 8 PM; neither explicitly identifies guest arrival, reception/dinner, ceremony or pheras. All displays and calendars retain the generic wedding time, `रात्रि 8:00 बजे`.
- **Shivpriya Farms:** Dehradun is confirmed; no verified street address, landmark, place ID or exact Maps share link is present. Its existing Google Maps name search is retained.
- **Sathi Wedding Point:** the confirmed exact user-supplied share link `https://share.google/F47hnI9tc7TaGotYH` is retained. No full postal address/locality is confirmed, so the old Sky Garden/Jogiwala locality has not been reused.
- Bhandari Niwas retains the exact user-supplied Maps link. Himanshi’s home retains its full confirmed address and full-address Maps search.

## Validation

`npm run check`: **55/55 passed**. Checks cover all family event labels, both family views/deep links, shared wedding, four exact call/WhatsApp URLs, family association, grouped displays, no personal identities, hidden invalid data, SVG controls, action prominence and touch-target styles, reordered gallery/viewer/counters, compact spacing and heading word-spacing, all existing opening/scratch/music/calendar/map interactions, date/time accuracy, font roles/coverage and CSS syntax.

No contact links were followed during tests; no calls, WhatsApp messages or RSVPs were sent. A source comparison verified all event objects match production and all ten original photo metadata objects remain unchanged. Local HTTP preview serves current files at http://localhost:5173/?v=family-contacts-1 .

Browser selection/discovery and prescribed troubleshooting were attempted; no browser is connected. Real desktop/mobile layout screenshots and rendered overflow checks remain unverified. DOM/computed-style tests and the prior native font specimens provide checks, but are not a replacement for browser visual inspection.
