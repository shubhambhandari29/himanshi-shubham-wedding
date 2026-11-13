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
  const photoURL = photo => `assets/${encodeURIComponent(photo.file)}`;
  const wedding = config.events.find(event => event.id === 'wedding');
  const dateFormat = new Intl.DateTimeFormat(locale, {day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'});
  const dateOnly = date => new Date(`${date}T12:00:00+05:30`);
  const dateLabel = event => event.date ? dateFormat.format(dateOnly(event.date)) : event.dateLabel || 'तिथि शीघ्र बताई जाएगी';
  const clockLabel = event => {
    const [hours,minutes] = event.time.split(':').map(Number);
    const period = hours < 12 ? 'प्रातः' : hours < 16 ? 'अपराह्न' : hours < 20 ? 'सायं' : 'रात्रि';
    return `${period} ${formatDateNumber(hours % 12 || 12)}:${padDateNumber(minutes)} बजे`;
  };
  const timeLabel = event => event.time ? clockLabel(event) : event.timeLabel || 'समय शीघ्र बताया जाएगा';
  const venueLabel = event => event.venue ? [event.venue.name,event.venue.address,event.venue.city].filter(Boolean).join(', ') : 'स्थान शीघ्र बताया जाएगा';
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
  const skipButton = $('#skip-intro');
  let introState = 'idle', introTimer;
  opening.style.setProperty('--intro-duration', `${config.motion.introDuration}ms`);
  opening.style.setProperty('--leaf-period', `${config.motion.leafDuration}ms`);
  opening.style.setProperty('--bob-period', `${config.motion.boatBobDuration}ms`);
  opening.style.setProperty('--petal-period', `${config.motion.petalDuration}ms`);
  opening.style.setProperty('--ripple-period', `${config.motion.rippleDuration}ms`);
  if (!config.motion.ambient) opening.classList.add('still-water');
  function finishIntro({instant = false} = {}) {
    if (introState === 'revealed') return;
    clearTimeout(introTimer);
    introState = 'revealed';
    if (instant || motion.matches) opening.classList.add('instant');
    opening.dataset.stage = 'revealed';
    $('.intro-initial').setAttribute('aria-hidden','true');
    $('.intro-welcome').setAttribute('aria-hidden','false');
    $('.scroll-cue').removeAttribute('tabindex');
    const focusWasOpening = document.activeElement === tapButton || document.activeElement === skipButton;
    tapButton.hidden = true; skipButton.hidden = true;
    $('.intro-status').textContent = 'हिमांशी संग शुभम के शुभ विवाह में आपका स्वागत है। निमंत्रण देखने के लिए नीचे जाएँ।';
    if (focusWasOpening) $('.scroll-cue').focus({preventScroll:true});
  }
  function startIntro(event) {
    if (introState !== 'idle') return;
    if (motion.matches) { finishIntro({instant:true}); return; }
    const rect = opening.getBoundingClientRect();
    const ripple = document.createElement('span'); ripple.className = 'water-ripple'; ripple.setAttribute('aria-hidden','true');
    const pointer = event?.detail !== 0 && Number.isFinite(event?.clientX);
    ripple.style.left = `${pointer ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${pointer ? event.clientY - rect.top : rect.height * .6}px`;
    opening.append(ripple); setTimeout(() => ripple.remove(),config.motion.rippleDuration + 100);
    introState = 'sailing'; opening.dataset.stage = 'sailing';
    $('.intro-initial').setAttribute('aria-hidden','true'); $('.intro-welcome').setAttribute('aria-hidden','false');
    tapButton.disabled = true;
    introTimer = setTimeout(() => finishIntro(), config.motion.introDuration);
  }
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
      $('#reveal-date').textContent = 'इस तिथि को सहेज लीजिए ✧';
      $('#reveal-date').setAttribute('aria-label','विवाह तिथि खुल गई है: 10 फ़रवरी 2027');
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
  const mehendiEvent = config.events.find(event => event.id === 'bride-mehendi');
  $('#additional-venues').innerHTML = [
    {title:'हिमांशी के घर के समारोह',subtitle:'सत्संग · कीर्तन · हल्दी',venue:config.homeVenue},
    {title:'शुभम के घर के समारोह',subtitle:'मेहंदी एवं कॉकटेल · कीर्तन · हल्दी · बारात प्रस्थान · वधू स्वागत',venue:config.groomHomeVenue},
    {title:'मेहंदी एवं कॉकटेल',subtitle:mehendiEvent?`${dateLabel(mehendiEvent)} · ${timeLabel(mehendiEvent)}`:'',venue:mehendiEvent?.venue}
  ].filter(card=>card.venue).map(card=>`<article class="additional-venue"><p class="overline">${escapeHTML(card.title)}</p><h4>${escapeHTML(card.venue.name)}</h4><p>${escapeHTML([card.venue.address,card.venue.city].filter(Boolean).join(', '))}</p><p class="venue-functions">${escapeHTML(card.subtitle)}</p>${mapURL({venue:card.venue})?`<a class="text-button" href="${mapURL({venue:card.venue})}" target="_blank" rel="noopener noreferrer">रास्ता देखें ↗</a>`:''}</article>`).join('');
  const hindiNames = {baraat:'बारात प्रस्थान', welcome:'वधू स्वागत', satsang:'सत्संग', keertan:'कीर्तन', cocktail:'कॉकटेल', haldi:'हल्दी', wedding:'शुभ विवाह', mehendi:'मेहंदी एवं कॉकटेल', vidaai:'विदाई'};
  function eventIllustration(event, miniature=false) {
    const artwork = config.eventArtwork[event.type];
    if (!artwork) return '<span class="timeline-art-missing">चित्र शीघ्र जोड़ा जाएगा</span>';
    return `<img class="${miniature?'unassigned-scene':'timeline-scene-image'}" src="${escapeHTML(artwork.src)}" alt="${escapeHTML(artwork.alt)}" width="640" height="640" loading="lazy" decoding="async">`;
  }
  function floralMarker() {
    return `<svg viewBox="0 0 40 40" focusable="false" aria-hidden="true"><g fill="#cf9b9f" stroke="#b77c8755" stroke-width=".5">${Array.from({length:10},(_,i)=>`<ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(${i*36} 20 20)"/>`).join('')}</g><g fill="#e5c9ac">${Array.from({length:8},(_,i)=>`<ellipse cx="20" cy="15" rx="3.5" ry="6" transform="rotate(${i*45} 20 20)"/>`).join('')}</g><circle cx="20" cy="20" r="4.5" fill="#c6aa5f"/><circle cx="20" cy="20" r="2" fill="#eddaa0"/></svg>`;
  }
  function eventCard(event,index=0) {
    const shared=event.side==='shared';
    const date=event.date ? new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(event.date)).toUpperCase() : event.dateLabel || 'तिथि शीघ्र बताई जाएगी';
    const clock=event.time?clockLabel(event):null;
    const title=shared?'<span class="timeline-couple">हिमांशी संग शुभम</span><span class="sr-only"> — </span>शुभ विवाह':escapeHTML(event.title);
    const time=clock?`<span>${escapeHTML(clock)}</span>`:event.timeLabel?`<span>${escapeHTML(event.timeLabel)}</span>`:'<span>समय शीघ्र</span><span>बताया जाएगा</span>';
    return `<article role="listitem" class="timeline-event celebration-card event-type-${escapeHTML(event.type)}" id="event-${escapeHTML(event.id)}" data-position="${index%2===0?'art-left':'art-right'}" data-family="${escapeHTML(event.side)}"><figure class="timeline-scene">${eventIllustration(event)}</figure><span class="timeline-marker">${floralMarker()}</span><div class="timeline-details"><p class="timeline-date">${escapeHTML(date)}</p><p class="timeline-time ${clock?'':'is-pending'}" aria-label="${escapeHTML(timeLabel(event))}">${time}</p><h3>${title}</h3>${hindiNames[event.type]?`<p class="timeline-hindi" lang="hi">${hindiNames[event.type]}</p>`:''}<p class="timeline-description">${escapeHTML(event.timelineDescription || event.description)}</p><p class="timeline-venue">${escapeHTML(event.venue?venueLabel(event):'स्थान शीघ्र बताया जाएगा')}</p>${event.side==='shared'&&!event.time?'<p class="timeline-time-note">विवाह की रात्रि · सही समय शीघ्र बताया जाएगा</p>':''}<div class="timeline-actions">${mapURL(event)?`<a href="${mapURL(event)}" target="_blank" rel="noopener noreferrer">रास्ता देखें ↗</a>`:''}${event.date&&event.time?`<button type="button" data-calendar="${escapeHTML(event.id)}">कैलेंडर में जोड़ें</button>`:''}</div>${shared?'<p class="timeline-family-note">दो परिवार · जीवन भर का साथ</p>':''}${event.dressCode?`<p class="event-dress">परिधान: ${escapeHTML(event.dressCode)}</p>`:''}</div></article>`;
  }
  let timelineObserver;
  function updateTimelineProgress() {
    const timeline=$('#celebration-timeline');
    if(!timeline)return;
    const rect=timeline.getBoundingClientRect();
    const progress=motion.matches?1:Math.max(0,Math.min(1,(window.innerHeight*.76-rect.top)/Math.max(1,rect.height)));
    timeline.style.setProperty('--timeline-progress',String(progress));
  }
  function renderCelebrations(side) {
    timelineObserver?.disconnect();
    const timeline=$('#celebration-timeline');
    timeline.innerHTML=`<div class="timeline-track" aria-hidden="true"><span class="timeline-progress"></span></div>${scheduleEvents(side).map((event,index)=>eventCard(event,index)).join('')}<span class="timeline-end-dot" aria-hidden="true"></span>`;
    if(!motion.matches&&'IntersectionObserver' in window){
      timelineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        animate(entry.target.querySelector('.timeline-scene'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:950,easing:'cubic-bezier(.2,.5,.3,1)',fill:'backwards'});
        animate(entry.target.querySelector('.timeline-details'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:150,easing:'ease-out',fill:'backwards'});
        timelineObserver.unobserve(entry.target);
      }),{threshold:.15,rootMargin:'0px 0px -5% 0px'});
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
  $('#unassigned-events').innerHTML = unassignedEvents.map(event => `<article class="unassigned-event">${eventIllustration(event,true)}<div><small>आयोजन किस परिवार का है, इसकी पुष्टि बाकी है</small><strong>${escapeHTML(event.title)}</strong><span>${escapeHTML(dateLabel(event))} · ${escapeHTML(timeLabel(event))}<br>${escapeHTML(venueLabel(event))}</span>${mapURL(event)?`<br><a class="text-button" href="${mapURL(event)}" target="_blank" rel="noopener noreferrer">रास्ता देखें ↗</a>`:''}</div></article>`).join('');
  $('#story-copy').innerHTML = config.story.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  $('#story-heading').textContent = config.story.heading;
  $('#family-cards').innerHTML = ['bride','groom'].map(side => { const family = config.families[side]; return `<article class="family-card"><span aria-hidden="true">❧</span><p class="overline">${side==='bride'?'वधू का परिवार':'वर का परिवार'}</p><h3>${escapeHTML(family.name)}</h3>${family.members.length?`<ul>${family.members.map(member=>`<li>${escapeHTML(member.name)}<span>${escapeHTML(member.relationship)}</span></li>`).join('')}</ul>`:'<p class="family-placeholder">परिजनों के नाम शीघ्र साझा किए जाएँगे।</p>'}</article>`; }).join('');

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

  // Confirmed ceremony time drives the countdown; a date-only fallback remains available.
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
  track.innerHTML = config.photos.map((photo,index)=>`<figure class="photo-memory"><button class="photo-open" type="button" data-photo="${index}" aria-label="तस्वीर खोलें: ${escapeHTML(photo.caption)}"><img src="${photoURL(photo)}" alt="${escapeHTML(photo.alt)}" width="960" height="1280" loading="lazy" decoding="async" style="object-position:${escapeHTML(photo.position)}"><span aria-hidden="true">↗</span></button><figcaption>${escapeHTML(photo.caption)}</figcaption></figure>`).join('');
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
    $('#side-status').textContent=`${config.families[side].name} के समारोह · शुभ विवाह दोनों परिवारों का है।`;
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
  function updateMusic(){const playing=!audio.paused;musicButton.textContent=playing?'Ⅱ संगीत रोकें':'♫ संगीत चलाएँ';musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'पृष्ठभूमि का संगीत रोकें':'पृष्ठभूमि का संगीत चलाएँ');}
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
  function closeMenu(){mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','विकल्प खोलें');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'विकल्प बंद करें':'विकल्प खोलें');});
  $$('#mobile-nav a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();if(photoDialog.open)photoDialog.close();}});
  if('IntersectionObserver' in window&&!motion.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,[{opacity:.3,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'ease-out'});observer.unobserve(entry.target);} }),{threshold:.12});
    $$('.formal-invite,.venue-card,.family-card').forEach(element=>observer.observe(element));
  }

  // Small public surface for deterministic checks and local content previews.
  window.WeddingApp={setSide,finishIntro,startIntro,revealAllDates,calendarText,updateCountdown,scheduleEvents,updateTimelineProgress,getState:()=>({side:activeSide,intro:introState,scratched:scratchStates.map(state=>state.revealed)} )};
})();
