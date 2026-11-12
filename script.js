(() => {
  'use strict';
  const config = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const photoURL = photo => `assets/${encodeURIComponent(photo.file)}`;
  const wedding = config.events.find(event => event.id === 'wedding');
  const dateFormat = new Intl.DateTimeFormat('en-IN', {day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'});
  const dateOnly = date => new Date(`${date}T12:00:00+05:30`);
  const dateLabel = event => event.date ? dateFormat.format(dateOnly(event.date)) : 'To be announced';
  const timeLabel = event => event.time ? `${new Intl.DateTimeFormat('en-IN', {hour:'numeric',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date(`${event.date}T${event.time}:00+05:30`))} IST` : event.timeLabel || 'To be announced';
  const venueLabel = event => event.venue ? [event.venue.name,event.venue.city].filter(Boolean).join(', ') : 'To be announced';
  const mapURL = event => event.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.mapsQuery || venueLabel(event))}` : null;
  const eventSortKey = event => `${event.date || '0000-00-00'}T${event.time || '23:59'}`;
  const chronological = events => [...events].sort((a,b) => eventSortKey(a).localeCompare(eventSortKey(b)));
  const currentEvents = side => chronological(config.events.filter(event => event.side === side));
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
    $('.intro-status').textContent = 'Welcome to the wedding of Himanshi and Shubham. Scroll down to explore your invitation.';
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
    $('#scratch-status').textContent = `${revealed} of 3 date cards revealed.`;
    if (scratchStates.length === 3 && revealed === 3) {
      $('#date-details').hidden = false;
      $('#reveal-date').textContent = 'The date is yours to keep ✧';
      $('#reveal-date').setAttribute('aria-label','Wedding date revealed: 10 February 2027');
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
  const weekday = new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-day').textContent = new Intl.DateTimeFormat('en-IN',{day:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-month').textContent = new Intl.DateTimeFormat('en-IN',{month:'long',timeZone:'Asia/Kolkata'}).format(dateOnly(wedding.date));
  $('#date-year').textContent = wedding.date.slice(0,4);
  $('.wedding-weekday').textContent = weekday;
  $('.date-time').textContent = timeLabel(wedding); $('.date-venue').textContent = venueLabel(wedding);
  $('.formal-date').textContent = dateLabel(wedding).toUpperCase(); $('.formal-venue').textContent = venueLabel(wedding);
  $('[data-map="wedding"]').href = mapURL(wedding);
  const hindiNames = {keertan:'कीर्तन', cocktail:'कॉकटेल', haldi:'हल्दी', wedding:'शुभ विवाह', mehendi:'मेहंदी'};
  function eventIllustration(event, miniature=false) {
    const artwork = config.eventArtwork[event.type];
    if (!artwork) return '<span class="timeline-art-missing">Illustration to be added</span>';
    return `<img class="${miniature?'unassigned-scene':'timeline-scene-image'}" src="${escapeHTML(artwork.src)}" alt="${escapeHTML(artwork.alt)}" width="640" height="640" loading="lazy" decoding="async">`;
  }
  function floralMarker() {
    return `<svg viewBox="0 0 40 40" focusable="false" aria-hidden="true"><g fill="#cf9b9f" stroke="#b77c8755" stroke-width=".5">${Array.from({length:10},(_,i)=>`<ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(${i*36} 20 20)"/>`).join('')}</g><g fill="#e5c9ac">${Array.from({length:8},(_,i)=>`<ellipse cx="20" cy="15" rx="3.5" ry="6" transform="rotate(${i*45} 20 20)"/>`).join('')}</g><circle cx="20" cy="20" r="4.5" fill="#c6aa5f"/><circle cx="20" cy="20" r="2" fill="#eddaa0"/></svg>`;
  }
  function eventCard(event,index=0) {
    const shared=event.side==='shared';
    const date=event.date ? new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(dateOnly(event.date)).toUpperCase() : 'DATE TO BE ANNOUNCED';
    const clock=event.time?timeLabel(event).replace(/\sIST$/,'').toUpperCase():null;
    const title=shared?'<span class="timeline-couple">Himanshi &amp; Shubham</span><span class="sr-only"> — </span>The Wedding':escapeHTML(event.title);
    const time=clock?`<span>${escapeHTML(clock)}</span><small>IST</small>`:'<span>Time to be</span><span>announced</span>';
    return `<article role="listitem" class="timeline-event celebration-card event-type-${escapeHTML(event.type)}" id="event-${escapeHTML(event.id)}" data-position="${index%2===0?'art-left':'art-right'}" data-family="${escapeHTML(event.side)}"><figure class="timeline-scene">${eventIllustration(event)}</figure><span class="timeline-marker">${floralMarker()}</span><div class="timeline-details"><p class="timeline-date">${escapeHTML(date)}</p><p class="timeline-time ${clock?'':'is-pending'}" aria-label="${clock?escapeHTML(timeLabel(event)):'Time to be announced'}">${time}</p><h3>${title}</h3>${hindiNames[event.type]?`<p class="timeline-hindi" lang="hi">${hindiNames[event.type]}</p>`:''}<p class="timeline-description">${escapeHTML(event.timelineDescription || event.description)}</p><p class="timeline-venue">${escapeHTML(event.venue?venueLabel(event):'Venue to be announced')}</p>${event.side==='shared'&&!event.time?'<p class="timeline-time-note">Wedding night · exact time to follow</p>':''}<div class="timeline-actions">${event.venue?`<a href="${mapURL(event)}" target="_blank" rel="noopener noreferrer">Get directions ↗</a>`:''}${event.date&&event.time?`<button type="button" data-calendar="${escapeHTML(event.id)}">Add to calendar</button>`:''}</div>${shared?'<p class="timeline-family-note">BOTH FAMILIES · ONE FOREVER</p>':''}${event.dressCode?`<p class="event-dress">Dress: ${escapeHTML(event.dressCode)}</p>`:''}</div></article>`;
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
  $('#unassigned-events').innerHTML = config.events.filter(event => event.side === 'unassigned').map(event => `<article class="unassigned-event">${eventIllustration(event,true)}<div><small>FAMILY TO BE CONFIRMED</small><strong>${escapeHTML(event.title)}</strong><span>${escapeHTML(dateLabel(event))} · ${escapeHTML(timeLabel(event))}<br>${escapeHTML(venueLabel(event))}</span>${event.venue?`<br><a class="text-button" href="${mapURL(event)}" target="_blank" rel="noopener noreferrer">Get directions ↗</a>`:''}</div></article>`).join('');
  $('#story-copy').innerHTML = config.story.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
  $('#story-heading').textContent = config.story.heading;
  $('#family-cards').innerHTML = ['bride','groom'].map(side => { const family = config.families[side]; return `<article class="family-card"><span aria-hidden="true">❧</span><p class="overline">${side==='bride'?'THE BRIDE’S FAMILY':'THE GROOM’S FAMILY'}</p><h3>${escapeHTML(family.name)}</h3>${family.members.length?`<ul>${family.members.map(member=>`<li>${escapeHTML(member.name)}<span>${escapeHTML(member.relationship)}</span></li>`).join('')}</ul>`:'<p class="family-placeholder">Family names to be shared.</p>'}</article>`; }).join('');

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
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Himanshi and Shubham//Wedding Invitation//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${event.id}-2027@himanshi-shubham.example`,`DTSTAMP:${isoStamp(new Date())}`,dates,`SUMMARY:${escapeICS(event.title)}`,`LOCATION:${escapeICS(venueLabel(event))}`,`DESCRIPTION:${escapeICS(`${event.description} ${event.time?'':timeLabel(event)+'. This calendar entry saves the date; the exact event time is unconfirmed.'}`)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');
  }
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-calendar]'); if (!button) return;
    const entry = config.events.find(item => item.id === button.dataset.calendar), content = calendarText(entry);
    if (!content) return;
    const url = URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download=`${entry.id}-invitation.ics`; document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000); toast('Calendar file ready. Open it to save the date.');
  });

  // Date-only countdown is explicitly labelled until an exact wedding time is confirmed.
  const countdownTarget = new Date(`${wedding.date}T${wedding.time || '00:00'}:00+05:30`);
  function updateCountdown(now = new Date()) {
    const remaining = Math.max(0,countdownTarget-now);
    const values = [Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,index)=>$('#'+id).textContent=String(values[index]).padStart(2,'0'));
    $('#countdown-note').textContent = remaining ? `${wedding.time?'Until our wedding':'Until the wedding date begins'} · ${dateLabel(wedding)}${wedding.time?' · '+timeLabel(wedding):' · IST'}` : 'Our forever has begun. Thank you for being part of our story.';
  }
  updateCountdown(); setInterval(updateCountdown,1000);

  // Scroll-snap album with native touch scrolling and a shared keyboard-accessible lightbox.
  const track = $('#photo-track');
  track.innerHTML = config.photos.map((photo,index)=>`<figure class="photo-memory"><button class="photo-open" type="button" data-photo="${index}" aria-label="Open photo: ${escapeHTML(photo.caption)}"><img src="${photoURL(photo)}" alt="${escapeHTML(photo.alt)}" width="960" height="1280" loading="lazy" decoding="async" style="object-position:${escapeHTML(photo.position)}"><span aria-hidden="true">↗</span></button><figcaption>${escapeHTML(photo.caption)}</figcaption></figure>`).join('');
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
    image.src=photoURL(photo); image.alt=photo.alt; $('#photo-caption').textContent=photo.caption; $('#photo-counter').textContent=`${String(photoIndex+1).padStart(2,'0')} / ${String(config.photos.length).padStart(2,'0')}`;
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

  // The same family state drives the celebration timeline and RSVP options.
  let activeSide='groom'; const attendance=new Map();
  const form=$('#rsvp-form');
  function rememberAttendance() {
    $$('#rsvp-events .rsvp-event').forEach(row=>attendance.set(row.dataset.event,{selected:row.querySelector('[type=checkbox]').checked,count:Number(row.querySelector('[type=number]').value)}));
  }
  function renderRsvpEvents() {
    const entries=[...currentEvents(activeSide),wedding];
    $('#rsvp-events').innerHTML=entries.map(event=>{
      const saved=attendance.get(event.id)||{selected:false,count:1};
      const selected=saved.selected;
      return `<div class="rsvp-event" data-event="${event.id}"><label for="attend-${event.id}"><input type="checkbox" id="attend-${event.id}" ${selected?'checked':''}><span><strong>${escapeHTML(event.title)}</strong><small>${escapeHTML(dateLabel(event))}${event.side==='shared'?' · Both families':''}</small></span></label><div class="guest-stepper"><button type="button" data-step="-1" aria-label="One fewer guest for ${escapeHTML(event.title)}" ${selected?'':'disabled'}>−</button><input type="number" id="count-${event.id}" min="1" max="50" step="1" value="${saved.count}" aria-label="Number attending ${escapeHTML(event.title)}" ${selected?'':'disabled'}><button type="button" data-step="1" aria-label="One more guest for ${escapeHTML(event.title)}" ${selected?'':'disabled'}>+</button></div></div>`;
    }).join('');
    const contact=config.families[activeSide].contact;
    const validContact=typeof contact==='string'&&/^[1-9]\d{7,14}$/.test(contact);
    $('#send-whatsapp').disabled=!validContact;
    $('#contact-note').textContent=validContact?`Your reply will open in WhatsApp for ${config.families[activeSide].name}’s family. Review it before sending.`:`${config.families[activeSide].name}’s family WhatsApp contact will be shared soon. For now, copy your reply and share it with your host.`;
  }
  function setSide(requested,{updateUrl=true,remember=true}={}) {
    const side=requested==='bride'?'bride':'groom';
    if(remember)rememberAttendance();
    activeSide=side;
    $$('[data-side]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.side===side)));
    $('#rsvp-side').value=side;
    renderCelebrations(side);
    $('#side-status').textContent=`${config.families[side].name}’s family · the wedding is for both families.`;
    renderRsvpEvents();$('#rsvp-error').textContent='';$('#rsvp-status').textContent='';$('#copy-fallback').hidden=true;
    animate($('#celebration-timeline'),[{opacity:.45},{opacity:1}],{duration:450,easing:'ease-out'});
    if(updateUrl){
      const url=new URL(window.location.href);url.searchParams.set('side',side);
      if(url.href!==window.location.href)history.pushState({side},'',url);
    }
  }
  $$('[data-side]').forEach(button=>button.addEventListener('click',()=>setSide(button.dataset.side)));
  $('#rsvp-side').addEventListener('change',event=>setSide(event.target.value));
  setSide(new URL(window.location.href).searchParams.get('side'),{updateUrl:false,remember:false});
  window.addEventListener('popstate',()=>setSide(new URL(window.location.href).searchParams.get('side'),{updateUrl:false}));
  $('#rsvp-events').addEventListener('change',event=>{
    const row=event.target.closest('.rsvp-event');if(!row)return;
    if(event.target.type==='checkbox')row.querySelectorAll('.guest-stepper button,.guest-stepper input').forEach(control=>control.disabled=!event.target.checked);
    rememberAttendance();$('#rsvp-error').textContent='';
  });
  $('#rsvp-events').addEventListener('input',rememberAttendance);
  $('#rsvp-events').addEventListener('click',event=>{
    const button=event.target.closest('[data-step]');if(!button)return;
    const input=button.closest('.guest-stepper').querySelector('input');
    input.value=String(Math.max(1,Math.min(50,(Number(input.value)||1)+Number(button.dataset.step))));rememberAttendance();
  });
  function makeRsvpMessage({name,side,entries,message=''}) {
    return [`Wedding RSVP · Himanshi & Shubham`,`Guest: ${name.trim()}`,`Family: ${config.families[side].name}’s celebrations`,'','We would love to join you for:',...entries.map(({event,count})=>`• ${event.title} — ${count} ${count===1?'guest':'guests'} (${dateLabel(event)})`),message.trim()?`\nA little note: ${message.trim()}`:'','\nWith love!'].filter(line=>line!==null).join('\n');
  }
  function validateReply() {
    $('#rsvp-error').textContent='';
    if(!form.reportValidity())return null;
    const name=$('#guest-name').value.trim();
    if(!name){$('#rsvp-error').textContent='Please enter your name.';$('#guest-name').focus();return null;}
    rememberAttendance();
    const entries=[...currentEvents(activeSide),wedding].filter(event=>attendance.get(event.id)?.selected).map(event=>({event,count:attendance.get(event.id).count}));
    if(!entries.length){$('#rsvp-error').textContent='Please choose at least one function.';$('#rsvp-events input[type=checkbox]').focus();return null;}
    const invalid=entries.find(entry=>!Number.isInteger(entry.count)||entry.count<1||entry.count>50);
    if(invalid){$('#rsvp-error').textContent='Please use a whole guest count between 1 and 50 for each selected function.';$('#count-'+invalid.event.id).focus();return null;}
    return makeRsvpMessage({name,side:activeSide,entries,message:$('#guest-message').value});
  }
  async function copyReply(message) {
    try {
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard not available');
      await navigator.clipboard.writeText(message);$('#rsvp-status').textContent='Your reply is copied. Share it with your family host whenever you’re ready.';toast('Your reply is copied. Nothing has been sent.');
    } catch (_) {
      $('#copy-fallback').hidden=false;$('#reply-text').value=message;$('#reply-text').focus();$('#reply-text').select();
      $('#rsvp-status').textContent='Select and copy the message below, then share it with your host.';
    }
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();const message=validateReply();if(!message)return;
    const action=event.submitter?.value || 'copy';
    if(action==='copy'){await copyReply(message);return;}
    const number=config.families[activeSide].contact;
    if(typeof number!=='string'||!/^[1-9]\d{7,14}$/.test(number)){
      $('#rsvp-error').textContent='The family contact is not confirmed yet. Please use “Copy my reply”.';return;
    }
    const url=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url,'_blank','noopener,noreferrer');
    $('#rsvp-status').textContent='WhatsApp will open with your draft. Review it and choose Send there; this website has not sent your reply.';
  });

  // Optional licensed audio. No track is bundled or started automatically.
  const audio=$('#background-music'),musicButton=$('#music-toggle');
  if(config.music.src&&config.music.licence){audio.src=config.music.src;musicButton.hidden=false;musicButton.setAttribute('aria-label',`Play ${config.music.title || 'background music'}`);}
  function updateMusic(){const playing=!audio.paused;musicButton.textContent=playing?'Ⅱ Pause music':'♫ Play music';musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'Pause background music':'Play background music');}
  musicButton.addEventListener('click',async()=>{
    try{if(audio.paused)await audio.play();else audio.pause();updateMusic();$('#music-status').textContent=audio.paused?'Music paused.':'Music playing.';}
    catch(_){$('#music-status').textContent='Music could not be played. You can try again.';toast('Music couldn’t start. Tap again to retry.');}
  });
  audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);audio.addEventListener('error',()=>{$('#music-status').textContent='The music is unavailable right now.';});

  const menu=$('.menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(){mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $$('#mobile-nav a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();if(photoDialog.open)photoDialog.close();}});
  if('IntersectionObserver' in window&&!motion.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,[{opacity:.3,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'ease-out'});observer.unobserve(entry.target);} }),{threshold:.12});
    $$('.formal-invite,.venue-card,.family-card').forEach(element=>observer.observe(element));
  }

  // Small public surface for deterministic checks and local content previews.
  window.WeddingApp={setSide,finishIntro,startIntro,revealAllDates,calendarText,makeRsvpMessage,updateCountdown,scheduleEvents,updateTimelineProgress,getState:()=>({side:activeSide,intro:introState,scratched:scratchStates.map(state=>state.revealed)} )};
})();
