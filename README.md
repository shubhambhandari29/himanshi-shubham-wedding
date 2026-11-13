> Current revision: Latin digits throughout, supplied illustrated logo and replacement MP3; RSVP and travel advice removed. Event titles are concise and invitation copy simplified.

> नवीन संपादन: तिथियाँ और घड़ी का समय अब 0–9 अंकों में हैं; H&S लोगो अंग्रेज़ी में है। मुख्य पाठ हिंदी में है। माता-पिता का परिचय और सत्संग/विदाई के नए चित्र जोड़े गए हैं। इस संस्करण का प्रकाशन 13 नवंबर 2026 को अधिकृत किया गया है; GitHub Pages इसे `main` से उपलब्ध कराता है।

# हिंदी देवनागरी संस्करण

पूरा निमंत्रण देवनागरी में है; मूल साँचा, तस्वीरें और क्रियाएँ बरकरार हैं। हिंदी संस्करण की अलग `hindi-devanagari` शाखा सुरक्षित रखी गई है। उपयोगकर्ता की अनुमति के बाद इसे `main` में सम्मिलित करके मौजूदा वेबसाइट पर प्रकाशित किया जा रहा है। स्थानीय पूर्वावलोकन: http://localhost:5173/ । विवरण: [हिंदी संस्करण के नोट्स](docs/HINDI.md)।

---

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

- Shared wedding: **10 February 2027, 8 PM IST**, **Shivpriya Farms, Dehradun**. The countdown and calendar now use this confirmed time.
- Himanshi's confirmed events: Satsang on 8 February at 11 AM; Keertan on 8 February at 2 PM; combined Mehendi and Cocktail on 9 February at 8 PM at Sky Garden, Jogiwala; Haldi on 10 February at 11 AM at home; shared wedding on 10 February at 8 PM; Vidaai after the wedding, labelled ‘तारों की छाँव में’. Shubham’s confirmed schedule: combined Mehendi/Cocktail on 8 February at 8 PM, Keertan on 9 February at 2 PM, Haldi on 10 February at 11 AM, Baraat departure on 10 February at 7 PM, shared wedding at Shivpriya Farms at 8 PM, and Vadhu Swagat on 11 February at 7 AM. Home events use Bhandari Niwas, Siddhpuram Lane No 3, Harrawala, Dehradun and the supplied exact Maps link. Vadhu Swagat is shown at the family home.
- The couple confirmed the bride-side home address as Lane No 11, Indraprastha Colony, near 6 Number Puliya, Jogiwala, Dehradun. `homeVenue` supplies one shared address for Satsang, Keertan and Haldi. Earlier unassigned placeholders have been superseded: Haldi is 11 AM (not the older 10 AM), and Mehendi/Cocktail are one combined event. The empty pending-details disclosure is hidden.
- Family members and relationships are empty until verified. Accommodation and exact street addresses have not been invented. Dress details remain unconfirmed.
- RSVP and guest reply controls have been removed at the couple’s request.
- The supplied Sajna MP3 is configured via its actual filename, with `enabled: true` and an initial volume of 0.4. Playback attempts autoplay; if blocked, the first invitation interaction retries it. The music control can pause playback and that choice is respected. Audio provenance is recorded as user-provided; licence metadata remains unspecified rather than inventing a permission statement. A null source or `enabled: false` hides the control.
- Ambient motion, intro duration, scratch brush size, and the completion threshold are adjustable. All motion respects reduced-motion preferences.

The opening and scratch state remain in memory during page navigation. Reloading starts a new visit.

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
- `script.js`: opening, scratch canvases, event rendering, album, countdown, calendars and optional music
- `content.js`: editable content and confirmed facts
- `assets/`: original photos/artwork plus lightweight transparent WebP artwork
- `tests/invitation.test.cjs`: reproducible interaction and integrity checks

Existing hosting: https://shubhambhandari29.github.io/himanshi-shubham-wedding/ . The user explicitly authorized publishing this revision on 12 November 2026. Future publishing should follow the scope of the current request. GitHub Pages serves `main` from the repository root. The existing GitHub Pages hosting configuration is reused.

## Illustrated celebrations revision
The celebration cards have been replaced by a continuous, alternating illustrated timeline on the blush background. The four original circular watercolour scenes are in `assets/events/`; `content.js` maps each function to its illustration. Both family views include the shared wedding in date/time order. Timeline calendar actions require a confirmed time; the date section retains its date-only reminder. See [docs/CELEBRATIONS.md](docs/CELEBRATIONS.md) for the reviewed recording frames, asset paths and prompts, responsive behaviour, 24 passing checks, and the outstanding 390px visual screenshot comparison.

Jump straight to the preview: http://localhost:5173/#celebrations . This revision is included in the GitHub Pages publication.


## Bride-side schedule and audio update

The user authorized publishing the 13 November 2026 content update and supplied MP3 to the existing GitHub Pages site. Preview: http://localhost:5173/?side=bride#celebrations . See [docs/BRIDE_SCHEDULE.md](docs/BRIDE_SCHEDULE.md) for the confirmed facts and remaining information.
