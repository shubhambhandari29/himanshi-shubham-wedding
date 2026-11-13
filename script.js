(() => {
  'use strict';
  const config = window.WEDDING;
  const locale = config.locale || 'hi-IN-u-nu-latn';
  const numberFormat = new Intl.NumberFormat(config.numberLocale || 'hi-IN-u-nu-latn',{useGrouping:false});
  const dateNumberFormat = new Intl.NumberFormat(locale,{useGrouping:false});
  const formatDateNumber = value => dateNumberFormat.format(value);
  const padDateNumber = value => formatDateNumber(value).padStart(2,'0');
  const formatNumber = value => numberFormat.format(value);
  const padNumber = value => formatNumber(value).padStart(2,'0');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const iconPaths = {
    left:'<path d="m14 6-6 6 6 6M8 12h12"/>',right:'<path d="m10 6 6 6-6 6M4 12h12"/>',
    up:'<path d="m6 14 6-6 6 6M12 8v12"/>',down:'<path d="m6 9 6 6 6-6"/>',
    external:'<path d="M14 4h6v6M20 4l-9 9M10 4H4v16h16v-6"/>',
    map:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
    enlarge:'<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14m8-14v14" stroke-width="3"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    skip:'<path d="m8 5 8 7-8 7M20 5v14"/>',tap:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>',
    reveal:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    phone:'<path d="m6 3 4 5-3 3c2 3 3 4 6 6l3-3 5 4c-1 3-3 4-5 3C9 19 5 15 3 8 2 6 3 4 6 3Z"/>',
    message:'<path d="M21 11a9 9 0 0 1-13 8l-5 2 1-5a9 9 0 1 1 17-5Z"/><path d="M8 11h8m-8 4h5"/>'
  };
  const icon = name => `<svg class="ui-icon" data-icon="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name] || iconPaths.external}</svg>`;
  $$('[data-icon]').forEach(slot => { slot.innerHTML=icon(slot.dataset.icon); });
  const photoURL = photo => `assets/${encodeURIComponent(photo.file)}`;
  const wedding = config.events.find(event => event.id === 'wedding');
  const dateFormat = new Intl.DateTimeFormat(locale, {day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'});
  const dateOnly = date => new Date(`${date}T12:00:00+05:30`);
  const dateLabel = event => event.date ? dateFormat.format(dateOnly(event.date)) : event.dateLabel || 'तिथि शीघ्र बताई जाएगी';
  const clockLabel = event => {
    const [hours,minutes] = event.time.split(':').map(Number);
    const period = hours < 12 ? 'प्रातः' : hours < 16 ? 'दोपहर' : hours < 20 ? 'सायं' : 'रात्रि';
    return `${period} ${formatDateNumber(hours % 12 || 12)}:${padDateNumber(minutes)} बजे`;
  };
  const timeLabel = event => event.time ? clockLabel(event) : event.timeLabel || 'समय शीघ्र बताया जाएगा';
  const venueLabel = event => event.venue ? [event.venue.name,event.venue.address,event.venue.city].filter(Boolean).join(', ') : 'स्थान शीघ्र बताया जाएगा';
  const shortVenueLabel = event => event.venue?.shortLabel || (event.venue ? [event.venue.name,event.venue.city].filter(Boolean).join(', ') : 'स्थान शीघ्र बताया जाएगा');
  const mapURL = event => event.venue?.mapsUrl || (event.venue && (!event.venue.isHome || event.venue.mapsQuery || event.venue.address) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.mapsQuery || venueLabel(event))}` : null);
  const eventSortKey = event => `${event.date || '0000-00-00'}T${event.time || '23:59'}`;
  const chronological = events => {
    const ordered = events.filter(event => !event.after).sort((a,b) => eventSortKey(a).localeCompare(eventSortKey(b)));
    events.filter(event => event.after).forEach(event => {
      const index = ordered.findIndex(item => item.id === event.after);
      ordered.splice(index < 0 ? ordered.length : index + 1, 0, event);
    });
    return ordered;
  };
  const scheduleEvents = side => chronological(config.events.filter(event => event.side === side || event.side === 'shared'));
  const animate = (element,frames,options) => { if (!motion.matches && element?.animate) element.animate(frames,options); };
  let toastTimer;
  function toast(message) {
    $('.toast').textContent = message; $('.toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').classList.remove('show'), 4500);
  }

  // Opening state lives in memory; ordinary page navigation and side switches never replay it.
  const opening = $('.water-opening');
  const tapButton = $('#water-tap');
  const skipButton = $('#skip-intro'), replayButton=$('#replay-intro');
  const boatImage=$('.boat-bob>img'), boatRoute=$('.boat-route');
  let introState = 'idle', introTimer, introLoadTimer, introAttempt=0, introFocusRequested=false;
  opening.style.setProperty('--intro-duration', `${config.motion.introDuration}ms`);
  opening.style.setProperty('--leaf-period', `${config.motion.leafDuration}ms`);
  opening.style.setProperty('--bob-period', `${config.motion.boatBobDuration}ms`);
  opening.style.setProperty('--petal-period', `${config.motion.petalDuration}ms`);
  opening.style.setProperty('--ripple-period', `${config.motion.rippleDuration}ms`);
  if (!config.motion.ambient) opening.classList.add('still-water');
  function finishIntro({instant = false} = {}) {
    if (introState === 'revealed') return;
    clearTimeout(introTimer);clearTimeout(introLoadTimer);introAttempt++;
    introState = 'revealed';
    if (instant || motion.matches) opening.classList.add('instant');
    opening.dataset.stage = 'revealed';
    $('.intro-initial').setAttribute('aria-hidden','true');
    $('.intro-welcome').setAttribute('aria-hidden','false');
    $('.scroll-cue').removeAttribute('tabindex');
    const focusWasOpening = introFocusRequested || document.activeElement === tapButton || document.activeElement === skipButton;
    introFocusRequested=false;
    tapButton.hidden = true; skipButton.hidden = true;tapButton.removeAttribute('aria-busy');
    replayButton.hidden=false;replayButton.innerHTML=`${icon('play')} ${motion.matches?'नाव का दृश्य चलाएँ':'नाव फिर चलाएँ'}`;
    delete opening.dataset.manualMotion;
    $('#intro-motion-hint').textContent=motion.matches?'आपके डिवाइस की गति कम रखने की पसंद का सम्मान किया गया है। इस बटन से केवल नाव का दृश्य अपनी इच्छा से चला सकते हैं।':'नाव का दृश्य दोबारा देखें। निमंत्रण की बाकी जानकारी वैसी ही रहेगी।';
    $('.intro-status').textContent = 'हिमांशी संग शुभम के शुभ विवाह में आपका स्वागत है। निमंत्रण देखने के लिए नीचे जाएँ।';
    if (focusWasOpening) $('.scroll-cue').focus({preventScroll:true});
  }
  function beginSailing(event,forceMotion,attempt){
    if(attempt!==introAttempt || introState==='revealed')return;
    clearTimeout(introLoadTimer);tapButton.removeAttribute('aria-busy');
    if(motion.matches&&!forceMotion){finishIntro({instant:true});return;}
    const rect = opening.getBoundingClientRect();
    const ripple = document.createElement('span'); ripple.className = 'water-ripple'; ripple.setAttribute('aria-hidden','true');
    const pointer = event?.detail !== 0 && Number.isFinite(event?.clientX);
    ripple.style.left = `${pointer ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${pointer ? event.clientY - rect.top : rect.height * .6}px`;
    opening.append(ripple); setTimeout(() => ripple.remove(),config.motion.rippleDuration + 100);
    if(forceMotion)opening.dataset.manualMotion='true';
    // Flush the resting transform before applying the destination (including Safari replays).
    void boatRoute.getBoundingClientRect();
    introState = 'sailing'; opening.dataset.stage = 'sailing';
    $('.intro-initial').setAttribute('aria-hidden','true'); $('.intro-welcome').setAttribute('aria-hidden','false');
    tapButton.disabled = true;
    introTimer = setTimeout(() => finishIntro(), config.motion.introDuration);
  }
  function startIntro(event,{forceMotion=false}={}) {
    if(introState!=='idle')return;
    if(motion.matches&&!forceMotion){finishIntro({instant:true});return;}
    const attempt=++introAttempt;
    introFocusRequested=document.activeElement===tapButton||document.activeElement===replayButton;
    tapButton.disabled=true;
    if(typeof boatImage.decode==='function'&&(!boatImage.complete||!boatImage.naturalWidth)){
      introState='loading';opening.dataset.stage='loading';tapButton.setAttribute('aria-busy','true');
      $('.intro-status').textContent='नाव का चित्र तैयार हो रहा है। चाहें तो सीधे निमंत्रण देखें।';
      introLoadTimer=setTimeout(()=>{if(attempt===introAttempt)finishIntro({instant:true});},10000);
      Promise.resolve().then(()=>boatImage.decode()).then(()=>beginSailing(event,forceMotion,attempt),()=>{if(attempt===introAttempt)finishIntro({instant:true});});
      return;
    }
    beginSailing(event,forceMotion,attempt);
  }
  function replayIntro(event){
    if(introState!=='revealed')return;
    introState='idle';opening.classList.add('instant');delete opening.dataset.manualMotion;opening.dataset.stage='idle';
    $('.intro-initial').setAttribute('aria-hidden','false');$('.intro-welcome').setAttribute('aria-hidden','true');
    $('.scroll-cue').setAttribute('tabindex','-1');
    tapButton.hidden=false;tapButton.disabled=false;skipButton.hidden=false;
    // Commit the reset without animation, then enable only the requested one-shot boat movement.
    void boatRoute.getBoundingClientRect();opening.classList.remove('instant');
    startIntro(event,{forceMotion:true});replayButton.hidden=true;
  }
  replayButton.addEventListener('click',replayIntro);
  tapButton.addEventListener('click',startIntro);
  skipButton.addEventListener('click',() => finishIntro({instant:true}));
  if (motion.matches) finishIntro({instant:true});
  motion.addEventListener?.('change',event => { if (event.matches) finishIntro({instant:true}); });
  let scrollTick = false;
  window.addEventListener('scroll',() => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      if (window.scrollY > opening.offsetHeight * .75 && introState !== 'revealed') finishIntro({instant:true});
      scrollTick = false;
    });
  },{passive:true});

  // A real erasing canvas for each date card. Canvas is decorative; the reveal button is equivalent.
  const scratchStates = [];
  function finishScratch(state) {
    if (state.revealed) return;
    state.revealed = true; state.card.classList.add('revealed');
    state.canvas.style.pointerEvents = 'none';
    if (state.pointerId !== null) {
      try { state.canvas.releasePointerCapture?.(state.pointerId); } catch (_) { /* Capture may already be released. */ }
      state.pointerId = null;
    }
    const revealed = scratchStates.filter(item => item.revealed).length;
    $('#scratch-status').textContent = `3 में से ${formatNumber(revealed)} तिथिपत्र खुले हैं।`;
    if (scratchStates.length === 3 && revealed === 3) {
      $('#date-details').hidden = false;
      $('#scratch-hint').hidden = true;
      const control=$('#reveal-date'), shouldMoveFocus=document.activeElement===control;
      control.hidden=true; control.disabled=true;
      if(shouldMoveFocus) $('#date-details [data-calendar]').focus({preventScroll:true});
    }
  }
  function paintCover(state) {
    if (state.revealed || !state.ctx) return;
    const {ctx,width,height} = state;
    ctx.globalCompositeOperation = 'source-over';
    const gold = ctx.createLinearGradient(0,0,width,height);
    gold.addColorStop(0,'#b29452'); gold.addColorStop(.35,'#d1b775'); gold.addColorStop(.52,'#e1c98d'); gold.addColorStop(.7,'#b89b58'); gold.addColorStop(1,'#cfb376');
    ctx.fillStyle = gold; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = '#fff4cb88'; ctx.lineWidth = 1; ctx.strokeRect(5,5,width-10,height-10);
    // Small botanical flourishes and stars give the cover a printed invitation feel.
    ctx.fillStyle = '#fff4d2b3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `italic ${Math.max(15,width*.16)}px Georgia`;
    ctx.fillText('✧',width*.5,height*.49);
    ctx.font = `${Math.max(10,width*.085)}px Georgia`;
    ctx.fillText('❦',width*.23,height*.25); ctx.fillText('❦',width*.77,height*.77);
  }
  function resizeScratch(state) {
    const rect = state.card.getBoundingClientRect();
    const width = Math.max(1,rect.width), height = Math.max(1,rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    let saved = null;
    if (state.ctx && state.started && !state.revealed) {
      saved = document.createElement('canvas'); saved.width = state.canvas.width; saved.height = state.canvas.height;
      saved.getContext('2d')?.drawImage(state.canvas,0,0);
    }
    state.width = width; state.height = height; state.ratio = ratio;
    state.canvas.width = Math.round(width*ratio); state.canvas.height = Math.round(height*ratio);
    state.ctx?.setTransform(ratio,0,0,ratio,0,0);
    if (state.revealed) return;
    if (saved && state.ctx) { state.ctx.globalCompositeOperation = 'source-over'; state.ctx.drawImage(saved,0,0,saved.width,saved.height,0,0,width,height); }
    else paintCover(state);
  }
  function erasedFraction(state) {
    if (!state.ctx) return 1;
    try {
      const pixels = state.ctx.getImageData(0,0,state.canvas.width,state.canvas.height).data;
      let erased = 0, samples = 0;
      for (let i=3;i<pixels.length;i+=32) { samples++; if (pixels[i]<128) erased++; }
      return samples ? erased/samples : 0;
    } catch (_) { return 0; }
  }
  function scratchPoint(state,event) {
    const rect = state.canvas.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*(state.width/(rect.width || 1)),y:(event.clientY-rect.top)*(state.height/(rect.height || 1))};
  }
  function scratchStroke(state,point) {
    if (!state.ctx || state.revealed) return;
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.globalAlpha = 1; ctx.lineWidth = config.motion.scratchBrush;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(state.previous?.x ?? point.x,state.previous?.y ?? point.y); ctx.lineTo(point.x,point.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(point.x,point.y,config.motion.scratchBrush/2,0,Math.PI*2); ctx.fill();
    state.previous = point; state.started = true; state.strokes++;
    if (state.strokes % 5 === 0 && erasedFraction(state) >= config.motion.scratchThreshold) finishScratch(state);
  }
  $$('.scratch-card').forEach(card => {
    const canvas = card.querySelector('canvas');
    let ctx = null; try { ctx = canvas.getContext('2d',{willReadFrequently:true}); } catch (_) { /* Accessible button remains usable. */ }
    const state = {card,canvas,ctx,revealed:false,started:false,previous:null,pointerId:null,strokes:0};
    scratchStates.push(state); resizeScratch(state);
    canvas.addEventListener('pointerdown',event => {
      if (state.revealed || !state.ctx || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault(); state.pointerId = event.pointerId; state.previous = null;
      try { canvas.setPointerCapture?.(event.pointerId); } catch (_) {}
      scratchStroke(state,scratchPoint(state,event));
    });
    canvas.addEventListener('pointermove',event => {
      if (state.pointerId !== event.pointerId || state.revealed) return;
      event.preventDefault();
      const points = event.getCoalescedEvents?.() || [event];
      points.forEach(point => scratchStroke(state,scratchPoint(state,point)));
    });
    const endScratch = event => {
      if (state.pointerId !== event.pointerId) return;
      try { canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
      state.pointerId = null; state.previous = null;
      if (erasedFraction(state) >= config.motion.scratchThreshold) finishScratch(state);
    };
    canvas.addEventListener('pointerup',endScratch); canvas.addEventListener('pointercancel',endScratch); canvas.addEventListener('lostpointercapture',endScratch);
  });
  function revealAllDates() { scratchStates.forEach(finishScratch); }
  $('#reveal-date').addEventListener('click',revealAllDates);
  if (scratchStates.some(state => !state.ctx)) revealAllDates();
  let resizeTimer;
  window.addEventListener('resize',() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => scratchStates.forEach(resizeScratch),140); });

  // All editable facts live in content.js; dates and maps are never fabricated.
  const weekday = new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-day').textContent = new Intl.DateTimeFormat(locale,{day:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-month').textContent = new Intl.DateTimeFormat(locale,{month:'long',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-year').textContent = formatDateNumber(Number(wedding.date.slice(0,4)));
  $('.wedding-weekday').textContent = weekday;
  $('.date-time').textContent = timeLabel(wedding); $('.date-venue').textContent = venueLabel(wedding);
  $('.formal-date').textContent = dateLabel(wedding).toUpperCase(); $('.formal-venue').textContent = venueLabel(wedding);
  ['bride','groom'].forEach(side => {
    const parents = config.families[side].members;
    $('#formal-'+side+'-parents').innerHTML = parents.map((parent,index) => `${index?'<br>एवं ':''}${escapeHTML(parent.name)}`).join('');
  });
  $('[data-map="wedding"]').href = mapURL(wedding);
  $('#wedding-venue-heading').textContent = wedding.venue.name;
  $('#wedding-venue-schedule').innerHTML = `${escapeHTML(dateLabel(wedding))}<br>${escapeHTML(timeLabel(wedding))}`;
  const ownedEvents = side => chronological(config.events.filter(event => event.side===side));
  const homeSummary = (side,venue) => [...new Set(ownedEvents(side).filter(event=>event.venue===venue).map(event=>event.title))].join(' · ');
  const venueCards = [
    {side:'bride',title:'हिमांशी के घर के समारोह',subtitle:homeSummary('bride',config.homeVenue),venue:config.homeVenue},
    {side:'groom',title:'शुभम के घर के समारोह',subtitle:homeSummary('groom',config.groomHomeVenue),venue:config.groomHomeVenue},
    ...config.events.filter(event=>event.side!=='shared'&&event.venue&&!event.venue.isHome).map(event=>({side:event.side,title:`${config.families[event.side].name} की ${event.title}`,subtitle:`${dateLabel(event)} · ${timeLabel(event)}`,venue:event.venue}))
  ];
  $('#additional-venues').innerHTML=venueCards.filter(card=>card.venue).map(card=>`<article class="additional-venue" data-owner="${card.side}"><p class="overline">${escapeHTML(card.title)}</p><h4>${escapeHTML(card.venue.name)}</h4><p>${escapeHTML([card.venue.address,card.venue.city].filter(Boolean).join(', '))}</p><p class="venue-functions">${escapeHTML(card.subtitle)}</p>${mapURL({venue:card.venue})?`<a class="text-button" href="${escapeHTML(mapURL({venue:card.venue}))}" target="_blank" rel="noopener noreferrer">रास्ता देखें ${icon('map')}</a>`:''}</article>`).join('');
  function eventIllustration(event, miniature=false) {
    const artwork = config.eventArtwork[event.type];
    if (!artwork) return '<span class="timeline-art-missing">चित्र शीघ्र जोड़ा जाएगा</span>';
    return `<img class="${miniature?'unassigned-scene':'timeline-scene-image'}" src="${escapeHTML(artwork.src)}" alt="${escapeHTML(artwork.alt)}" width="${artwork.width || 640}" height="${artwork.height || 640}" loading="lazy" decoding="async">`;
  }
  function floralMarker() {
    return `<svg viewBox="0 0 40 40" focusable="false" aria-hidden="true"><g fill="#cf9b9f" stroke="#b77c8755" stroke-width=".5">${Array.from({length:10},(_,i)=>`<ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(${i*36} 20 20)"/>`).join('')}</g><g fill="#e5c9ac">${Array.from({length:8},(_,i)=>`<ellipse cx="20" cy="15" rx="3.5" ry="6" transform="rotate(${i*45} 20 20)"/>`).join('')}</g><circle cx="20" cy="20" r="4.5" fill="#c6aa5f"/><circle cx="20" cy="20" r="2" fill="#eddaa0"/></svg>`;
  }
  const eventTreatments={mehendi:'evening',cocktail:'evening',satsang:'devotional',keertan:'devotional',haldi:'sunny',baraat:'procession',wedding:'wedding',welcome:'dawn',vidaai:'moonlight'};
  function groupEvents(side){
    const groups=[];
    scheduleEvents(side).forEach(event=>{
      // Vidaai follows the wedding, but keeps its unspecified date/time honest.
      const key=event.date || (event.after?'after-'+event.after:'pending');
      let group=groups.find(item=>item.date===key);
      if(!group){group={date:key,events:[]};groups.push(group);}
      group.events.push(event);
    });
    return groups;
  }
  function eventCard(event,index=0) {
    const shared=event.side==='shared',treatment=eventTreatments[event.type] || 'devotional';
    const familyLabel=shared?'दोनों परिवारों का साझा समारोह':config.families[event.side].label;
    const title=shared?'<span class="timeline-couple">हिमांशी संग शुभम</span><span class="sr-only"> — </span>शुभ विवाह':escapeHTML(event.title);
    const date=event.date?dateLabel(event):event.dateLabel || 'तिथि शीघ्र बताई जाएगी';
    const dateMarkup=event.date?`<time datetime="${event.date}">${escapeHTML(date)}</time>`:escapeHTML(date);
    const description=event.timelineDescription && ![event.title,event.timeLabel].filter(Boolean).some(text=>text.replace(/[।.!\s]+$/u,'')===event.timelineDescription.replace(/[।.!\s]+$/u,'')) ? event.timelineDescription : null;
    return `<article role="listitem" class="timeline-event event-card event-type-${escapeHTML(event.type)} treatment-${treatment}" id="event-${escapeHTML(event.id)}" data-position="${shared?'center':index%2===0?'art-left':'art-right'}" data-family="${escapeHTML(event.side)}" data-treatment="${treatment}" aria-labelledby="title-${escapeHTML(event.id)}"><figure class="timeline-scene">${eventIllustration(event)}<span class="scene-atmosphere" aria-hidden="true"><i></i><i></i><i></i></span></figure><div class="timeline-details"><p class="family-badge">${escapeHTML(familyLabel)}</p><p class="timeline-date ${event.date&&!shared?'sr-only':''}">${dateMarkup}</p><p class="timeline-time ${event.time?'':'is-pending'}" aria-label="${escapeHTML(timeLabel(event))}">${escapeHTML(timeLabel(event))}</p><h3 id="title-${escapeHTML(event.id)}" aria-level="4">${title}</h3>${description?`<p class="timeline-description">${escapeHTML(description)}</p>`:''}<p class="timeline-venue">${escapeHTML(shortVenueLabel(event))}</p>${shared&&!event.time?'<p class="timeline-time-note">विवाह की रात्रि · सही समय शीघ्र बताया जाएगा</p>':''}<div class="timeline-actions">${mapURL(event)?`<a href="${escapeHTML(mapURL(event))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(event.title)}: ${escapeHTML(shortVenueLabel(event))} का रास्ता देखें">${icon('map')} रास्ता देखें</a>`:''}${event.date&&event.time?`<button type="button" data-calendar="${escapeHTML(event.id)}" aria-label="${escapeHTML(event.title)} कैलेंडर में जोड़ें">${icon('calendar')} कैलेंडर में जोड़ें</button>`:''}</div>${event.dressCode?`<p class="event-dress">परिधान: ${escapeHTML(event.dressCode)}</p>`:''}</div></article>`;
  }
  let timelineObserver;
  function updateTimelineProgress() {
    $$('#celebration-timeline .day-events').forEach(day=>{
      const rect=day.getBoundingClientRect();
      const progress=motion.matches?1:Math.max(0,Math.min(1,(window.innerHeight*.76-rect.top)/Math.max(1,rect.height)));
      day.style.setProperty('--day-progress',String(progress));
    });
  }
  function renderCelebrations(side) {
    timelineObserver?.disconnect();
    const timeline=$('#celebration-timeline');
    timeline.innerHTML=groupEvents(side).map((group,index)=>{
      const paired=group.events.filter(e=>['satsang','keertan'].includes(e.type)).length>1;
      const heading=group.date==='pending'?'आगामी समारोह':group.date.startsWith('after-')?group.events[0].dateLabel || 'विवाह के बाद':dateLabel({date:group.date});
      return `<section class="celebration-day" data-date="${group.date}" aria-labelledby="day-${side}-${index}"><header class="day-heading"><span class="day-ornament" aria-hidden="true">${floralMarker()}</span><h3 id="day-${side}-${index}">${heading}</h3><span class="day-heading-line" aria-hidden="true"></span></header><div class="day-events ${paired?'devotional-pair':''}" role="list" aria-label="${heading} के समारोह">${group.events.map((event,eventIndex)=>eventCard(event,eventIndex)).join('')}</div></section>`;
    }).join('');
    if(!motion.matches&&'IntersectionObserver' in window){
      timelineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const treatment=entry.target.dataset.treatment;
        const sceneFrames=treatment==='procession'?[{opacity:0,transform:'translateX(-20px)'},{opacity:1,transform:'translateX(0)'}]:treatment==='wedding'?[{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}]:[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}];
        animate(entry.target.querySelector('.timeline-scene'),sceneFrames,{duration:treatment==='wedding'?1400:950,easing:'cubic-bezier(.2,.5,.3,1)',fill:'backwards'});
        animate(entry.target.querySelector('.timeline-details'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:150,easing:'ease-out',fill:'backwards'});
        entry.target.classList.add('scene-entered');
        timelineObserver.unobserve(entry.target);
      }),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
      timeline.querySelectorAll('.timeline-event').forEach(row=>timelineObserver.observe(row));
    }
    updateTimelineProgress();
  }
  let timelineScrollPending=false;
  window.addEventListener('scroll',()=>{
    if(timelineScrollPending)return;
    timelineScrollPending=true;requestAnimationFrame(()=>{updateTimelineProgress();timelineScrollPending=false;});
  },{passive:true});
  window.addEventListener('resize',updateTimelineProgress);
  motion.addEventListener?.('change',()=>{
    if(motion.matches){
      timelineObserver?.disconnect();
      $('#celebration-timeline').getAnimations?.({subtree:true}).forEach(animation=>animation.finish());
    }
    updateTimelineProgress();
  });
  const unassignedEvents = config.events.filter(event => event.side === 'unassigned');
  $('.pending-events').hidden = unassignedEvents.length === 0;
  $('#unassigned-events').innerHTML = unassignedEvents.map(event => `<article class="unassigned-event">${eventIllustration(event,true)}<div><small>आयोजन किस परिवार का है, इसकी पुष्टि बाकी है</small><strong>${escapeHTML(event.title)}</strong><span>${escapeHTML(dateLabel(event))} · ${escapeHTML(timeLabel(event))}<br>${escapeHTML(venueLabel(event))}</span>${mapURL(event)?`<br><a class="text-button" href="${escapeHTML(mapURL(event))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(event.title)}: ${escapeHTML(shortVenueLabel(event))} का रास्ता देखें">रास्ता देखें ${icon('map')}</a>`:''}</div></article>`).join('');
  $('#story-copy').innerHTML = config.story.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  $('#story-heading').textContent = config.story.heading;
  function renderContacts(){
    const families=['groom','bride'].map(side=>({side,family:config.families[side],numbers:[...new Set(config.families[side].contacts || [])].filter(phone=>typeof phone==='string'&&/^\+[1-9]\d{7,14}$/.test(phone))})).filter(entry=>entry.numbers.length);
    $('#contacts').hidden=families.length===0;
    $$('[data-contact-nav]').forEach(link=>link.hidden=families.length===0);
    $('#contact-cards').innerHTML=families.map(({side,family,numbers})=>`<article class="contact-card" data-family="${side}" aria-labelledby="contact-${side}-heading"><h3 id="contact-${side}-heading">${escapeHTML(family.name)} का परिवार</h3>${numbers.map(phone=>{
      const digits=phone.slice(1),local=phone.startsWith('+91')?phone.slice(3):digits,display=local.length===10?local.slice(0,5)+' '+local.slice(5):phone;
      return `<div class="contact-entry" data-phone="${phone}"><p class="contact-number"><bdi dir="ltr">${display}</bdi></p><div class="contact-actions"><a href="tel:${phone}" aria-label="${escapeHTML(family.name)} के परिवार को ${display} पर कॉल करें">${icon('phone')} कॉल करें</a><a href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(family.name)} के परिवार से ${display} पर व्हाट्सऐप पर संपर्क करें">${icon('message')} व्हाट्सऐप</a></div></div>`;
    }).join('')}</article>`).join('');
  }
  renderContacts();

  function calendarText(event) {
    if (!event?.date) return null;
    const escapeICS = value => String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const isoStamp = date => date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    let dates;
    if (event.time) dates = `DTSTART:${isoStamp(new Date(`${event.date}T${event.time}:00+05:30`))}`;
    else {
      const nextDate = new Date(`${event.date}T00:00:00Z`); nextDate.setUTCDate(nextDate.getUTCDate()+1);
      dates = `DTSTART;VALUE=DATE:${event.date.replace(/-/g,'')}\r\nDTEND;VALUE=DATE:${nextDate.toISOString().slice(0,10).replace(/-/g,'')}`;
    }
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Himanshi and Shubham//Wedding Invitation//HI','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${event.id}-2027@himanshi-shubham.example`,`DTSTAMP:${isoStamp(new Date())}`,dates,`SUMMARY:${escapeICS(event.title)}`,`LOCATION:${escapeICS(venueLabel(event))}`,`DESCRIPTION:${escapeICS(`${event.description} ${event.time?'':timeLabel(event)+'। इस प्रविष्टि में विवाह तिथि सहेजी गई है; आयोजन का सही समय अभी तय नहीं है।'}`)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
  }
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-calendar]'); if (!button) return;
    const entry = config.events.find(item => item.id === button.dataset.calendar), content = calendarText(entry);
    if (!content) return;
    const url = URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download=`${entry.title.replace(/[^\p{L}\p{N} ._-]/gu,'').trim()}-निमंत्रण.ics`; document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000); toast('कैलेंडर की फ़ाइल तैयार है। तिथि सहेजने के लिए इसे खोलें।');
  });

  // Confirmed wedding time drives the countdown; a date-only fallback remains available.
  const countdownTarget = new Date(`${wedding.date}T${wedding.time || '00:00'}:00+05:30`);
  function updateCountdown(now = new Date()) {
    const remaining = Math.max(0,countdownTarget-now);
    const values = [Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,index)=>$('#'+id).textContent=padNumber(values[index]));
    $('#countdown-note').textContent = remaining ? `${wedding.time?'हमारे शुभ विवाह तक':'विवाह तिथि के आरंभ तक'} · ${dateLabel(wedding)}${wedding.time?' · '+timeLabel(wedding):''}` : 'हमारे जीवन भर के साथ का शुभारंभ हो चुका है। हमारी खुशियों का हिस्सा बनने के लिए धन्यवाद।';
  }
  updateCountdown(); setInterval(updateCountdown,1000);

  // Scroll-snap album with native touch scrolling and a shared keyboard-accessible lightbox.
  const track = $('#photo-track');
  track.innerHTML = config.photos.map((photo,index)=>`<figure class="photo-memory"><button class="photo-open" type="button" data-photo="${index}" aria-label="तस्वीर खोलें: ${escapeHTML(photo.caption)}"><img src="${photoURL(photo)}" alt="${escapeHTML(photo.alt)}" width="960" height="1280" loading="lazy" decoding="async" style="object-position:${escapeHTML(photo.position)}"><span aria-hidden="true">${icon('enlarge')}</span></button><figcaption>${escapeHTML(photo.caption)}</figcaption></figure>`).join('');
  function moveGallery(direction) {
    const card = track.querySelector('.photo-memory');
    const step = (card?.getBoundingClientRect().width || 300) + (window.innerWidth <=600 ?18:25);
    track.scrollBy({left:direction*step,behavior:motion.matches?'instant':'smooth'});
  }
  $('#gallery-prev').addEventListener('click',()=>moveGallery(-1)); $('#gallery-next').addEventListener('click',()=>moveGallery(1));
  track.addEventListener('keydown',event=>{ if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);} });
  const photoDialog = $('#photo-dialog'); let photoIndex=0, photoOpener;
  function showPhoto(index) {
    photoIndex=(index+config.photos.length)%config.photos.length;
    const photo=config.photos[photoIndex], image=$('#lightbox-image');
    image.src=photoURL(photo); image.alt=photo.alt; $('#photo-caption').textContent=photo.caption; $('#photo-counter').textContent=`${padNumber(photoIndex+1)} / ${padNumber(config.photos.length)}`;
    animate(image,[{opacity:.3},{opacity:1}],{duration:250});
  }
  track.addEventListener('click',event=>{
    const button=event.target.closest('[data-photo]');if(!button)return;
    photoOpener=button;showPhoto(Number(button.dataset.photo)); photoDialog.showModal();document.documentElement.classList.add('album-open');
  });
  $('#photo-close').addEventListener('click',()=>photoDialog.close());
  $('#photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));
  photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowRight'?1:-1));}});
  photoDialog.addEventListener('click',event=>{if(event.target===photoDialog)photoDialog.close();});
  photoDialog.addEventListener('close',()=>{document.documentElement.classList.remove('album-open');photoOpener?.focus({preventScroll:true});});
  let touchStart;
  $('#lightbox-image').addEventListener('touchstart',event=>{touchStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
  $('#lightbox-image').addEventListener('touchend',event=>{
    if(!touchStart)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));touchStart=null;
  },{passive:true});

  // Family selection updates the timeline and preserves shareable links.
  let activeSide='groom';
  function setSide(requested,{updateUrl=true}={}) {
    const side=requested==='bride'?'bride':'groom';
    activeSide=side;
    $$('[data-side]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.side===side)));
    renderCelebrations(side);
    animate($('#celebration-timeline'),[{opacity:.45},{opacity:1}],{duration:450,easing:'ease-out'});
    if(updateUrl){
      const url=new URL(window.location.href);url.searchParams.set('side',side);
      if(url.href!==window.location.href)history.pushState({side},'',url);
    }
  }
  $$('[data-side]').forEach(button=>button.addEventListener('click',()=>setSide(button.dataset.side)));
  setSide(new URL(window.location.href).searchParams.get('side'),{updateUrl:false});
  window.addEventListener('popstate',()=>setSide(new URL(window.location.href).searchParams.get('side'),{updateUrl:false}));

  // Try audible autoplay, then retry within a real guest interaction if blocked.
  const audio=$('#background-music'),musicButton=$('#music-toggle');
  if(config.music.src&&config.music.enabled!==false){audio.src=config.music.src;audio.volume=config.music.volume ?? 0.4;musicButton.hidden=false;musicButton.setAttribute('aria-label',`${config.music.title || 'पृष्ठभूमि का संगीत'} चलाएँ`);}
  function updateMusic(){const playing=!audio.paused;musicButton.innerHTML=playing?`${icon('pause')} संगीत रोकें`:`${icon('play')} संगीत चलाएँ`;musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'पृष्ठभूमि का संगीत रोकें':'पृष्ठभूमि का संगीत चलाएँ');}
  let musicStarted=false, musicChoice=false, musicPending=false;
  async function startMusicAutomatically(){
    if(musicButton.hidden||musicChoice||musicStarted||musicPending)return;
    musicPending=true;
    try{await audio.play();musicStarted=true;updateMusic();}
    catch(_){/* Browsers can require a user gesture; keep the manual control available. */}
    finally{musicPending=false;}
  }
  function startMusicOnInteraction(event){
    if(event.target.closest?.('#music-toggle'))return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    void startMusicAutomatically();
  }
  document.addEventListener('click',startMusicOnInteraction);
  document.addEventListener('keydown',startMusicOnInteraction);
  musicButton.addEventListener('click',async()=>{
    musicChoice=true;
    try{if(audio.paused)await audio.play();else audio.pause();updateMusic();$('#music-status').textContent=audio.paused?'संगीत रुक गया है।':'संगीत चल रहा है।';}
    catch(_){$('#music-status').textContent='संगीत नहीं चल सका। आप फिर प्रयास कर सकते हैं।';toast('संगीत शुरू नहीं हो सका। फिर प्रयास करने के लिए स्पर्श करें।');}
  });
  audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);audio.addEventListener('error',()=>{$('#music-status').textContent='संगीत अभी उपलब्ध नहीं है।';});

  void startMusicAutomatically();

  const menu=$('.menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(){menu.innerHTML=icon('menu');mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','विकल्प खोलें');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.innerHTML=icon(open?'close':'menu');mobileNav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'विकल्प बंद करें':'विकल्प खोलें');});
  $$('#mobile-nav a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();if(photoDialog.open)photoDialog.close();}});
  if('IntersectionObserver' in window&&!motion.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,[{opacity:.3,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'ease-out'});observer.unobserve(entry.target);} }),{threshold:.12});
    $$('.formal-invite,.venue-card,.family-card').forEach(element=>observer.observe(element));
  }

  // Small public surface for deterministic checks and local content previews.
  window.WeddingApp={setSide,finishIntro,startIntro,replayIntro,revealAllDates,calendarText,updateCountdown,scheduleEvents,updateTimelineProgress,groupEvents,renderContacts,getState:()=>({side:activeSide,intro:introState,scratched:scratchStates.map(state=>state.revealed)} )};
})();
