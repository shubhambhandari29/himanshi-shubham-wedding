# Invitation polish

Prepared from the review pasted by the couple and their latest venue correction. The user authorized publication after reviewing the local preview. This revision replaces production `203fd5d` through the existing main-branch GitHub Pages deployment. Preview: http://localhost:5173/?v=invitation-polish-1 . Direct family views: `?v=invitation-polish-1&side=groom#celebrations` and `?v=invitation-polish-1&side=bride#celebrations`.

## Completed

- Preserved lotus/boat opening, animations, blush/aqua/gold palette, Hindi fonts, real canvas scratching, family selector, illustrated timeline, gallery, audio and calendars.
- Removed bilingual-era duplicate event subtitles. Removed repetitive descriptions for Haldi, Keertan, Satsang, Baraat, welcome and wedding; useful Mehendi/Cocktail description remains. Vidaai’s poetic timing appears once.
- Replaced functional font glyphs with inline currentColor SVGs for directions, calendar, gallery arrows/enlarge, photo viewer arrows/close, music, skip, menu, scratch reveal and back-to-top. Decorative SVGs are hidden from assistive technology; text/ARIA names and 44px action targets remain.
- Updated Himanshi’s combined Mehendi/Cocktail to **Sathi Wedding Point**, with the exact supplied link https://share.google/F47hnI9tc7TaGotYH . The time remains **9 February 2027, 8 PM**. Sky Garden is superseded; Jogiwala has not been carried over as Sathi’s locality without confirmation.
- Timeline venues are concise (`भंडारी निवास, हर्रावाला`, `हिमांशी का निवास, जोगीवाला`, `साथी वेडिंग पॉइंट, देहरादून`, `शिवप्रिया फार्म्स, देहरादून`). Dedicated venue summaries and calendars retain full known home addresses.
- Renamed bride’s home to `हिमांशी का निवास`. Both home cards explicitly identify the family. Sathi’s card says `हिमांशी की मेहंदी एवं कॉकटेल`. Venue summaries derive their event names from event data.
- Converted address numbers to normal 0–9 digits without changing their meaning.
- Gallery caption: `कुछ पुराने पल, कुछ नई यादें—और अब एक नया सफ़र।` Removed repeated invitation text. Kept one concise gallery instruction.
- Kept verified parents and relationships in the formal invitation; removed the later duplicate family section. No extra relatives or contacts were invented.
- Updated skip/reveal instructions and `दोपहर 2:00 बजे`. Once all scratch cards reveal, the instruction and redundant reveal button hide, `तिथि याद रखिए` and calendar action show, and keyboard focus moves from the reveal button to the calendar action. Progress remains screen-reader-only. No-JavaScript fallback omits unusable scratch controls.
- Main order: boat, date, formal invitation, celebrations, gallery, countdown, venues, conditional contacts, closing/footer.
- Practical nav, action, address, selector and label typography is larger. Below 480px, timeline rows stack beside a continuous left spine; larger layouts retain alternating illustrations. Sticky anchor offsets remain configured.
- `families.groom.contact` and `families.bride.contact` now hold `{name: null, phone: null}`. Fill only verified details (phone in international format). Incomplete cards and their nav links remain hidden. Valid cards offer call and WhatsApp links, with no form, attendance workflow, submission or storage.
- Compact monogram is used in small placements and closing. The detailed illustrated emblem appears only once, in the formal invitation.

## Facts and missing confirmations

Every event’s ID, date, time, family side and ordering dependency matches the previous production config. Only the latest confirmed bride venue changed.

Still needed:

1. A verified contact name and international phone number for each family.
2. Vidaai location. The repository does not explicitly confirm it, so it remains pending; no exact Vidaai date/time has been invented.
3. Whether the wedding’s **8 PM** refers to guest arrival, reception, ceremony or pheras. It remains labelled generically as शुभ विवाह.
4. An exact Maps share link/place ID for Himanshi’s home and Shivpriya Farms. These still use full-address/name search links; no pin was guessed.
5. Sathi’s full postal address/locality, if it should be shown alongside the supplied share link. Dehradun is known; its precise locality was not inferred from the superseded venue.

The supplied Bhandari Niwas Maps link is retained unchanged. Sathi’s provided share link is used unchanged; attempts to independently open it returned a generic Google page, so no address or pin was extracted from that response.

## Validation

`npm run check`: **46/46 passed**. Includes native canvas scratching and resizing, accessible reveal/focus, opening/skip/reduced motion, family links/history/schedule ordering, title deduplication, one shared wedding per view, all known UTC calendar starts, full addresses in calendars, exact supplied map links, concise timeline venues, normal date/time/address digits, section order/parent deduplication, gallery keyboard/swipe/Escape/focus return, currentColor SVG semantics, music autoplay fallback/pause behaviour, hidden/configured contact fixtures and URLs, asset references, unique IDs, anchor targets and CSS parsing.

Test fixtures never send messages, call a number, submit RSVPs or contact external recipients. The JavaScript-enabled DOM fixture excludes `<noscript>` markup to avoid applying fallback styles while running scripts.

Compared current configuration with `HEAD:content.js`: all dates, times, family assignments and `after` dependencies identical. Local HTTP returns the new HTML, config, script and styles; served source files match the working files. `git diff --check` passes.

**Visual verification limit:** no browser is connected. Browser discovery and selection were attempted, and its prescribed troubleshooting was read. Desktop/mobile screenshots, rendered overflow checks and actual Chrome audio playback could not be verified. Responsive styles are prepared and DOM/CSS/interaction checks pass, but those visual checks remain for review in the running local preview. No alternate browser-control workaround was used.
