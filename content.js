/* Edit wedding information, family contacts, photographs, and optional music here.
   Unknown facts stay null. No guest information is stored or sent by this site. */
window.WEDDING = {
  locale: 'hi-IN-u-nu-deva',
  couple: {bride: 'हिमांशी', groom: 'शुभम', city: 'देहरादून, उत्तराखंड'},
  families: {
    groom: {name: 'शुभम', label: 'शुभम के समारोह', contact: null, members: []},
    bride: {name: 'हिमांशी', label: 'हिमांशी के समारोह', contact: null, members: []}
  },
  // Use international digits only, e.g. a confirmed Indian number prefixed with 91.
  // These contacts must be confirmed by the couple before enabling WhatsApp links.
  music: {src: null, title: null, licence: null},
  motion: {introDuration: 4800, ambient: true, leafDuration: 12000, boatBobDuration: 5000, petalDuration: 17000, rippleDuration: 2600, scratchThreshold: 0.40, scratchBrush: 34},
  // Original decorative miniatures; these illustrate the functions, not the actual venues.
  eventArtwork: {
    keertan: {src: 'assets/events/keertan.webp', alt: 'फूलों, दीपों और पूजा की चौकी से सजे भक्तिमय बगीचे का जलरंग चित्र'},
    cocktail: {src: 'assets/events/cocktail.webp', alt: 'बैठने की सजावट, लालटेनों और झिलमिल रोशनी वाले शाम के बगीचे का जलरंग चित्र'},
    haldi: {src: 'assets/events/haldi.webp', alt: 'गेंदे के फूलों की छतरी और पीतल के कटोरों से सजी हल्दी की रस्म का जलरंग चित्र'},
    wedding: {src: 'assets/events/wedding.webp', alt: 'हरे-भरे कमल उद्यान में फूलों से सजे विवाह मंडप का जलरंग चित्र'}
  },
  events: [
    {id: 'groom-cocktail', side: 'groom', type: 'cocktail', title: 'शुभम का कॉकटेल', date: null, time: null, venue: null, description: 'संगीत, हँसी और उनके अपनों के साथ एक सुहानी शाम।', timelineDescription: 'संगीत, हँसी और उनके अपने।', dressCode: null},
    {id: 'groom-haldi', side: 'groom', type: 'haldi', title: 'शुभम की हल्दी', date: null, time: null, venue: null, description: 'थोड़ी धूप, ढेर सारा प्यार और हल्दी के सुनहरे रंग।', timelineDescription: 'धूप, फूल और हल्दी के सुनहरे रंग।', dressCode: null},
    {id: 'bride-cocktail', side: 'bride', type: 'cocktail', title: 'हिमांशी का कॉकटेल', date: null, time: null, venue: null, description: 'संगीत, हँसी और उनके अपनों के साथ एक सुहानी शाम।', timelineDescription: 'संगीत, हँसी और उनके अपने।', dressCode: null},
    {id: 'bride-haldi', side: 'bride', type: 'haldi', title: 'हिमांशी की हल्दी', date: null, time: null, venue: null, description: 'फूलों, आशीर्वाद और अपनों की हँसी से सजी हल्दी।', timelineDescription: 'फूल, आशीर्वाद और खुशियों की रौनक।', dressCode: null},
    {id: 'wedding', side: 'shared', type: 'wedding', title: 'हिमांशी एवं शुभम — शुभ विवाह', date: '2027-02-10', time: null, timeLabel: 'रात्रि · सही समय शीघ्र बताया जाएगा', venue: {name: 'शिवप्रिया फार्म्स', city: 'देहरादून', address: null, mapsQuery: 'Shivpriya Farms, Dehradun'}, description: 'सात वचन। जीवन भर का साथ। हमारे विवाह के उत्सव में दोनों परिवार एक साथ।', timelineDescription: 'सात वचन। जीवन भर का साथ।', dressCode: null},
    // Previously provided facts; family allocation has NOT been confirmed.
    {id: 'unassigned-keertan', side: 'unassigned', type: 'keertan', title: 'कीर्तन', date: '2027-02-08', time: null, venue: null, description: 'भजन, प्रार्थना और आशीर्वाद। किस परिवार का आयोजन है, यह शीघ्र बताया जाएगा।'},
    {id: 'unassigned-cocktail', side: 'unassigned', type: 'cocktail', title: 'कॉकटेल', date: '2027-02-09', time: null, timeLabel: 'सायंकाल · सही समय शीघ्र बताया जाएगा', venue: {name: 'स्काई गार्डन', city: 'जोगीवाला, देहरादून', address: null, mapsQuery: 'Sky Garden, Jogiwala, Dehradun'}, description: 'आयोजन किस परिवार का है, इसकी पुष्टि बाकी है।'},
    {id: 'unassigned-haldi', side: 'unassigned', type: 'haldi', title: 'हल्दी', date: '2027-02-10', time: '10:00', venue: null, description: 'आयोजन किस परिवार का है, इसकी पुष्टि बाकी है।'}
  ],
  story: {
    heading: 'हमारा अब तक का सफ़र',
    paragraphs: ['हमारी हँसी, साथ की यात्राएँ और रोज़मर्रा के वे छोटे पल, जो सबसे प्यारी यादें बन गए।', 'अब हम जीवन के नए अध्याय की ओर बढ़ रहे हैं—दिलों में प्यार, साथ में हमारे परिवार और इस खुशी में आपका साथ।'],
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
