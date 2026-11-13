const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {createCanvas,Image}=require('@napi-rs/canvas');
const cssTree=require('css-tree');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

function setup({url='http://localhost:5173/',reduced=false,canvas=true,music=false,clipboard=false,dpr=1,observeTimeline=false,weddingTime=undefined,autoplayAllowed=false}={}) {
  const errors=[],downloads=[],opened=[],copied=[],animations=[],observers=[];
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error));
  const dom=new JSDOM(html.replace(/<noscript>[\s\S]*?<\/noscript>/g,''),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
  const w=dom.window,d=w.document;
  Object.defineProperty(w,'devicePixelRatio',{value:dpr,configurable:true});
  w.matchMedia=()=>({matches:reduced,addEventListener(){}});
  w.Element.prototype.animate=function(frames,options){animations.push({element:this,frames,options});return{}};
  if(observeTimeline)w.IntersectionObserver=class{constructor(callback,options){this.callback=callback;this.options=options;this.elements=[];observers.push(this)}observe(element){this.elements.push(element)}unobserve(){}disconnect(){this.disconnected=true}};
  w.Element.prototype.scrollIntoView=function(){};
  w.Element.prototype.scrollBy=function(value){this.scrollLeft+=(value.left||0)};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.HTMLAnchorElement.prototype.click=function(){this.downloadClicked=true};
  w.URL.createObjectURL=blob=>{downloads.push(blob);return'blob:test'};w.URL.revokeObjectURL=()=>{};
  w.open=(url,...args)=>{opened.push(url);return{}};
  if(clipboard)Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async message=>copied.push(message)},configurable:true});
  const backing=new WeakMap();
  function getBacking(element){if(!backing.has(element))backing.set(element,createCanvas(element.width||300,element.height||150));return backing.get(element)}
  for(const dimension of ['width','height']){
    const descriptor=Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,dimension);
    Object.defineProperty(w.HTMLCanvasElement.prototype,dimension,{configurable:true,get:descriptor.get,set(value){descriptor.set.call(this,value);if(backing.has(this))backing.get(this)[dimension]=Number(value)}});
  }
  w.HTMLCanvasElement.prototype.getContext=function(){
    if(!canvas)return null;
    const native=getBacking(this).getContext('2d');
    return new Proxy(native,{get(target,key){if(key==='drawImage')return(image,...args)=>target.drawImage(backing.get(image)||image,...args);const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value},set(target,key,value){target[key]=value;return true}});
  };
  w.HTMLElement.prototype.getBoundingClientRect=function(){
    if(this.matches?.('.scratch-card, .scratch-card canvas'))return {x:0,y:0,left:0,top:0,right:150,bottom:158,width:150,height:158};
    if(this.matches?.('.water-opening'))return{left:0,top:0,width:390,height:844,right:390,bottom:844};
    if(this.matches?.('.photo-memory'))return{left:0,top:0,width:300,height:400,right:300,bottom:400};
    return{left:0,top:0,width:0,height:0,right:0,bottom:0};
  };
  w.Element.prototype.setPointerCapture=function(){};w.Element.prototype.releasePointerCapture=function(){};
  w.eval(fs.readFileSync(path.join(root,'content.js'),'utf8'));
  if(weddingTime!==undefined)w.WEDDING.events.find(event=>event.id==='wedding').time=weddingTime;
  if(music===false)w.WEDDING.music={src:null,title:null,licence:null};
  if(music===true)w.WEDDING.music={src:'licensed-test-track.mp3',title:'Test track',licence:'Test fixture only'};
  let audioPaused=true,audioPlays=0;
  const audio=d.querySelector('audio');
  Object.defineProperty(audio,'paused',{get:()=>audioPaused});
  let playAttempts=0;
  audio.play=async()=>{if(playAttempts++===0&&!autoplayAllowed)throw new w.DOMException('Autoplay blocked','NotAllowedError');audioPaused=false;audioPlays++;audio.dispatchEvent(new w.Event('play'))};
  audio.pause=()=>{audioPaused=true;audio.dispatchEvent(new w.Event('pause'))};
  w.eval(fs.readFileSync(path.join(root,'script.js'),'utf8'));
  return{dom,w,d,errors,downloads,opened,copied,backing,getBacking,animations,observers,audioPlays:()=>audioPlays,close:()=>w.close()};
}
function pointer(env,element,type,x,y,id=1){const event=new env.w.Event(type,{bubbles:true,cancelable:true});Object.assign(event,{clientX:x,clientY:y,pointerId:id,pointerType:'touch',isPrimary:true,button:0});element.dispatchEvent(event)}
function submit(env,action){env.d.querySelector('#rsvp-form').dispatchEvent(new env.w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:env.d.querySelector(action)}))}
function selectEvent(env,id,count=1){const checkbox=env.d.getElementById('attend-'+id);checkbox.checked=true;checkbox.dispatchEvent(new env.w.Event('change',{bubbles:true}));const number=env.d.getElementById('count-'+id);number.value=String(count);number.dispatchEvent(new env.w.Event('input',{bubbles:true}))}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

 test('opening moves through idle, sailing, skip, and never replays on side changes',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert.equal(w.WeddingApp.getState().intro,'idle');
  d.querySelector('#water-tap').click();assert.equal(w.WeddingApp.getState().intro,'sailing');assert(d.querySelector('.water-ripple'));
  d.querySelector('#skip-intro').click();assert.equal(w.WeddingApp.getState().intro,'revealed');assert(d.querySelector('#water-tap').hidden);assert(d.querySelector('#skip-intro').hidden);assert.equal(d.querySelector('.intro-welcome').getAttribute('aria-hidden'),'false');
  w.WeddingApp.setSide('bride');assert.equal(w.WeddingApp.getState().intro,'revealed');
  w.WeddingApp.startIntro();assert.equal(w.WeddingApp.getState().intro,'revealed');assert.equal(env.opened.length,0);assert.equal(env.errors.length,0);
 });
 test('reduced motion immediately gives the complete usable invitation',t=>{const env=setup({reduced:true});t.after(env.close);assert.equal(env.w.WeddingApp.getState().intro,'revealed');assert(env.d.querySelector('.water-opening').classList.contains('instant'));assert(!env.d.querySelector('#rsvp'));assert.equal(env.errors.length,0)});
 test('scratch removes real cover pixels and completes at the configured threshold',t=>{
  const env=setup();t.after(env.close);const canvas=env.d.querySelector('.scratch-card canvas'),native=env.getBacking(canvas),ctx=native.getContext('2d');
  assert.equal(ctx.getImageData(75,79,1,1).data[3],255);
  pointer(env,canvas,'pointerdown',10,10);pointer(env,canvas,'pointermove',24,10);pointer(env,canvas,'pointerup',24,10);
  assert.equal(ctx.getImageData(15,10,1,1).data[3],0);assert.equal(env.w.WeddingApp.getState().scratched[0],false);
  pointer(env,canvas,'pointerdown',0,0);
  for(let y=0;y<=158;y+=14)for(let x=0;x<=150;x+=15)pointer(env,canvas,'pointermove',x,y);
  pointer(env,canvas,'pointerup',150,158);
  assert.equal(env.w.WeddingApp.getState().scratched[0],true);assert(env.d.querySelector('#date-details').hidden);
  env.d.querySelector('#reveal-date').click();assert.deepEqual([...env.w.WeddingApp.getState().scratched],[true,true,true]);assert(!env.d.querySelector('#date-details').hidden);assert.match(env.d.querySelector('#scratch-status').textContent,/3 में से 3/);
 });
 test('partial scratching and completed cards survive resize',async t=>{
  const env=setup();t.after(env.close);const canvas=env.d.querySelector('.scratch-card canvas');
  pointer(env,canvas,'pointerdown',30,30);pointer(env,canvas,'pointerup',30,30);
  assert.equal(env.getBacking(canvas).getContext('2d').getImageData(30,30,1,1).data[3],0);
  env.w.dispatchEvent(new env.w.Event('resize'));await new Promise(resolve=>setTimeout(resolve,180));
  assert.equal(env.getBacking(canvas).getContext('2d').getImageData(30,30,1,1).data[3],0);
  env.w.WeddingApp.revealAllDates();env.w.dispatchEvent(new env.w.Event('resize'));await new Promise(resolve=>setTimeout(resolve,180));
  assert.deepEqual([...env.w.WeddingApp.getState().scratched],[true,true,true]);assert(!env.d.querySelector('#date-details').hidden);
 });
 test('no canvas support uses the visible accessible date fallback',t=>{const env=setup({canvas:false});t.after(env.close);assert(!env.d.querySelector('#date-details').hidden);assert.deepEqual([...env.w.WeddingApp.getState().scratched],[true,true,true]);assert.equal(env.errors.length,0)});
 test('family direct links, switching, history, focus, and shared wedding remain consistent',t=>{
  for(const side of ['groom','bride','invalid']){
    const env=setup({url:'http://localhost:5173/?utm_source=family&side='+side});t.after(env.close);
    const expected=side==='bride'?'bride':'groom';assert.equal(env.w.WeddingApp.getState().side,expected);assert.equal(env.d.querySelectorAll('#celebration-timeline .timeline-event').length,6);assert.equal(env.d.querySelectorAll('#event-wedding').length,1);assert.match(env.d.querySelector('#event-wedding').textContent,/शिवप्रिया फार्म्स/);
    const button=env.d.querySelector('[data-side="bride"]');button.focus();button.click();assert.equal(env.d.activeElement,button);assert.equal(new URL(env.w.location.href).searchParams.get('utm_source'),'family');assert.equal(env.w.WeddingApp.getState().side,'bride');
    env.dom.reconfigure({url:'http://localhost:5173/?side=groom'});env.w.dispatchEvent(new env.w.PopStateEvent('popstate'));assert.equal(env.w.WeddingApp.getState().side,'groom');assert.equal(env.errors.length,0);
  }
 });
 test('confirmed bride functions replace earlier unassigned placeholders without assuming groom details',t=>{const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;assert(d.querySelector('.pending-events').hidden);assert.match(d.querySelector('#event-bride-mehendi').textContent,/9 फ़र/);assert.match(d.querySelector('#event-bride-mehendi').textContent,/साथी वेडिंग पॉइंट/);assert.match(d.querySelector('#event-bride-haldi').textContent,/प्रातः 11:00 बजे/);assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,5);assert.equal(d.querySelectorAll('#celebration-timeline .timeline-event a').length,6);assert.match(w.WeddingApp.calendarText(w.WEDDING.events.find(e=>e.id==='groom-haldi')),/DTSTART:20270210T053000Z/);assert.match(d.querySelector('#formal-groom-parents').textContent,/मंजुश्री भंडारी/)});
 test('calendar is date-only when wedding time is unconfirmed and exports the actual venue',t=>{const env=setup({weddingTime:null});t.after(env.close);const event=env.w.WEDDING.events.find(e=>e.id==='wedding'),ics=env.w.WeddingApp.calendarText(event);assert.match(ics,/DTSTART;VALUE=DATE:20270210\r\nDTEND;VALUE=DATE:20270211/);assert.match(ics,/LOCATION:शिवप्रिया फार्म्स\\, देहरादून/);assert.match(ics,/आयोजन का सही समय अभी तय नहीं है/);env.d.querySelector('[data-calendar="wedding"]').click();assert.equal(env.downloads.length,1);assert.match(env.d.querySelector('[data-map="wedding"]').href,/Shivpriya%20Farms/)});
 test('countdown uses IST wedding date, has a date-only label and a post-date message',t=>{const env=setup({weddingTime:null});t.after(env.close);env.w.WeddingApp.updateCountdown(new Date('2027-02-09T18:29:00Z'));assert.equal(env.d.querySelector('#minutes').textContent,'01');assert.match(env.d.querySelector('#countdown-note').textContent,/विवाह तिथि के आरंभ तक/);env.w.WeddingApp.updateCountdown(new Date('2027-02-10T00:00:00Z'));assert.equal(env.d.querySelector('#days').textContent,'00');assert.match(env.d.querySelector('#countdown-note').textContent,/शुभारंभ हो चुका है/)});
 test('gallery touch-friendly scrolling, lightbox navigation, close and restored focus',t=>{const env=setup();t.after(env.close);const{d,w}=env;assert.equal(d.querySelectorAll('.photo-memory').length,10);d.querySelector('#gallery-next').click();assert(d.querySelector('#photo-track').scrollLeft>0);const opener=d.querySelector('[data-photo="0"]');opener.focus();opener.click();assert(d.querySelector('#photo-dialog').open);const initial=d.querySelector('#lightbox-image').src;d.querySelector('#photo-next').click();assert.notEqual(d.querySelector('#lightbox-image').src,initial);d.querySelector('#photo-dialog').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(d.querySelector('#lightbox-image').src,initial);d.querySelector('#photo-prev').click();assert.match(d.querySelector('#photo-counter').textContent,/10 \/ 10/);d.querySelector('#photo-close').click();assert(!d.querySelector('#photo-dialog').open);assert.equal(d.activeElement,opener);assert(!d.documentElement.classList.contains('album-open'))});
 test('music is hidden when unconfigured, handles blocked autoplay, and responds to explicit controls',async t=>{const silent=setup();t.after(silent.close);assert(silent.d.querySelector('#music-toggle').hidden);assert.equal(silent.audioPlays(),0);const env=setup({music:true});t.after(env.close);await tick();assert(!env.d.querySelector('#music-toggle').hidden);assert.equal(env.audioPlays(),0);env.d.querySelector('#music-toggle').click();await tick();assert.equal(env.audioPlays(),1);assert.equal(env.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'true');env.d.querySelector('#music-toggle').click();await tick();assert.equal(env.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'false')});
 test('mobile menu, assets, anchor targets, unique IDs, no network submissions and CSS syntax',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  d.querySelector('.menu-toggle').click();assert(!d.querySelector('#mobile-nav').hidden);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert(d.querySelector('#mobile-nav').hidden);
  for(const image of d.querySelectorAll('img[src]'))assert(fs.existsSync(path.join(root,decodeURIComponent(image.getAttribute('src')))),image.src);
  for(const anchor of d.querySelectorAll('a[href^="#"]'))assert(d.querySelector(anchor.getAttribute('href')),anchor.href);
  const ids=[...d.querySelectorAll('[id]')].map(element=>element.id);assert.equal(new Set(ids).size,ids.length);
  assert(!d.querySelector('#rsvp-form'));assert(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage/.test(fs.readFileSync(path.join(root,'script.js'),'utf8')));
  const source=['style.css','celebrations.css','typography.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n'),errors=[];cssTree.parse(source,{onParseError:error=>errors.push(error.message)});assert.deepEqual(errors,[]);assert.match(source,/\.scratch-card canvas\{[^}]*touch-action:none/);assert(!/body[^}]*touch-action:none/.test(source));assert.match(source,/@media\(prefers-reduced-motion:reduce\)/);assert.match(source,/@media\(max-width:360px\)/);assert.equal(env.errors.length,0);
 });

 test('high-density canvases keep pointer coordinates aligned with the CSS card',t=>{
  const env=setup({dpr:3});t.after(env.close);const canvas=env.d.querySelector('.scratch-card canvas');
  assert.equal(canvas.width,300);assert.equal(canvas.height,316);
  pointer(env,canvas,'pointerdown',40,50);pointer(env,canvas,'pointerup',40,50);
  assert.equal(env.getBacking(canvas).getContext('2d').getImageData(80,100,1,1).data[3],0);
  assert.equal(env.w.WeddingApp.getState().scratched[0],false);
 });
 test('lightbox horizontal swipe navigates while vertical movement does not',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;d.querySelector('[data-photo="0"]').click();const image=d.querySelector('#lightbox-image'),first=image.src;
  function touch(type,x,y){const event=new w.Event(type);event.changedTouches=[{clientX:x,clientY:y}];image.dispatchEvent(event)}
  touch('touchstart',200,100);touch('touchend',100,110);assert.notEqual(image.src,first);
  touch('touchstart',100,100);touch('touchend',200,110);assert.equal(image.src,first);
  touch('touchstart',200,100);touch('touchend',195,220);assert.equal(image.src,first);
 });
 test('a browser rejecting audio play leaves the control usable and explains the failure',async t=>{
  const env=setup({music:true});t.after(env.close);env.d.querySelector('audio').play=async()=>{throw new Error('Playback blocked')};env.d.querySelector('#music-toggle').click();await tick();assert.match(env.d.querySelector('#music-status').textContent,/संगीत नहीं चल सका/);assert.equal(env.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'false');assert(!env.d.querySelector('#music-toggle').disabled);
 });

 test('day-grouped celebrations retain complete illustrated events and one shared wedding',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  for(const side of ['groom','bride']){
    w.WeddingApp.setSide(side);const rows=[...d.querySelectorAll('.timeline-event')];
    assert.equal(rows.length,6);assert(d.querySelectorAll('.celebration-day').length>=3);
    assert.equal(d.querySelectorAll('.timeline-track').length,0);assert.equal(d.querySelectorAll('.day-heading .day-ornament svg').length,d.querySelectorAll('.celebration-day').length);assert.equal(d.querySelectorAll('.timeline-scene img').length,rows.length);assert.equal(d.querySelectorAll('#event-wedding').length,1);
    assert(rows.every(row=>row.querySelector('.timeline-date')&&row.querySelector('.timeline-time')&&row.querySelector('.timeline-venue')));
    for(const row of rows){const event=w.WEDDING.events.find(e=>'event-'+e.id===row.id);assert.equal(Boolean(row.querySelector('[data-calendar]')),Boolean(event.date&&event.time));}
  }
 });
 test('confirmed dates and times determine timeline order, large clock text, and calendar eligibility',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  w.WEDDING.events=w.WEDDING.events.filter(e=>['groom-cocktail','groom-haldi','wedding'].includes(e.id));const events=w.WEDDING.events;Object.assign(events.find(e=>e.id==='groom-cocktail'),{date:'2027-02-10',time:'09:00'});Object.assign(events.find(e=>e.id==='groom-haldi'),{date:'2027-02-09',time:'10:00'});Object.assign(events.find(e=>e.id==='wedding'),{time:'20:30'});
  w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-haldi','event-groom-cocktail','event-wedding']);
  assert.match(d.querySelector('#event-groom-cocktail .timeline-time').textContent,/प्रातः 9:00 बजे/);assert(!d.querySelector('#event-groom-cocktail .timeline-time').classList.contains('is-pending'));assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,3);
  // Same-date functions must also be in actual clock order, not source-array order.
  events.find(e=>e.id==='groom-haldi').date='2027-02-10';w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-cocktail','event-groom-haldi','event-wedding']);
 });
 test('day connectors follow reading position and reduced motion exposes all information without animation',t=>{
  const env=setup();t.after(env.close);const days=[...env.d.querySelectorAll('.day-events')];days[0].getBoundingClientRect=()=>({top:300,height:1000});env.w.WeddingApp.updateTimelineProgress();const p=Number(days[0].style.getPropertyValue('--day-progress'));assert(p>0&&p<1);days[0].getBoundingClientRect=()=>({top:1000,height:1000});env.w.WeddingApp.updateTimelineProgress();assert.equal(days[0].style.getPropertyValue('--day-progress'),'0');
  const reduced=setup({reduced:true,observeTimeline:true});t.after(reduced.close);assert([...reduced.d.querySelectorAll('.day-events')].every(day=>day.style.getPropertyValue('--day-progress')==='1'));assert([...reduced.d.querySelectorAll('.timeline-event')].every(row=>!row.hidden));assert(!reduced.observers.some(o=>o.elements.some(e=>e.classList.contains('timeline-event'))));
 });
 test('viewport entrances animate the scene first and details shortly afterwards',t=>{
  const env=setup({observeTimeline:true});t.after(env.close);const observer=env.observers.find(o=>o.elements.some(e=>e.classList.contains('timeline-event')));assert(observer);const row=observer.elements[0];observer.callback([{isIntersecting:true,target:row}]);const scene=env.animations.find(a=>a.element===row.querySelector('.timeline-scene')),details=env.animations.find(a=>a.element===row.querySelector('.timeline-details'));assert(scene);assert(details);assert.equal(scene.options.duration,950);assert.equal(details.options.delay,150);assert.equal(details.options.duration,850);
  env.w.WeddingApp.setSide('bride');assert(observer.disconnected);
 });
 test('missing artwork is explicitly labelled rather than substituted with a generic symbol',t=>{const env=setup();t.after(env.close);delete env.w.WEDDING.eventArtwork.mehendi;env.w.WeddingApp.setSide('groom');assert.match(env.d.querySelector('#event-groom-cocktail .timeline-scene').textContent,/चित्र शीघ्र जोड़ा जाएगा/);assert(!env.d.querySelector('#event-groom-cocktail .event-illustration'))});

 test('Hindi invitation text stays Hindi except for the requested English monograms',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert.equal(d.documentElement.lang,'hi');assert.match(d.title,/हिमांशी संग शुभम/);
  function checkCopy(){
    const walker=d.createTreeWalker(d.body,w.NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement?.closest('script,style,noscript'))continue;
      if(/[A-Za-z]/.test(node.textContent)){
        assert(node.parentElement.closest('.opening-mark,.brand,.crest,.lightbox-toolbar > span,footer > span'),`Untranslated visible text: ${node.textContent.trim()}`);
        assert(/^[HS&\s·0-9]*$/.test(node.textContent),`Unexpected English copy in monogram: ${node.textContent.trim()}`);
      }
    }
    for(const element of d.querySelectorAll('[aria-label],[alt],[placeholder]')){
      for(const attribute of ['aria-label','alt','placeholder'])if(element.hasAttribute(attribute))assert(!/[A-Za-z]/.test(element.getAttribute(attribute)),`Untranslated ${attribute}: ${element.getAttribute(attribute)}`);
    }
  }
  checkCopy();w.WeddingApp.setSide('bride');checkCopy();w.WeddingApp.finishIntro({instant:true});w.WeddingApp.revealAllDates();d.querySelector('[data-photo="0"]').click();checkCopy();d.querySelector('#photo-close').click();
  assert(d.querySelector('link[href*="typography.css"]'));
 });
 test('dates, countdown and photo counters use English numerals',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;assert.equal(d.querySelector('#date-day').textContent,'10');assert.equal(d.querySelector('#date-year').textContent,'2027');assert.match(d.querySelector('#date-month').textContent,/फ़रवरी/);
  for(const id of ['days','hours','minutes','seconds'])assert(/^[0-9]+$/.test(d.getElementById(id).textContent));

  d.querySelector('[data-photo="0"]').click();assert.equal(d.querySelector('#photo-counter').textContent,'01 / 10');
  assert(!/[०-९]/.test(d.querySelector('#event-wedding .timeline-date').textContent));assert.match(d.querySelector('#event-wedding .timeline-date').textContent,/10.*2027/);
 });
 test('translation preserves the latest confirmed event facts and machine-readable calendar dates',t=>{
  const env=setup();t.after(env.close);const{w}=env,events=w.WEDDING.events;
  const wedding=events.find(e=>e.id==='wedding');assert.equal(wedding.date,'2027-02-10');assert.equal(wedding.time,'20:00');assert.equal(wedding.venue.mapsQuery,'Shivpriya Farms, Dehradun');assert.equal(wedding.venue.name,'शिवप्रिया फार्म्स');
  assert.equal(events.find(e=>e.id==='bride-keertan').date,'2027-02-08');assert.equal(events.find(e=>e.id==='bride-mehendi').venue.mapsUrl,'https://share.google/F47hnI9tc7TaGotYH');assert.equal(events.find(e=>e.id==='bride-haldi').time,'11:00');
  for(const event of events.filter(e=>e.side==='groom')){assert(event.date);assert.equal(event.venue,w.WEDDING.groomHomeVenue)}
  const ics=w.WeddingApp.calendarText(wedding);assert.match(ics,/SUMMARY:हिमांशी संग शुभम — शुभ विवाह/);assert.match(ics,/DTSTART:20270210T143000Z/);assert.match(ics,/LOCATION:शिवप्रिया फार्म्स\\, देहरादून/);
 });

 test('Himanshi’s confirmed schedule follows the supplied sequence, with one combined mehendi-cocktail',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;
  const expected=['bride-satsang','bride-keertan','bride-mehendi','bride-haldi','wedding','bride-vidaai'];
  assert.deepEqual([...w.WeddingApp.scheduleEvents('bride')].map(event=>event.id),expected);
  assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),expected.map(id=>'event-'+id));
  assert(!d.querySelector('#rsvp-events'));

  assert.match(d.querySelector('#event-bride-mehendi h3').textContent,/मेहंदी एवं कॉकटेल/);assert(d.querySelector('.pending-events').hidden);
  w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-cocktail','event-groom-keertan','event-groom-haldi','event-groom-baraat','event-wedding','event-groom-welcome']);
 });
 test('all confirmed bride times produce the correct IST-to-UTC calendar starts',t=>{
  const env=setup();t.after(env.close);const{w}=env;
  const expected={'bride-satsang':'20270208T053000Z','bride-keertan':'20270208T083000Z','bride-mehendi':'20270209T143000Z','bride-haldi':'20270210T053000Z','wedding':'20270210T143000Z'};
  for(const[id,utc]of Object.entries(expected)){const event=w.WEDDING.events.find(e=>e.id===id);assert(w.WeddingApp.calendarText(event).includes('DTSTART:'+utc),id);}
  assert.equal(w.WEDDING.events.find(e=>e.id==='bride-haldi').time,'11:00');
 });
 test('the full home address and both wedding-point map links are shown without stale locations',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d}=env;
  for(const id of ['bride-satsang','bride-keertan','bride-haldi']){
    assert.equal(d.querySelector('#event-'+id+' .timeline-venue').textContent,'हिमांशी का निवास, जोगीवाला');
    const query=new URL(d.querySelector('#event-'+id+' a').href).searchParams.get('query');assert.equal(query,'Lane No 11, Indraprastha Colony, near 6 Number Puliya, Jogiwala, Dehradun');
  }
  assert.equal(d.querySelector('#event-bride-mehendi a').href,'https://share.google/F47hnI9tc7TaGotYH');
  assert.equal(new URL(d.querySelector('#event-wedding a').href).searchParams.get('query'),'Shivpriya Farms, Dehradun');
  assert.match(d.querySelector('#additional-venues').textContent,/गली नंबर 11/);assert.match(d.querySelector('#additional-venues').textContent,/साथी वेडिंग पॉइंट/);
 });
 test('vidaai stays after the wedding with its poetic timing and no invented date or calendar file',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env,vidaai=w.WEDDING.events.find(event=>event.id==='bride-vidaai');
  assert.equal(vidaai.date,null);assert.equal(vidaai.time,null);assert.equal(vidaai.after,'wedding');
  assert.equal(d.querySelector('#event-bride-vidaai .timeline-date').textContent,'विवाह के बाद');assert.equal(d.querySelector('#event-bride-vidaai .timeline-time').textContent,'तारों की छाँव में');
  assert.equal(d.querySelector('#event-bride-vidaai .timeline-time').getAttribute('aria-label'),'तारों की छाँव में');assert(!d.querySelector('#event-bride-vidaai [data-calendar]'));assert.equal(w.WeddingApp.calendarText(vidaai),null);assert.equal(vidaai.venue,w.WEDDING.homeVenue);assert.equal(d.querySelector('#event-bride-vidaai .timeline-venue').textContent,'हिमांशी का निवास, जोगीवाला');assert.equal(new URL(d.querySelector('#event-bride-vidaai .timeline-actions a').href).searchParams.get('query'),w.WEDDING.homeVenue.mapsQuery);
 });
 test('the supplied Sajna MP3 is connected, loops and retains manual controls',async t=>{
  const env=setup({music:'actual'});t.after(env.close);await tick();const{d,w}=env,config=w.WEDDING.music;
  assert.equal(config.title,'सजना');assert.equal(config.source,'user-provided');assert.equal(config.licence,null,'Do not invent a licence statement');
  assert(fs.existsSync(path.join(root,decodeURIComponent(config.src))));assert(fs.statSync(path.join(root,decodeURIComponent(config.src))).size>1000000);
  const audio=d.querySelector('audio');assert.equal(audio.volume,.4);assert.equal(audio.preload,'none');assert(audio.loop);assert(!d.querySelector('#music-toggle').hidden);assert.equal(env.audioPlays(),0);
  assert.equal(decodeURIComponent(new URL(audio.src).pathname),'/assets/Sajna -Darshan Raval (Audio Song) #DD.mp3');
  d.querySelector('#music-toggle').click();await tick();assert.equal(env.audioPlays(),1);assert.equal(d.querySelector('#music-toggle').getAttribute('aria-pressed'),'true');d.querySelector('#music-toggle').click();await tick();assert.equal(d.querySelector('#music-toggle').getAttribute('aria-pressed'),'false');
 });
 test('the countdown and scratch-date details use the confirmed 8 PM wedding time',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert.equal(d.querySelector('.date-time').textContent,'रात्रि 8:00 बजे');
  w.WeddingApp.updateCountdown(new Date('2027-02-10T00:00:00Z'));assert.equal(d.querySelector('#hours').textContent,'14');assert.equal(d.querySelector('#minutes').textContent,'30');
  w.WeddingApp.updateCountdown(new Date('2027-02-10T14:29:00Z'));assert.equal(d.querySelector('#minutes').textContent,'01');assert.match(d.querySelector('#countdown-note').textContent,/रात्रि 8:00 बजे/);
  w.WeddingApp.updateCountdown(new Date('2027-02-10T14:30:00Z'));assert.match(d.querySelector('#countdown-note').textContent,/शुभारंभ हो चुका है/);
 });

 test('opening and formal invitation use the exact requested copy and Sang',t=>{
  const env=setup();t.after(env.close);const{d}=env;
  assert.equal(d.querySelector('.intro-initial > p:first-child').textContent,'शुभ विवाह');assert.equal(d.querySelector('.intro-welcome > p:first-child').textContent,'शुभ विवाह');
  assert.equal(d.querySelector('.initial-names > span').textContent,'संग');assert.equal(d.querySelector('.intro-welcome h1 em').textContent,'संग');assert.equal(d.querySelector('.formal-join').textContent,'संग');
  assert(!d.querySelector('.scratch-instruction'));assert(!d.querySelector('#the-date').textContent.includes('एक प्यारा-सा राज़'));
  assert.equal(d.querySelector('.formal-blessing').textContent,'पूज्य पितरों के आशीर्वाद से');assert.equal(d.querySelector('.formal-message').textContent,'के शुभ विवाह में आप सपरिवार सादर आमंत्रित हैं');
  assert(!d.querySelector('.formal-invite').textContent.includes('दो दिल, दो परिवार'));
 });
 test('the supplied logo appears consistently without replacing the Hindi names',t=>{
  const env=setup();t.after(env.close);const{d}=env;
  for(const logo of d.querySelectorAll('.opening-mark,.brand,.crest'))assert.equal(logo.querySelector('img').getAttribute('src'),logo.matches('.crest')?'assets/logo-emblem.webp':'assets/logo-monogram.webp');
  assert.match(d.querySelector('.intro-welcome h1').textContent,/हिमांशी/);assert.match(d.querySelector('.intro-welcome h1').textContent,/शुभम/);
  assert.match(fs.readFileSync(path.join(root,'typography.css'),'utf8'),/Cormorant Garamond/);
 });
 test('verified parents remain directly below the correct bride and groom',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const bride=d.querySelector('.formal-person[data-person=bride]'),groom=d.querySelector('.formal-person[data-person=groom]');
  assert.equal(bride.querySelector('.formal-name').textContent,'हिमांशी');assert.equal(bride.querySelector('.formal-relation').textContent,'सुपुत्री');assert.match(bride.querySelector('.formal-parents').textContent,/श्रीमती वीना राणा/);assert.match(bride.querySelector('.formal-parents').textContent,/श्री राजेंद्र सिंह राणा/);
  assert.equal(groom.querySelector('.formal-name').textContent,'शुभम');assert.equal(groom.querySelector('.formal-relation').textContent,'सुपुत्र');assert.match(groom.querySelector('.formal-parents').textContent,/श्रीमती मंजुश्री भंडारी/);assert.match(groom.querySelector('.formal-parents').textContent,/श्री रविंद्र सिंह भंडारी/);
  for(const family of Object.values(w.WEDDING.families))for(const parent of family.members)assert(d.querySelector('.formal-invite').textContent.includes(parent.name));
 });
 test('date and time copy uses 0–9 digits, omits timezone labels, and retains correct UTC calendar times',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;
  w.WeddingApp.revealAllDates();
  for(const element of d.querySelectorAll('.timeline-date,.timeline-time,.date-details,.formal-date,#date-day,#date-year,#countdown-note'))assert(!/[०-९]/.test(element.textContent),element.textContent);
  assert(!/भारतीय समय|\bIST\b/.test(d.body.textContent));assert.equal(d.querySelector('.date-time').textContent,'रात्रि 8:00 बजे');
  const wedding=w.WEDDING.events.find(e=>e.id==='wedding');assert(w.WeddingApp.calendarText(wedding).includes('DTSTART:20270210T143000Z'));
 });
 test('Satsang and Vidaai use their own new miniature image files',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env,art=w.WEDDING.eventArtwork;
  assert.equal(art.satsang.src,'assets/events/chapters/satsang.webp');assert.equal(art.vidaai.src,'assets/events/chapters/vidaai.webp');
  assert.notEqual(art.satsang.src,art.keertan.src);assert.notEqual(art.vidaai.src,art.wedding.src);
  assert.equal(d.querySelector('#event-bride-satsang .timeline-scene img').getAttribute('src'),art.satsang.src);assert.equal(d.querySelector('#event-bride-vidaai .timeline-scene img').getAttribute('src'),art.vidaai.src);
  assert(!fs.readFileSync(path.join(root,art.satsang.src)).equals(fs.readFileSync(path.join(root,art.keertan.src))));assert(!fs.readFileSync(path.join(root,art.vidaai.src)).equals(fs.readFileSync(path.join(root,art.wedding.src))));
 });

 test('invitation omits RSVP and travel advice and uses concise family event names',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d}=env;
  assert(!d.querySelector('form,#rsvp,[href="#rsvp"],.travel-grid'));
  assert(!d.body.textContent.includes('कैसे पहुँचें'));
  assert.deepEqual([...d.querySelectorAll('.timeline-event:not(#event-wedding) h3')].map(e=>e.textContent),['सत्संग','कीर्तन','मेहंदी एवं कॉकटेल','हल्दी','विदाई']);
  assert(!d.querySelector('#story-copy').textContent.includes('जीवन के नए अध्याय'));
  assert.equal(d.querySelector('#story-copy').textContent,'कुछ पुराने पल, कुछ नई यादें—और अब एक नया सफ़र।');
  assert.equal(env.errors.length,0);
 });

 test('music autoplays when permitted and first invitation tap retries blocked autoplay',async t=>{
  const allowed=setup({music:true,autoplayAllowed:true});t.after(allowed.close);await tick();assert.equal(allowed.audioPlays(),1);assert.equal(allowed.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'true');
  const blocked=setup({music:true});t.after(blocked.close);await tick();assert.equal(blocked.audioPlays(),0);blocked.d.querySelector('#water-tap').click();await tick();assert.equal(blocked.audioPlays(),1);
  blocked.d.querySelector('#music-toggle').click();await tick();assert(blocked.d.querySelector('audio').paused);blocked.d.querySelector('[data-side="bride"]').click();await tick();assert(blocked.d.querySelector('audio').paused);assert.equal(blocked.audioPlays(),1);
 });

 test('confirmed groom schedule includes all six functions with exact times, one wedding and the supplied home map',t=>{
  const env=setup({url:'http://localhost:5173/?side=groom'});t.after(env.close);const{d,w}=env;
  const expected=[['groom-cocktail','2027-02-08','20:00','20270208T143000Z'],['groom-keertan','2027-02-09','14:00','20270209T083000Z'],['groom-haldi','2027-02-10','11:00','20270210T053000Z'],['groom-baraat','2027-02-10','19:00','20270210T133000Z'],['wedding','2027-02-10','20:00','20270210T143000Z'],['groom-welcome','2027-02-11','07:00','20270211T013000Z']];
  assert.deepEqual([...w.WeddingApp.scheduleEvents('groom')].map(e=>e.id),expected.map(e=>e[0]));
  for(const[id,date,time,utc]of expected){
    const e=w.WEDDING.events.find(e=>e.id===id),row=d.querySelector('#event-'+id);
    assert.equal(e.date,date);assert.equal(e.time,time);assert(w.WeddingApp.calendarText(e).includes('DTSTART:'+utc));assert(row.querySelector('[data-calendar]'));assert(row.querySelector('img'));assert(!/[०-९]/.test(row.querySelector('.timeline-date').textContent));
    if(id!=='wedding'){assert.equal(e.venue,w.WEDDING.groomHomeVenue);assert.equal(row.querySelector('.timeline-actions a').href,'https://maps.app.goo.gl/T5PzBUmyjkBatVS26');assert.match(row.textContent,/भंडारी निवास/);}
  }
  assert.match(d.querySelector('#event-groom-baraat .timeline-time').textContent,/सायं 7:00 बजे/);assert.match(d.querySelector('#event-groom-welcome .timeline-time').textContent,/प्रातः 7:00 बजे/);
  assert.equal(d.querySelectorAll('#event-wedding').length,1);assert.equal(d.querySelectorAll('.timeline-event').length,6);
  w.WeddingApp.setSide('bride');assert(!d.querySelector('#event-groom-welcome'));assert.equal(d.querySelectorAll('#event-wedding').length,1);assert.equal(env.errors.length,0);
 });
 test('new groom artwork assets are distinct and present',t=>{
  const env=setup();t.after(env.close);const art=env.w.WEDDING.eventArtwork;
  for(const type of ['baraat','welcome']){assert(fs.existsSync(path.join(root,art[type].src)));assert.notEqual(art[type].src,art.wedding.src);assert.notEqual(art[type].src,art.vidaai.src);}
  assert.notEqual(art.baraat.src,art.welcome.src);
 });

 test('venue card uses the supplied entrance illustration and confirmed wedding details without the removed heading or placeholder',t=>{
  const env=setup();t.after(env.close);const{d,w}=env,card=d.querySelector('.wedding-venue-card');
  assert(!d.querySelector('#location-heading'));assert(!d.querySelector('#location .small-note'));assert(!d.querySelector('#location').textContent.includes('मिलते हैं देहरादून में'));assert(!d.body.textContent.includes('विस्तृत पता और आगमन की जानकारी शीघ्र साझा की जाएगी'));
  assert.equal(card.querySelector('h3').textContent,w.WEDDING.events.find(e=>e.id==='wedding').venue.name);assert.match(card.querySelector('#wedding-venue-schedule').textContent,/10.*2027/);assert.match(card.querySelector('#wedding-venue-schedule').textContent,/रात्रि 8:00 बजे/);
  assert.equal(card.querySelector('img').getAttribute('src'),'assets/venues/shivpriya-watercolor.webp');assert(!card.querySelector('.venue-house'));assert.match(card.querySelector('[data-map]').href,/Shivpriya%20Farms/);assert.equal(env.errors.length,0);
 });

 test('logo assets contain real transparency and every visible logo uses the new files',async t=>{
  const {loadImage}=require('@napi-rs/canvas');const env=setup();t.after(env.close);
  for(const file of ['logo-emblem.webp','logo-monogram.webp']){
    const image=await loadImage(path.join(root,'assets',file));const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,image.width,image.height).data;let transparent=0,visible=0;
    for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]>200)visible++;}
    assert(transparent>image.width*image.height*.2,`${file} must have transparent blank space`);assert(visible>image.width*image.height*.03,`${file} must retain visible artwork`);
    for(const[x,y]of [[0,0],[image.width-1,0],[0,image.height-1],[image.width-1,image.height-1]])assert.equal(ctx.getImageData(x,y,1,1).data[3],0);
  }
  const logos=env.d.querySelectorAll('.couple-logo,.compact-logo');assert.equal(logos.length,6);
  assert([...logos].every(img=>/assets\/logo-(emblem|monogram)\.webp$/.test(img.getAttribute('src'))));
  assert(!env.d.querySelector('img[src="assets/logo.png"]'));
 });

 test('polished family timelines render each title and Vidaai timing once without redundant subtitles',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  for(const side of ['groom','bride']){
    w.WeddingApp.setSide(side);assert(!d.querySelector('.timeline-hindi,.timeline-family-note'));
    for(const row of d.querySelectorAll('.timeline-event')){
      assert.equal(row.querySelectorAll('h3').length,1);
      const event=w.WEDDING.events.find(e=>'event-'+e.id===row.id);
      if(['haldi','keertan','satsang','wedding'].includes(event.type))assert(!row.querySelector('.timeline-description'));
    }
  }
  assert.equal((d.querySelector('#event-bride-vidaai').textContent.match(/तारों की छाँव में/g)||[]).length,1);
  assert(d.querySelector('#event-bride-mehendi .timeline-description'));
  const e=w.WEDDING.events.find(e=>e.id==='bride-mehendi');e.timelineDescription=e.title+'।';w.WeddingApp.setSide('bride');assert(!d.querySelector('#event-bride-mehendi .timeline-description'));
 });
 test('scratch completion updates instructions, hides redundant control and moves keyboard focus to calendar',t=>{
  const env=setup();t.after(env.close);const{d,w}=env,button=d.querySelector('#reveal-date');
  assert.equal(d.querySelector('#scratch-hint').textContent,'उँगली फेरकर विवाह तिथि देखें');assert.equal(button.textContent.trim(),'विवाह तिथि देखें');assert.equal(d.querySelector('#skip-intro').textContent.trim(),'सीधे निमंत्रण देखें');
  button.focus();button.click();assert(button.hidden);assert(button.disabled);assert(d.querySelector('#scratch-hint').hidden);assert(!d.querySelector('#date-details').hidden);assert.equal(d.querySelector('.date-remember').textContent,'तिथि याद रखिए');assert.equal(d.activeElement,d.querySelector('#date-details [data-calendar]'));
  assert.match(d.querySelector('#scratch-status').textContent,/3 में से 3/);assert(d.querySelector('#scratch-status').classList.contains('sr-only'));assert.equal(w.WeddingApp.getState().scratched.filter(Boolean).length,3);
 });
 test('Sathi share link and full home addresses are retained in venue summaries and calendar exports',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;
  const brideCard=d.querySelector('.additional-venue[data-owner="bride"]'),mehendi=w.WEDDING.events.find(e=>e.id==='bride-mehendi');
  assert.match(brideCard.textContent,/हिमांशी का निवास/);assert.match(brideCard.textContent,/गली नंबर 11, इंद्रप्रस्थ कॉलोनी, 6 नंबर पुलिया के पास/);
  const sathi=[...d.querySelectorAll('.additional-venue')].find(e=>e.textContent.includes('साथी वेडिंग पॉइंट'));assert.match(sathi.textContent,/हिमांशी की मेहंदी एवं कॉकटेल/);assert.equal(sathi.querySelector('a').href,mehendi.venue.mapsUrl);assert(!d.body.textContent.includes('स्काई गार्डन'));
  assert.equal(d.querySelector('#event-bride-haldi .timeline-venue').textContent,'हिमांशी का निवास, जोगीवाला');assert(w.WeddingApp.calendarText(w.WEDDING.events.find(e=>e.id==='bride-haldi')).includes('इंद्रप्रस्थ कॉलोनी'));assert(w.WeddingApp.calendarText(mehendi).includes('साथी वेडिंग पॉइंट'));
  for(const side of ['groom','bride']){w.WeddingApp.setSide(side);assert(!/[०-९]/.test(d.body.textContent));}
  assert.match(d.querySelector('#event-bride-keertan .timeline-time').textContent,/दोपहर 2:00 बजे/);
 });
 test('main section order is practical and repeated family and crest sections are removed',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert.deepEqual([...d.querySelectorAll('main > section')].map(e=>e.id||e.classList[0]),['the-date','formal-section','celebrations','our-story','countdown-section','location','contacts','closing-section']);
  assert(!d.querySelector('.family-section'));assert.equal(d.querySelectorAll('img[src="assets/logo-emblem.webp"]').length,1);assert(d.querySelector('.closing-monogram img[src="assets/logo-monogram.webp"]'));
  for(const f of Object.values(w.WEDDING.families))for(const parent of f.members)assert.equal(d.querySelector('main').textContent.split(parent.name).length-1,1);
  assert.equal(d.querySelector('#story-copy').textContent,'कुछ पुराने पल, कुछ नई यादें—और अब एक नया सफ़र।');
 });
 test('functional controls use accessible currentColor SVGs across all family views and playback states',async t=>{
  const env=setup({music:true});t.after(env.close);await tick();const{d,w}=env;
  for(const side of ['groom','bride']){
    w.WeddingApp.setSide(side);
    for(const selector of ['#skip-intro','#reveal-date','#gallery-prev','#gallery-next','#photo-prev','#photo-next','#photo-close','#music-toggle','.closing-section a','#location [data-map]','.menu-toggle'])assert(d.querySelector(selector+' svg.ui-icon'),selector);
    for(const control of d.querySelectorAll('.timeline-actions>a,.timeline-actions>button,.photo-open'))assert(control.querySelector('svg.ui-icon'));
    for(const svg of d.querySelectorAll('svg.ui-icon')){assert.equal(svg.getAttribute('stroke'),'currentColor');assert.equal(svg.getAttribute('aria-hidden'),'true');assert.equal(svg.getAttribute('focusable'),'false');assert.equal(svg.namespaceURI,'http://www.w3.org/2000/svg');}
    for(const e of d.querySelectorAll('button,.timeline-actions a,.text-button,.scroll-cue'))assert(!/[↗↘↑←→♫Ⅱ☰×⌄]/.test(e.textContent),e.textContent);
  }
  d.querySelector('#music-toggle').click();await tick();assert(d.querySelector('#music-toggle svg[data-icon="pause"]'));d.querySelector('#music-toggle').click();await tick();assert(d.querySelector('#music-toggle svg[data-icon="play"]'));
  d.querySelector('.menu-toggle').click();assert(d.querySelector('.menu-toggle svg[data-icon="close"]'));d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(d.querySelector('.menu-toggle svg[data-icon="menu"]'));assert.equal(env.errors.length,0);
 });
 test('confirmed family numbers have distinct accessible call and WhatsApp actions without individual identities or submissions',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert(!d.querySelector('#contacts').hidden);assert([...d.querySelectorAll('[data-contact-nav]')].every(e=>!e.hidden));assert.equal(d.querySelectorAll('.contact-card').length,2);
  const expected={groom:['+919634387491','+919760182277'],bride:['+917351415376','+917895663687']};
  for(const[side,numbers]of Object.entries(expected)){
    const card=d.querySelector(`.contact-card[data-family="${side}"]`);assert.equal(card.querySelector('h3').textContent,w.WEDDING.families[side].name+' का परिवार');assert.equal(card.querySelectorAll('.contact-entry').length,2);assert.deepEqual([...w.WEDDING.families[side].contacts],numbers);
    for(const[number,index]of numbers.map((value,index)=>[value,index])){const entry=card.querySelectorAll('.contact-entry')[index],links=entry.querySelectorAll('a'),local=number.slice(3);assert.equal(links[0].href,'tel:'+number);assert.equal(links[1].href,'https://wa.me/'+number.slice(1));assert.equal(links[0].textContent.trim(),'कॉल करें');assert.equal(links[1].textContent.trim(),'व्हाट्सऐप');assert.equal(entry.querySelector('bdi').textContent,local.slice(0,5)+' '+local.slice(5));for(const link of links){assert(link.getAttribute('aria-label').includes(w.WEDDING.families[side].name));assert(link.querySelector('svg.ui-icon'));}assert(!new URL(links[1].href).searchParams.has('text'));}
  }
  assert.equal(env.opened.length,0);assert(!d.querySelector('form'));assert.equal(env.errors.length,0);
  w.WEDDING.families.groom.contacts=[];w.WEDDING.families.bride.contacts=['invalid',''];w.WeddingApp.renderContacts();assert(d.querySelector('#contacts').hidden);assert.equal(d.querySelectorAll('.contact-card').length,0);
 });

 test('each family is grouped by real dates, with separate undated farewell and a paired devotional morning',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const expectations={groom:['2027-02-08','2027-02-09','2027-02-10','2027-02-11'],bride:['2027-02-08','2027-02-09','2027-02-10','after-wedding']};
  for(const side of ['groom','bride']){
    w.WeddingApp.setSide(side);assert.deepEqual([...d.querySelectorAll('.celebration-day')].map(day=>day.dataset.date),expectations[side]);
    for(const day of d.querySelectorAll('.celebration-day')){assert.equal(day.querySelectorAll('.day-heading').length,1);assert(day.querySelector('.day-events[role=list]'));assert(day.querySelector('.day-heading h3').textContent.includes(day.dataset.date==='after-wedding'?'विवाह के बाद':'फ़रवरी'));}
    assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(e=>e.id),'groom'===side?['groom-cocktail','groom-keertan','groom-haldi','groom-baraat','wedding','groom-welcome'].map(id=>'event-'+id):['bride-satsang','bride-keertan','bride-mehendi','bride-haldi','wedding','bride-vidaai'].map(id=>'event-'+id));
    for(const date of d.querySelectorAll('.timeline-event:not(#event-wedding) .timeline-date'))if(date.querySelector('time'))assert(date.classList.contains('sr-only'));
  }
  const pair=d.querySelector('.devotional-pair');assert.deepEqual([...pair.querySelectorAll('.timeline-event')].map(row=>row.id),['event-bride-satsang','event-bride-keertan']);assert.match(pair.textContent,/प्रातः 11:00 बजे/);assert.match(pair.textContent,/दोपहर 2:00 बजे/);
  const vidai=w.WEDDING.events.find(e=>e.id==='bride-vidaai');assert.equal(vidai.date,null);assert.equal(vidai.time,null);assert.equal(vidai.venue,w.WEDDING.homeVenue);
 });
 test('rituals use different composition families and both schedules share the same wedding centrepiece',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const treatments={'groom-cocktail':'evening','groom-keertan':'devotional','groom-haldi':'sunny','groom-baraat':'procession',wedding:'wedding','groom-welcome':'dawn'};
  for(const[id,treatment]of Object.entries(treatments))assert.equal(d.querySelector('#event-'+id).dataset.treatment,treatment);
  const wedding=d.querySelector('#event-wedding').outerHTML;w.WeddingApp.setSide('bride');assert.equal(d.querySelector('#event-wedding').outerHTML,wedding);assert.equal(d.querySelector('#event-bride-vidaai').dataset.treatment,'moonlight');assert.equal(d.querySelectorAll('#event-wedding').length,1);
  assert(d.querySelector('#event-wedding .timeline-date time[datetime="2027-02-10"]'));assert.match(d.querySelector('#event-wedding').textContent,/हिमांशी संग शुभम/);
 });
 test('baraat enters horizontally, wedding reveals gradually, and changing families does not replay opening',t=>{
  const env=setup({observeTimeline:true});t.after(env.close);const{d,w}=env;w.WeddingApp.finishIntro({instant:true});
  const observer=env.observers.find(o=>o.elements.some(e=>e.classList.contains('timeline-event')));const baraat=d.querySelector('#event-groom-baraat'),wedding=d.querySelector('#event-wedding');observer.callback([{isIntersecting:true,target:baraat},{isIntersecting:true,target:wedding}]);
  assert.equal(env.animations.find(a=>a.element===baraat.querySelector('.timeline-scene')).frames[0].transform,'translateX(-20px)');assert.equal(env.animations.find(a=>a.element===wedding.querySelector('.timeline-scene')).options.duration,1400);assert(wedding.classList.contains('scene-entered'));
  w.WeddingApp.setSide('bride');assert(observer.disconnected);assert.equal(w.WeddingApp.getState().intro,'revealed');assert.equal(env.errors.length,0);
 });

 test('chapter artwork preserves wide and portrait silhouettes with transparency and correct intrinsic sizes',async t=>{
  const {loadImage}=require('@napi-rs/canvas');const env=setup();t.after(env.close);const art=env.w.WEDDING.eventArtwork;
  const files=new Set();
  for(const type of ['cocktail','satsang','keertan','haldi','baraat','wedding','welcome','vidaai']){
    const asset=art[type];assert(asset.src.startsWith('assets/events/chapters/'));assert(!files.has(asset.src));files.add(asset.src);
    const image=await loadImage(path.join(root,asset.src));assert.equal(image.width,asset.width);assert.equal(image.height,asset.height);
    const canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,image.width,image.height).data;let clear=0;for(let i=3;i<data.length;i+=4)if(data[i]===0)clear++;
    assert(clear>image.width*image.height*.03,`${type} has real transparent outer edges`);
    assert(['satsang','keertan'].includes(type)?image.height>image.width:image.width>image.height);
  }
  assert(art.wedding.width>art.satsang.width);assert.equal(files.size,8);
 });

 test('regular font roles are centralized and decorative headings use Amita while event names lead timings',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;const css=fs.readFileSync(path.join(root,'typography.css'),'utf8');const style=d.createElement('style');style.textContent=['style.css','celebrations.css','typography.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');d.head.append(style);
  for(const selector of ['.initial-names','.intro-welcome h1','.formal-name','.formal-join','#celebrations-heading','#story-heading','.closing-section h2','#event-wedding .timeline-couple'])assert.equal(w.getComputedStyle(d.querySelector(selector)).fontFamily,'Amita, Tiro Devanagari Hindi, serif',selector);
  const name=d.querySelector('#event-groom-cocktail h3'),time=d.querySelector('#event-groom-cocktail .timeline-time');assert.equal(w.getComputedStyle(name).fontFamily,'Tiro Devanagari Hindi, Mangal, serif');assert.equal(w.getComputedStyle(time).fontFamily,'Noto Sans Devanagari, Mangal, sans-serif');assert(parseFloat(w.getComputedStyle(name).fontSize)>parseFloat(w.getComputedStyle(time).fontSize));
  for(const e of d.querySelectorAll('.timeline-venue,.timeline-actions a,.timeline-actions button,.day-heading h3'))assert.equal(w.getComputedStyle(e).fontFamily,'Noto Sans Devanagari, Mangal, sans-serif');
  assert.equal(w.getComputedStyle(name).fontWeight,'400');assert.equal(w.getComputedStyle(time).fontWeight,'400');assert.equal(w.getComputedStyle(d.querySelector('.formal-invite')).fontFamily,'Tiro Devanagari Hindi, Mangal, serif');
  for(const file of ['style.css','celebrations.css']){const source=fs.readFileSync(path.join(root,file),'utf8');assert(!/font-family\s*:|font-weight\s*:|font-style\s*:|letter-spacing\s*:/.test(source),file+' has no competing font role declarations');}
  assert(css.includes('font-synthesis:none'));assert(!d.querySelector('link[href*="fonts.googleapis.com"]'));assert(d.querySelector('link[rel="preload"][href="assets/fonts/amita-regular.ttf"]'));
  const faces=[];cssTree.walk(cssTree.parse(css),{visit:'Atrule',enter(node){if(node.name==='font-face')faces.push(cssTree.generate(node));}});assert.equal(faces.length,4);assert(faces.every(face=>face.includes('font-weight:400')&&face.includes('font-style:normal')));
 });
 test('self-hosted fonts have Hindi coverage and shaping tables; real font metrics leave room for marks at phone widths',t=>{
  const {GlobalFonts}=require('@napi-rs/canvas');
  function tables(buf){const result={};for(let i=0,n=buf.readUInt16BE(4);i<n;i++){const p=12+i*16;result[buf.toString('ascii',p,p+4)]={offset:buf.readUInt32BE(p+8),length:buf.readUInt32BE(p+12)};}return result;}
  function hasCodepoint(buf,t,cp){const base=t.cmap.offset,n=buf.readUInt16BE(base+2);for(let i=0;i<n;i++){const p=base+buf.readUInt32BE(base+4+i*8+4),format=buf.readUInt16BE(p);if(format===12){for(let g=0,count=buf.readUInt32BE(p+12);g<count;g++){const q=p+16+g*12;if(cp>=buf.readUInt32BE(q)&&cp<=buf.readUInt32BE(q+4))return true;}}if(format===4){const segs=buf.readUInt16BE(p+6)/2,ends=p+14,starts=ends+segs*2+2;for(let g=0;g<segs;g++)if(cp>=buf.readUInt16BE(starts+g*2)&&cp<=buf.readUInt16BE(ends+g*2))return true;}}return false;}
  const samples='हिमांशीसंगशुभमहमारेसमारोहहमारीकुछयादेंमेहंदीएवंकॉकटेलफ़रवरीश्रीकीर्तनप्रस्थानआशीर्वाद';
  for(const[file,family]of [['amita-regular.ttf','Amita'],['tiro-devanagari-hindi-regular.ttf','Tiro'],['noto-sans-devanagari-regular.ttf','Noto']]){
    const p=path.join(root,'assets/fonts',file),buf=fs.readFileSync(p);assert.equal(buf.readUInt32BE(0),0x00010000);const t=tables(buf);assert(t.GSUB);for(const ch of samples)assert(hasCodepoint(buf,t,ch.codePointAt(0)),family+' missing '+ch);assert(GlobalFonts.registerFromPath(p,'Check '+family));
  }
  const ctx=createCanvas(20,20).getContext('2d');for(const width of [360,390,430]){
    for(const[text,size,family]of [['हमारे समारोह',34,'Amita'],['हमारी कुछ यादें',34,'Amita'],['हिमांशी संग शुभम',30,'Amita'],['मेहंदी एवं कॉकटेल',28,'Tiro'],['प्रातः 11:00 बजे',21,'Noto']]){ctx.font=`${size}px "Check ${family}"`;const m=ctx.measureText(text);assert(m.width<width-68,text+' at '+width);assert(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent<size*1.85,text+' mark clearance');}
  }
 });

 test('every event keeps its family identity without restoring the redundant global status sentence',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  for(const side of ['groom','bride']){w.WeddingApp.setSide(side);for(const event of d.querySelectorAll('.timeline-event')){const badge=event.querySelector('.family-badge');assert(badge);assert.equal(badge.textContent,event.dataset.family==='shared'?'दोनों परिवारों का साझा समारोह':w.WEDDING.families[side].label);assert.equal(event.querySelectorAll('.family-badge').length,1);}assert(!d.querySelector('#side-status'));assert(!d.body.textContent.includes('शुभ विवाह दोनों परिवारों का है।'));}
 });
 test('gallery starts with lantern, school and travel photos and the viewer follows that same varied sequence',t=>{
  const env=setup();t.after(env.close);const{d,w}=env,photos=w.WEDDING.photos;
  assert.deepEqual([...photos].slice(0,3).map(p=>p.file),['WhatsApp Image 2026-11-05 at 20.40.14 (10).jpeg','WhatsApp Image 2026-11-05 at 20.40.13 (1).jpeg','WhatsApp Image 2026-11-05 at 20.40.13 (12).jpeg']);assert.equal(new Set([...photos].map(p=>p.file)).size,10);assert.equal(d.querySelectorAll('.photo-memory').length,10);assert(!d.querySelector('#our-story > .overline'));
  for(let index=0;index<3;index++){const image=d.querySelectorAll('.photo-memory img')[index];assert.equal(image.alt,photos[index].alt);assert(decodeURIComponent(image.src).endsWith(photos[index].file));}
  d.querySelector('[data-photo="0"]').click();assert.equal(d.querySelector('#photo-caption').textContent,photos[0].caption);d.querySelector('#photo-next').click();assert.equal(d.querySelector('#photo-caption').textContent,photos[1].caption);assert.equal(d.querySelector('#lightbox-image').alt,photos[1].alt);d.querySelector('#photo-next').click();assert.equal(d.querySelector('#photo-caption').textContent,photos[2].caption);assert.equal(d.querySelector('#photo-counter').textContent,'03 / 10');assert.equal(env.errors.length,0);
 });
 test('directions have a primary fill while calendars stay secondary and compact spacing preserves type roles',t=>{
  const env=setup();t.after(env.close);const{d,w}=env,style=d.createElement('style');style.textContent=['style.css','celebrations.css','typography.css'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');d.head.append(style);
  for(const side of ['groom','bride']){w.WeddingApp.setSide(side);for(const row of d.querySelectorAll('.timeline-event')){const primary=row.querySelector('.timeline-actions>a'),secondary=row.querySelector('.timeline-actions>button');if(primary){assert.notEqual(w.getComputedStyle(primary).backgroundColor,'rgba(0, 0, 0, 0)');assert(parseFloat(w.getComputedStyle(primary).minHeight)>=44);}if(secondary){assert.equal(w.getComputedStyle(secondary).backgroundColor,'rgba(0, 0, 0, 0)');assert(parseFloat(w.getComputedStyle(secondary).minHeight)>=44);}}}
  const headingStyle=w.getComputedStyle(d.querySelector('#celebrations-heading'));assert(parseFloat(headingStyle.wordSpacing)>0&&parseFloat(headingStyle.wordSpacing)<parseFloat(headingStyle.fontSize)*.25);assert.equal(w.getComputedStyle(d.querySelector('#celebrations-heading')).letterSpacing,'normal');assert.equal(w.getComputedStyle(d.querySelector('#our-story')).paddingTop,'38px');assert.equal(w.getComputedStyle(d.querySelector('.formal-invite')).paddingTop,'46px');
 });
