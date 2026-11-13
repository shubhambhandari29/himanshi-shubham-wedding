/* Edit wedding information, family contacts, photographs, and optional music here.
   Unknown facts stay null. No guest information is stored or sent by this site. */
window.WEDDING = {
  locale: 'hi-IN-u-nu-latn',
  numberLocale: 'hi-IN-u-nu-latn',
  couple: {bride: 'हिमांशी', groom: 'शुभम', city: 'देहरादून, उत्तराखंड'},
  families: {
    groom: {name: 'शुभम', label: 'शुभम के समारोह', contact: {name: null, phone: null}, members: [{name: 'श्रीमती मंजुश्री भंडारी', relationship: 'माता'}, {name: 'श्री रविंद्र सिंह भंडारी', relationship: 'पिता'}]},
    bride: {name: 'हिमांशी', label: 'हिमांशी के समारोह', contact: {name: null, phone: null}, members: [{name: 'श्रीमती वीना राणा', relationship: 'माता'}, {name: 'श्री राजेंद्र सिंह राणा', relationship: 'पिता'}]}
  },
  // Use international digits only, e.g. a confirmed Indian number prefixed with 91.
  // Fill both name and phone only for contacts verified by the couple; incomplete cards stay hidden.
  music: {src: 'assets/Sajna%20-Darshan%20Raval%20%28Audio%20Song%29%20%23DD.mp3', title: 'सजना', enabled: true, volume: 0.4, source: 'user-provided', licence: null},
  motion: {introDuration: 4800, ambient: true, leafDuration: 12000, boatBobDuration: 5000, petalDuration: 17000, rippleDuration: 2600, scratchThreshold: 0.40, scratchBrush: 34},
  // Confirmed bride-side home address, shared by the couple on 13 November 2026.
  homeVenue: {name: 'हिमांशी का निवास', shortLabel: 'हिमांशी का निवास, जोगीवाला', address: 'गली नंबर 11, इंद्रप्रस्थ कॉलोनी, 6 नंबर पुलिया के पास', city: 'जोगीवाला, देहरादून', mapsQuery: 'Lane No 11, Indraprastha Colony, near 6 Number Puliya, Jogiwala, Dehradun', isHome: true},
  groomHomeVenue: {name: 'भंडारी निवास', shortLabel: 'भंडारी निवास, हर्रावाला', address: 'सिद्धपुरम, गली नंबर 3, हर्रावाला', city: 'देहरादून, उत्तराखंड', mapsUrl: 'https://maps.app.goo.gl/T5PzBUmyjkBatVS26', isHome: true},
  // Original decorative miniatures; these illustrate the functions, not the actual venues.
  eventArtwork: {
    satsang: {src: 'assets/events/chapters/satsang.webp', width: 520, height: 650, alt: 'ग्रंथ, दीप और गेंदे की माला से सजे शांत सत्संग स्थल का खुला जलरंग चित्र'},
    mehendi: {src: 'assets/events/chapters/cocktail.webp', width: 960, height: 640, alt: 'शाम के बगीचे में लालटेनों, सुनहरी रोशनी और मेहंदी की सजावट का चौड़ा जलरंग चित्र'},
    vidaai: {src: 'assets/events/chapters/vidaai.webp', width: 560, height: 373, alt: 'चाँदनी में डोली, लालटेन और पहाड़ी रास्ते पर विदाई का शांत जलरंग चित्र'},
    keertan: {src: 'assets/events/chapters/keertan.webp', width: 520, height: 650, alt: 'हारमोनियम, तबले, मंजीरे और दीप के साथ कीर्तन का जलरंग चित्र'},
    cocktail: {src: 'assets/events/chapters/cocktail.webp', width: 960, height: 640, alt: 'शाम के बगीचे में लालटेनों, सुनहरी रोशनी और मेहंदी की सजावट का चौड़ा जलरंग चित्र'},
    haldi: {src: 'assets/events/chapters/haldi.webp', width: 860, height: 573, alt: 'पीले फूलों, लटकती गेंदे की मालाओं और पीतल के कटोरों से सजी हल्दी का जलरंग चित्र'},
    baraat: {src: 'assets/events/chapters/baraat.webp', width: 1080, height: 720, alt: 'सजे हुए घोड़े, छत्र, ढोल और शाम की रोशनी के साथ चलती बारात का चौड़ा जलरंग चित्र'},
    welcome: {src: 'assets/events/chapters/welcome.webp', width: 560, height: 373, alt: 'सुबह की रोशनी में पहाड़ी घर के द्वार और आरती की थाली का जलरंग चित्र'},
    wedding: {src: 'assets/events/chapters/wedding.webp', width: 1200, height: 800, alt: 'मैरून फूलों, सुनहरी छतरी और अग्नि से सजे बड़े विवाह मंडप का जलरंग चित्र'}
  },
  events: [
    {id: 'groom-cocktail', side: 'groom', type: 'mehendi', title: 'मेहंदी एवं कॉकटेल', date: '2027-02-08', time: '20:00', venueKey: 'groomHomeVenue', description: 'मेहंदी, संगीत और रात्रि भोज में शामिल हों।', timelineDescription: 'मेहंदी, संगीत और रात्रि भोज।', dressCode: null},
    {id: 'groom-keertan', side: 'groom', type: 'keertan', title: 'कीर्तन', date: '2027-02-09', time: '14:00', venueKey: 'groomHomeVenue', description: 'घर पर भजन और कीर्तन।', timelineDescription: null, dressCode: null},
    {id: 'groom-haldi', side: 'groom', type: 'haldi', title: 'हल्दी', date: '2027-02-10', time: '11:00', venueKey: 'groomHomeVenue', description: 'घर पर हल्दी की रस्म।', timelineDescription: null, dressCode: null},
    {id: 'groom-baraat', side: 'groom', type: 'baraat', title: 'बारात प्रस्थान', date: '2027-02-10', time: '19:00', venueKey: 'groomHomeVenue', description: 'भंडारी निवास से बारात का प्रस्थान।', timelineDescription: null, dressCode: null},
    {id: 'groom-welcome', side: 'groom', type: 'welcome', title: 'वधू स्वागत', date: '2027-02-11', time: '07:00', venueKey: 'groomHomeVenue', description: 'भंडारी परिवार में वधू का स्वागत।', timelineDescription: null, dressCode: null},
    {id: 'bride-satsang', side: 'bride', type: 'satsang', title: 'सत्संग', date: '2027-02-08', time: '11:00', venueKey: 'homeVenue', description: 'घर पर सत्संग में आपका स्वागत है।', timelineDescription: null, dressCode: null},
    {id: 'bride-keertan', side: 'bride', type: 'keertan', title: 'कीर्तन', date: '2027-02-08', time: '14:00', venueKey: 'homeVenue', description: 'घर पर भजन और कीर्तन।', timelineDescription: null, dressCode: null},
    {id: 'bride-mehendi', side: 'bride', type: 'mehendi', title: 'मेहंदी एवं कॉकटेल', date: '2027-02-09', time: '20:00', venue: {name: 'साथी वेडिंग पॉइंट', shortLabel: 'साथी वेडिंग पॉइंट, देहरादून', city: 'देहरादून', address: null, mapsUrl: 'https://share.google/F47hnI9tc7TaGotYH'}, description: 'मेहंदी, संगीत और रात्रि भोज में शामिल हों।', timelineDescription: 'मेहंदी, संगीत और रात्रि भोज।', dressCode: null},
    {id: 'bride-haldi', side: 'bride', type: 'haldi', title: 'हल्दी', date: '2027-02-10', time: '11:00', venueKey: 'homeVenue', description: 'घर पर हल्दी की रस्म।', timelineDescription: null, dressCode: null},
    {id: 'wedding', side: 'shared', type: 'wedding', title: 'हिमांशी संग शुभम — शुभ विवाह', date: '2027-02-10', time: '20:00', venue: {name: 'शिवप्रिया फार्म्स', city: 'देहरादून', address: null, mapsQuery: 'Shivpriya Farms, Dehradun'}, description: 'शुभ विवाह में आप सपरिवार सादर आमंत्रित हैं।', timelineDescription: null, dressCode: null},
    // The poetic timing is intentional: do not invent an exact date/hour for vidaai.
    {id: 'bride-vidaai', side: 'bride', type: 'vidaai', title: 'विदाई', date: null, dateLabel: 'विवाह के बाद', time: null, timeLabel: 'तारों की छाँव में', after: 'wedding', venueKey: 'homeVenue', description: 'हिमांशी के निवास से विदाई।', timelineDescription: null, dressCode: null}
  ],
  story: {
    heading: 'हमारी कुछ यादें',
    paragraphs: ['कुछ पुराने पल, कुछ नई यादें—और अब एक नया सफ़र।'],
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
