/* Edit wedding information, family contacts, photographs, and optional music here.
   Unknown facts stay null. No guest information is stored or sent by this site. */
window.WEDDING = {
  couple: {bride: 'Himanshi', groom: 'Shubham', city: 'Dehradun, Uttarakhand'},
  families: {
    groom: {name: 'Shubham', label: 'Shubham’s celebrations', contact: null, members: []},
    bride: {name: 'Himanshi', label: 'Himanshi’s celebrations', contact: null, members: []}
  },
  // Use international digits only, e.g. a confirmed Indian number prefixed with 91.
  // These contacts must be confirmed by the couple before enabling WhatsApp links.
  music: {src: null, title: null, licence: null},
  motion: {introDuration: 4800, ambient: true, leafDuration: 12000, boatBobDuration: 5000, petalDuration: 17000, rippleDuration: 2600, scratchThreshold: 0.40, scratchBrush: 34},
  // Original decorative miniatures; these illustrate the functions, not the actual venues.
  eventArtwork: {
    keertan: {src: 'assets/events/keertan.webp', alt: 'Watercolour miniature of a devotional garden with flowers, diyas, and a low ceremonial platform'},
    cocktail: {src: 'assets/events/cocktail.webp', alt: 'Watercolour miniature of an evening garden with lounge seating, lanterns, and warm string lights'},
    haldi: {src: 'assets/events/haldi.webp', alt: 'Watercolour miniature of a yellow floral Haldi setting with a marigold canopy and brass bowls'},
    wedding: {src: 'assets/events/wedding.webp', alt: 'Watercolour miniature of an ornate flower-covered mandap in a green lotus garden'}
  },
  events: [
    {id: 'groom-cocktail', side: 'groom', type: 'cocktail', title: 'Shubham’s Cocktail', date: null, time: null, venue: null, description: 'An evening of music, laughter, and his favourite people.', timelineDescription: 'Music, laughter & his favourite people.', dressCode: null},
    {id: 'groom-haldi', side: 'groom', type: 'haldi', title: 'Shubham’s Haldi', date: null, time: null, venue: null, description: 'A little sunshine, a lot of love, and the happiest shade of yellow.', timelineDescription: 'Sunshine, flowers & the happiest shade of yellow.', dressCode: null},
    {id: 'bride-cocktail', side: 'bride', type: 'cocktail', title: 'Himanshi’s Cocktail', date: null, time: null, venue: null, description: 'An evening of music, laughter, and her favourite people.', timelineDescription: 'Music, laughter & her favourite people.', dressCode: null},
    {id: 'bride-haldi', side: 'bride', type: 'haldi', title: 'Himanshi’s Haldi', date: null, time: null, venue: null, description: 'Flowers, blessings, and a little happy chaos with her loved ones.', timelineDescription: 'Flowers, blessings & a little happy chaos.', dressCode: null},
    {id: 'wedding', side: 'shared', type: 'wedding', title: 'Himanshi & Shubham — The Wedding', date: '2027-02-10', time: null, timeLabel: 'Night · exact time to be announced', venue: {name: 'Shivpriya Farms', city: 'Dehradun', address: null, mapsQuery: 'Shivpriya Farms, Dehradun'}, description: 'Seven promises. One beautiful forever. Both families come together to celebrate our wedding.', timelineDescription: 'Seven promises. One beautiful forever.', dressCode: null},
    // Previously provided facts; family allocation has NOT been confirmed.
    {id: 'unassigned-keertan', side: 'unassigned', type: 'keertan', title: 'Keertan', date: '2027-02-08', time: null, venue: null, description: 'Prayers, devotional music, and blessings. Family to be confirmed.'},
    {id: 'unassigned-cocktail', side: 'unassigned', type: 'cocktail', title: 'Cocktail', date: '2027-02-09', time: null, timeLabel: 'Evening · exact time to be announced', venue: {name: 'Sky Garden', city: 'Jogiwala, Dehradun', address: null, mapsQuery: 'Sky Garden, Jogiwala, Dehradun'}, description: 'Family to be confirmed.'},
    {id: 'unassigned-haldi', side: 'unassigned', type: 'haldi', title: 'Haldi', date: '2027-02-10', time: '10:00', venue: null, description: 'Family to be confirmed.'}
  ],
  story: {
    heading: 'Us, so far',
    paragraphs: ['The laughter. The adventures. The everyday moments that become our favourite memories.', 'Now, we’re stepping into our next chapter — with full hearts, our families by our side, and you on the guest list.'],
    // Add your confirmed story or milestones here; no dates or personal history are assumed.
  },
  photos: [
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (10).jpeg', caption: 'Under the lanterns', alt: 'Himanshi and Shubham together beneath glowing lanterns', position: '50% 35%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (5).jpeg', caption: 'A little evening sparkle', alt: 'Himanshi and Shubham dressed up beneath fairy lights', position: '50% 30%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (24).jpeg', caption: 'Dressed for a celebration', alt: 'Himanshi and Shubham in festive clothing, with greenery and fairy lights', position: '50% 25%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (11).jpeg', caption: 'One more dance', alt: 'Himanshi and Shubham holding hands outdoors in front of the hills', position: '50% 65%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (1).jpeg', caption: 'Little moments', alt: 'An earlier school-uniform selfie together', position: '50% 30%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (12).jpeg', caption: 'Mountain air', alt: 'A sunny mountain outing together', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (15).jpeg', caption: 'A little adventure', alt: 'Himanshi and Shubham on the water wearing life jackets', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (18).jpeg', caption: 'Milestones together', alt: 'Celebrating together in graduation caps and stoles', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (7).jpeg', caption: 'Days in bloom', alt: 'A sunny portrait among flowering greenery', position: '50% 40%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14.jpeg', caption: 'The everyday kind of love', alt: 'A playful embrace in front of a colourful doorway', position: '50% 40%'}
  ]
};
