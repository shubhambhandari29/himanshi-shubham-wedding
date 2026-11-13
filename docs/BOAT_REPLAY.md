# Boat opening: iPhone/static animation report

Reported symptom: another iPhone shows the boat image but it does not move. The affected device/browser could not be inspected directly, so its exact cause is not confirmed.

Two code paths could explain that symptom:

- A matching `prefers-reduced-motion: reduce` immediately completes the opening, and the site’s reduced-motion stylesheet disables transitions. This deliberately respects the device preference, leaving the boat visible and stationary.
- Previously, a tap started the transition and completion timer before verifying the boat image was decoded. On a slow connection, the image could become visible only after the movement ended.

## Changes

- Opening tap cue explicitly says `नाव चलाकर निमंत्रण खोलें`.
- A replay button is available after the opening completes or is skipped. For reduced-motion visitors it says `नाव का दृश्य चलाएँ`, with an accessible explanation that this is an optional, one-shot scene.
- Default reduced-motion handling remains intact. Only an explicit replay action enables the boat’s transform transition, scoped to `.water-opening[data-manual-motion=true] .boat-route`; ambient leaves/bobbing/petals and the rest of the site remain motion-reduced.
- Replay commits a non-animated reset before transitioning, rather than reapplying the same final transform. It preserves family selection, scratch state and other invitation data.
- If image decoding is supported and the picture is not ready, the scene waits before beginning its movement/timer. Skip remains available. Failed decoding or a 10-second limit reveals a usable invitation; a late result cannot restart an already skipped scene.
- Busy/focus handling remains accessible. A legacy viewport-height fallback is included for browsers without `svh` support.

## Verification

`npm run check`: **59/59 passed**. New checks cover explicit replay with reduced motion, normal replay without resetting invitation state, delayed decoding, skip during loading, late image completion and failed decoding. Existing family/contacts/gallery/calendar/music/scratch and CSS checks remain green.

No browser or physical iPhone is connected. The actual report is not reproduced on hardware, so this is a tested fix for the identified code paths, not a claim that the affected iPhone’s settings or browser have been confirmed. The new live root link and replay control should be checked on that phone.

Reference for WebKit’s reduced-motion behaviour: https://webkit.org/blog/7551/responsive-design-for-motion/ . No device preferences are changed or stored by the website.
