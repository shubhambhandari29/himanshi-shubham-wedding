/* Edit wedding information, family contacts, photographs, and optional music here.
   Unknown facts stay null. No guest information is stored or sent by this site. */
window.WEDDING = {
  locale: 'hi-IN-u-nu-latn',
  numberLocale: 'hi-IN-u-nu-latn',
  couple: {bride: 'हिमांशी', groom: 'शुभम', city: 'देहरादून, उत्तराखंड'},
  families: {
    groom: {name: 'शुभम', label: 'शुभम के समारोह', contact: null, members: [{name: 'श्रीमती मंजुश्री भंडारी', relationship: 'माता'}, {name: 'श्री रविंद्र सिंह भंडारी', relationship: 'पिता'}]},
    bride: {name: 'हिमांशी', label: 'हिमांशी के समारोह', contact: null, members: [{name: 'श्रीमती वीना राणा', relationship: 'माता'}, {name: 'श्री राजेंद्र सिंह राणा', relationship: 'पिता'}]}
  },
  // Use international digits only, e.g. a confirmed Indian number prefixed with 91.
  // These contacts must be confirmed by the couple before enabling WhatsApp links.
  music: {src: 'assets/Sajna%20-Darshan%20Raval%20%28Audio%20Song%29%20%23DD.mp3', title: 'सजना', enabled: true, volume: 0.4, source: 'user-provided', licence: null},
  motion: {introDuration: 4800, ambient: true, leafDuration: 12000, boatBobDuration: 5000, petalDuration: 17000, rippleDuration: 2600, scratchThreshold: 0.40, scratchBrush: 34},
  // Confirmed bride-side home address, shared by the couple on 13 November 2026.
  homeVenue: {name: 'निवास स्थान', address: 'गली नंबर ११, इंद्रप्रस्थ कॉलोनी, ६ नंबर पुलिया के पास', city: 'जोगीवाला, देहरादून', mapsQuery: 'Lane No 11, Indraprastha Colony, near 6 Number Puliya, Jogiwala, Dehradun', isHome: true},
  // Original decorative miniatures; these illustrate the functions, not the actual venues.
  eventArtwork: {
    satsang: {src: 'assets/events/satsang.webp', alt: 'फूलों, ग्रंथ, हारमोनियम और दीपों से सजे शांत सत्संग स्थल का जलरंग चित्र'},
    mehendi: {src: 'assets/events/cocktail.webp', alt: 'मेहंदी एवं कॉकटेल के लिए रोशनी और फूलों से सजे बगीचे का जलरंग चित्र'},
    vidaai: {src: 'assets/events/vidaai.webp', alt: 'तारों और चाँद की छाँव में फूलों से सजी डोली के साथ विदाई का जलरंग चित्र'},
    keertan: {src: 'assets/events/keertan.webp', alt: 'फूलों, दीपों और पूजा की चौकी से सजे भक्तिमय बगीचे का जलरंग चित्र'},
    cocktail: {src: 'assets/events/cocktail.webp', alt: 'बैठने की सजावट, लालटेनों और झिलमिल रोशनी वाले शाम के बगीचे का जलरंग चित्र'},
    haldi: {src: 'assets/events/haldi.webp', alt: 'गेंदे के फूलों की छतरी और पीतल के कटोरों से सजी हल्दी की रस्म का जलरंग चित्र'},
    wedding: {src: 'assets/events/wedding.webp', alt: 'हरे-भरे कमल उद्यान में फूलों से सजे विवाह मंडप का जलरंग चित्र'}
  },
  events: [
    {id: 'groom-cocktail', side: 'groom', type: 'cocktail', title: 'कॉकटेल', date: null, time: null, venue: null, description: 'परिवार और दोस्तों के साथ संगीत और भोजन।', timelineDescription: 'संगीत और भोजन।', dressCode: null},
    {id: 'groom-haldi', side: 'groom', type: 'haldi', title: 'हल्दी', date: null, time: null, venue: null, description: 'परिवार के साथ हल्दी की रस्म।', timelineDescription: 'हल्दी की रस्म।', dressCode: null},
    {id: 'bride-satsang', side: 'bride', type: 'satsang', title: 'सत्संग', date: '2027-02-08', time: '11:00', venueKey: 'homeVenue', description: 'घर पर सत्संग में आपका स्वागत है।', timelineDescription: 'सत्संग एवं आशीर्वाद।', dressCode: null},
    {id: 'bride-keertan', side: 'bride', type: 'keertan', title: 'कीर्तन', date: '2027-02-08', time: '14:00', venueKey: 'homeVenue', description: 'घर पर भजन और कीर्तन।', timelineDescription: 'भजन और कीर्तन।', dressCode: null},
    {id: 'bride-mehendi', side: 'bride', type: 'mehendi', title: 'मेहंदी एवं कॉकटेल', date: '2027-02-09', time: '20:00', venue: {name: 'स्काई गार्डन', city: 'जोगीवाला, देहरादून', address: null, mapsQuery: 'Sky Garden Wedding Point, Jogiwala, Dehradun'}, description: 'मेहंदी, संगीत और रात्रि भोज में शामिल हों।', timelineDescription: 'मेहंदी, संगीत और रात्रि भोज।', dressCode: null},
    {id: 'bride-haldi', side: 'bride', type: 'haldi', title: 'हल्दी', date: '2027-02-10', time: '11:00', venueKey: 'homeVenue', description: 'घर पर हल्दी की रस्म।', timelineDescription: 'हल्दी की रस्म।', dressCode: null},
    {id: 'wedding', side: 'shared', type: 'wedding', title: 'हिमांशी संग शुभम — शुभ विवाह', date: '2027-02-10', time: '20:00', venue: {name: 'शिवप्रिया फार्म्स', city: 'देहरादून', address: null, mapsQuery: 'Shivpriya Farms, Dehradun'}, description: 'शुभ विवाह में आप सपरिवार सादर आमंत्रित हैं।', timelineDescription: 'आप सपरिवार सादर आमंत्रित हैं।', dressCode: null},
    // The poetic timing is intentional: do not invent an exact date/hour for vidaai.
    {id: 'bride-vidaai', side: 'bride', type: 'vidaai', title: 'विदाई', date: null, dateLabel: 'विवाह के बाद', time: null, timeLabel: 'तारों की छाँव में', after: 'wedding', venue: null, description: 'विवाह के बाद विदाई।', timelineDescription: 'तारों की छाँव में।', dressCode: null}
  ],
  story: {
    heading: 'हमारी कुछ यादें',
    paragraphs: ['हम अपने विवाह में आपको सपरिवार आमंत्रित करते हैं।', 'आइए, हमारे और हमारे परिवारों के साथ इस खुशी में शामिल हों।'],
    // Add your confirmed story or milestones here; no dates or personal history are assumed.
  },
  photos: [
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (10).jpeg', caption: 'रोशनी के तले', alt: 'जगमगाती लालटेनों के नीचे साथ खड़े हिमांशी और शुभम', position: '50% 35%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (5).jpeg', caption: 'एक जगमगाती शाम', alt: 'झिलमिल रोशनी के नीचे उत्सव के परिधानों में हिमांशी और शुभम', position: '50% 30%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (24).jpeg', caption: 'उत्सव के रंगों में', alt: 'हरियाली और झिलमिल रोशनी के बीच उत्सव के परिधानों में हिमांशी और शुभम', position: '50% 25%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (11).jpeg', caption: 'एक और नृत्य', alt: 'पहाड़ियों के सामने एक-दूसरे का हाथ थामे हिमांशी और शुभम', position: '50% 65%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (1).jpeg', caption: 'छोटे-छोटे पल', alt: 'स्कूल की वर्दी में साथ ली गई एक पुरानी तस्वीर', position: '50% 30%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (12).jpeg', caption: 'पहाड़ों की हवा', alt: 'धूप भरे दिन साथ की एक पहाड़ी यात्रा', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (15).jpeg', caption: 'थोड़ा रोमांच', alt: 'सुरक्षा जैकेट पहने पानी पर साथ बैठे हिमांशी और शुभम', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.13 (18).jpeg', caption: 'खुशियों के पड़ाव', alt: 'दीक्षांत समारोह की टोपी और पटका पहने साथ खुशियाँ मनाते हुए', position: '50% 50%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14 (7).jpeg', caption: 'खिले-खिले दिन', alt: 'धूप और फूलों से भरी हरियाली के बीच साथ की तस्वीर', position: '50% 40%'},
    {file: 'WhatsApp Image 2026-11-05 at 20.40.14.jpeg', caption: 'रोज़मर्रा का प्यार', alt: 'रंग-बिरंगे दरवाज़े के सामने हँसी-भरी बाँहों में साथ', position: '50% 40%'}
  ]
};

window.WEDDING.events.forEach(event => { if (event.venueKey) event.venue = window.WEDDING[event.venueKey]; });
