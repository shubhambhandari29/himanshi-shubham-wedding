# Typography and visual hierarchy

Publication authorized by the couple as part of this task. This revision updates type roles and the Baraat artwork scale; the event data, artwork files, timeline grouping, family selector, calendars, maps, music and gallery behaviour are unchanged.

## One source for font roles

`typography.css`, loaded after `style.css` and `celebrations.css`, owns all font-family, font-style, font-weight and letter-spacing assignments. Competing role declarations were removed from the older stylesheets, and the affected heading/event sizes were consolidated here as well.

| Role | Regular face | Usage |
| --- | --- | --- |
| Special moments | Amita 400 | Opening couple names, formal bride/groom names and संग, shared-wedding couple names, closing names, हमारे समारोह, हमारी कुछ यादें |
| Formal / ritual | Tiro Devanagari Hindi 400 | Event names, formal invitation wording, other serif headings |
| Practical information | Noto Sans Devanagari 400 | Day headings, dates, times, addresses, navigation, family selector, venue details, directions and calendar actions |
| English identity | Cormorant Garamond 400 | Existing English monogram typography where applicable; image monograms are retained |

All four regular font files are self-hosted in `assets/fonts/`, with their SIL Open Font License files. Source binaries were downloaded from Google Fonts’ fonts.gstatic.com responses to the official CSS2 request for these families. No font files were edited. Amita is preloaded. There is no dependency on an external Google Fonts stylesheet at runtime. `font-display: swap` keeps text readable during loading, and `font-synthesis: none` prevents fake bold/italic cuts.

The CSS2 source request was:
`https://fonts.googleapis.com/css2?family=Amita:wght@400&family=Cormorant+Garamond:wght@400&family=Noto+Sans+Devanagari:wght@400;500;600&family=Tiro+Devanagari+Hindi&display=swap`
Only the 400 normal faces were retained. License files were obtained from the corresponding `ofl/` directories in the official google/fonts repository.

## Hierarchy and scale

- General event names: 34px desktop, 30px at intermediate widths, 28px on phones; Tiro Regular, 1.85 line height, natural space wrapping.
- Event times: 23px desktop / 21px mobile in a quieter dark neutral; Noto Sans Regular.
- Day headings: 22px desktop / 19px phones; dates and addresses remain 16–18px or larger as appropriate.
- Action labels: 16px, with at least 44px touch targets.
- Shared-wedding names: Amita at 43px desktop / 30px phone, with शुभ विवाह beneath in Tiro at 29px / 27px. Its existing maroon/gold palette, larger mandap and ornamental panel are retained.
- Other selected Amita headings use 1.85–1.9 line height and visible overflow with small block padding for vowel marks and descenders. No hard clipping or intra-word breaking is introduced.
- Baraat maximum width is reduced from 600px to 492px (18%). Its image also uses 82% of available width so the reduction remains visible on phones. Height remains automatic and the full illustration is contained. Its vertical padding is modestly reduced. Wedding artwork remains 650px maximum.

## Verification

`npm run check`: **52/52 passed**. Existing interaction and data checks remain green. Additional checks load all styles together in the DOM fixture and verify the actual resolved font families for selected headings, event names, times and practical information; event names are larger than timings; all registered font faces are regular; and the older stylesheets contain no competing font-role declarations.

Font files were parsed for TrueType signatures, Devanagari cmap coverage and GSUB shaping tables. Actual font files were registered in the native canvas renderer; sample Hindi strings, vowel marks and conjuncts fit their allocated line heights, and selected headings/event labels fit conservative text widths for 360px, 390px and 430px phones.

Native text specimens at those three widths were visually inspected (`/tmp/wedding-typography-specimen.png`), including हिमांशी संग शुभम, हमारे समारोह, हमारी कुछ यादें, मेहंदी एवं कॉकटेल, फ़रवरी, बारात प्रस्थान, कीर्तन, श्री and the parents’ names. These are font specimens, **not browser screenshots**.

Browser selection and prescribed troubleshooting were attempted; no browser is connected. Actual desktop/mobile page screenshots, browser-specific font rasterization and rendered overflow checks could not be performed. The local preview is available at http://localhost:5173/?v=typography-amita-1#celebrations . This limitation does not affect the completed static, interaction, font-file and native-text checks.
