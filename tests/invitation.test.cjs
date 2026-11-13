const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {createCanvas,Image}=require('@napi-rs/canvas');
const cssTree=require('css-tree');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

function setup({url='http://localhost:5173/',reduced=false,canvas=true,contact=null,music=false,clipboard=false,dpr=1,observeTimeline=false,weddingTime=undefined,autoplayAllowed=false}={}) {
  const errors=[],downloads=[],opened=[],copied=[],animations=[],observers=[];
  const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error));
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
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
  if(contact)w.WEDDING.families.groom.contact=contact;
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
    const expected=side==='bride'?'bride':'groom';assert.equal(env.w.WeddingApp.getState().side,expected);assert.equal(env.d.querySelectorAll('#celebration-timeline .celebration-card').length,expected==='bride'?6:3);assert.equal(env.d.querySelectorAll('#event-wedding').length,1);assert.match(env.d.querySelector('#event-wedding').textContent,/शिवप्रिया फार्म्स/);
    const button=env.d.querySelector('[data-side="bride"]');button.focus();button.click();assert.equal(env.d.activeElement,button);assert.equal(new URL(env.w.location.href).searchParams.get('utm_source'),'family');assert.equal(env.w.WeddingApp.getState().side,'bride');
    env.dom.reconfigure({url:'http://localhost:5173/?side=groom'});env.w.dispatchEvent(new env.w.PopStateEvent('popstate'));assert.equal(env.w.WeddingApp.getState().side,'groom');assert.equal(env.errors.length,0);
  }
 });
 test('confirmed bride functions replace earlier unassigned placeholders without assuming groom details',t=>{const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;assert(d.querySelector('.pending-events').hidden);assert.match(d.querySelector('#event-bride-mehendi').textContent,/9 फ़र/);assert.match(d.querySelector('#event-bride-mehendi').textContent,/स्काई गार्डन/);assert.match(d.querySelector('#event-bride-haldi').textContent,/प्रातः 11:00 बजे/);assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,5);assert.equal(d.querySelectorAll('#celebration-timeline .timeline-event a').length,5);assert.equal(w.WeddingApp.calendarText(w.WEDDING.events.find(e=>e.id==='groom-haldi')),null);assert.match(d.querySelector('#family-cards').textContent,/मंजुश्री भंडारी/)});
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
  const source=fs.readFileSync(path.join(root,'style.css'),'utf8'),errors=[];cssTree.parse(source,{onParseError:error=>errors.push(error.message)});assert.deepEqual(errors,[]);assert.match(source,/\.scratch-card canvas\{[^}]*touch-action:none/);assert(!/body[^}]*touch-action:none/.test(source));assert.match(source,/@media\(prefers-reduced-motion:reduce\)/);assert.match(source,/@media\(max-width:360px\)/);assert.equal(env.errors.length,0);
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

 test('illustrated timeline alternates across a continuous spine and includes one shared wedding',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  for(const side of ['groom','bride']){
    w.WeddingApp.setSide(side);const rows=[...d.querySelectorAll('.timeline-event')];
    assert.equal(rows.length,side==='bride'?6:3);assert.deepEqual(rows.map(row=>row.dataset.position),rows.map((_,i)=>i%2?'art-right':'art-left'));
    assert.equal(d.querySelectorAll('.timeline-track').length,1);assert.equal(d.querySelectorAll('.timeline-marker svg').length,rows.length);assert.equal(d.querySelectorAll('.timeline-scene img').length,rows.length);assert.equal(d.querySelectorAll('#event-wedding').length,1);
    assert(rows.every(row=>row.querySelector('.timeline-date')&&row.querySelector('.timeline-time')&&row.querySelector('.timeline-hindi')&&row.querySelector('.timeline-description')&&row.querySelector('.timeline-venue')));
    for(const row of rows){const event=w.WEDDING.events.find(e=>'event-'+e.id===row.id);assert.equal(Boolean(row.querySelector('[data-calendar]')),Boolean(event.date&&event.time));}
  }
 });
 test('confirmed dates and times determine timeline order, large clock text, and calendar eligibility',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const events=w.WEDDING.events;Object.assign(events.find(e=>e.id==='groom-cocktail'),{date:'2027-02-10',time:'09:00'});Object.assign(events.find(e=>e.id==='groom-haldi'),{date:'2027-02-09',time:'10:00'});Object.assign(events.find(e=>e.id==='wedding'),{time:'20:30'});
  w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-haldi','event-groom-cocktail','event-wedding']);
  assert.match(d.querySelector('#event-groom-cocktail .timeline-time').textContent,/प्रातः 9:00 बजे/);assert(!d.querySelector('#event-groom-cocktail .timeline-time').classList.contains('is-pending'));assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,3);
  // Same-date functions must also be in actual clock order, not source-array order.
  events.find(e=>e.id==='groom-haldi').date='2027-02-10';w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-cocktail','event-groom-haldi','event-wedding']);
 });
 test('timeline progress follows reading position and is fully visible for reduced motion',t=>{
  const env=setup();t.after(env.close);const timeline=env.d.querySelector('.illustrated-timeline');timeline.getBoundingClientRect=()=>({top:300,height:1000});env.w.WeddingApp.updateTimelineProgress();const p=Number(timeline.style.getPropertyValue('--timeline-progress'));assert(p>0&&p<1);timeline.getBoundingClientRect=()=>({top:1000,height:1000});env.w.WeddingApp.updateTimelineProgress();assert.equal(timeline.style.getPropertyValue('--timeline-progress'),'0');timeline.getBoundingClientRect=()=>({top:-1500,height:1000});env.w.WeddingApp.updateTimelineProgress();assert.equal(timeline.style.getPropertyValue('--timeline-progress'),'1');
  const reduced=setup({reduced:true});t.after(reduced.close);assert.equal(reduced.d.querySelector('.illustrated-timeline').style.getPropertyValue('--timeline-progress'),'1');assert([...reduced.d.querySelectorAll('.timeline-event')].every(row=>!row.hidden));
 });
 test('viewport entrances animate the scene first and details shortly afterwards',t=>{
  const env=setup({observeTimeline:true});t.after(env.close);const observer=env.observers.find(o=>o.elements.some(e=>e.classList.contains('timeline-event')));assert(observer);const row=observer.elements[0];observer.callback([{isIntersecting:true,target:row}]);const scene=env.animations.find(a=>a.element===row.querySelector('.timeline-scene')),details=env.animations.find(a=>a.element===row.querySelector('.timeline-details'));assert(scene);assert(details);assert.equal(scene.options.duration,950);assert.equal(details.options.delay,150);assert.equal(details.options.duration,850);
  env.w.WeddingApp.setSide('bride');assert(observer.disconnected);
 });
 test('missing artwork is explicitly labelled rather than substituted with a generic symbol',t=>{const env=setup();t.after(env.close);delete env.w.WEDDING.eventArtwork.cocktail;env.w.WeddingApp.setSide('groom');assert.match(env.d.querySelector('#event-groom-cocktail .timeline-scene').textContent,/चित्र शीघ्र जोड़ा जाएगा/);assert(!env.d.querySelector('#event-groom-cocktail .event-illustration'))});

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
  assert(d.querySelector('link[href*="Noto+Serif+Devanagari"]'));
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
  assert.equal(events.find(e=>e.id==='bride-keertan').date,'2027-02-08');assert.equal(events.find(e=>e.id==='bride-mehendi').venue.mapsQuery,'Sky Garden Wedding Point, Jogiwala, Dehradun');assert.equal(events.find(e=>e.id==='bride-haldi').time,'11:00');
  for(const event of events.filter(e=>e.side==='groom')){assert.equal(event.date,null);assert.equal(event.venue,null)}
  const ics=w.WeddingApp.calendarText(wedding);assert.match(ics,/SUMMARY:हिमांशी संग शुभम — शुभ विवाह/);assert.match(ics,/DTSTART:20270210T143000Z/);assert.match(ics,/LOCATION:शिवप्रिया फार्म्स\\, देहरादून/);
 });

 test('Himanshi’s confirmed schedule follows the supplied sequence, with one combined mehendi-cocktail',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env;
  const expected=['bride-satsang','bride-keertan','bride-mehendi','bride-haldi','wedding','bride-vidaai'];
  assert.deepEqual([...w.WeddingApp.scheduleEvents('bride')].map(event=>event.id),expected);
  assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),expected.map(id=>'event-'+id));
  assert(!d.querySelector('#rsvp-events'));

  assert.match(d.querySelector('#event-bride-mehendi h3').textContent,/मेहंदी एवं कॉकटेल/);assert(d.querySelector('.pending-events').hidden);
  w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-cocktail','event-groom-haldi','event-wedding']);
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
    assert.match(d.querySelector('#event-'+id+' .timeline-venue').textContent,/गली नंबर ११, इंद्रप्रस्थ कॉलोनी, ६ नंबर पुलिया के पास/);
    const query=new URL(d.querySelector('#event-'+id+' a').href).searchParams.get('query');assert.equal(query,'Lane No 11, Indraprastha Colony, near 6 Number Puliya, Jogiwala, Dehradun');
  }
  assert.equal(new URL(d.querySelector('#event-bride-mehendi a').href).searchParams.get('query'),'Sky Garden Wedding Point, Jogiwala, Dehradun');
  assert.equal(new URL(d.querySelector('#event-wedding a').href).searchParams.get('query'),'Shivpriya Farms, Dehradun');
  assert.match(d.querySelector('#additional-venues').textContent,/गली नंबर ११/);assert.match(d.querySelector('#additional-venues').textContent,/स्काई गार्डन/);
 });
 test('vidaai stays after the wedding with its poetic timing and no invented date or calendar file',t=>{
  const env=setup({url:'http://localhost:5173/?side=bride'});t.after(env.close);const{d,w}=env,vidaai=w.WEDDING.events.find(event=>event.id==='bride-vidaai');
  assert.equal(vidaai.date,null);assert.equal(vidaai.time,null);assert.equal(vidaai.after,'wedding');
  assert.equal(d.querySelector('#event-bride-vidaai .timeline-date').textContent,'विवाह के बाद');assert.equal(d.querySelector('#event-bride-vidaai .timeline-time').textContent,'तारों की छाँव में');
  assert.equal(d.querySelector('#event-bride-vidaai .timeline-time').getAttribute('aria-label'),'तारों की छाँव में');assert(!d.querySelector('#event-bride-vidaai [data-calendar]'));assert.equal(w.WeddingApp.calendarText(vidaai),null);
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
  for(const logo of d.querySelectorAll('.opening-mark,.brand,.crest'))assert.equal(logo.querySelector('img').getAttribute('src'),'assets/logo.png');
  assert.match(d.querySelector('.intro-welcome h1').textContent,/हिमांशी/);assert.match(d.querySelector('.intro-welcome h1').textContent,/शुभम/);
  assert.match(fs.readFileSync(path.join(root,'style.css'),'utf8'),/Cormorant Garamond/);
 });
 test('verified parents appear directly below the correct bride and groom and in the family section',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const bride=d.querySelector('.formal-person[data-person=bride]'),groom=d.querySelector('.formal-person[data-person=groom]');
  assert.equal(bride.querySelector('.formal-name').textContent,'हिमांशी');assert.equal(bride.querySelector('.formal-relation').textContent,'सुपुत्री');assert.match(bride.querySelector('.formal-parents').textContent,/श्रीमती वीना राणा/);assert.match(bride.querySelector('.formal-parents').textContent,/श्री राजेंद्र सिंह राणा/);
  assert.equal(groom.querySelector('.formal-name').textContent,'शुभम');assert.equal(groom.querySelector('.formal-relation').textContent,'सुपुत्र');assert.match(groom.querySelector('.formal-parents').textContent,/श्रीमती मंजुश्री भंडारी/);assert.match(groom.querySelector('.formal-parents').textContent,/श्री रविंद्र सिंह भंडारी/);
  for(const family of Object.values(w.WEDDING.families))for(const parent of family.members)assert(d.querySelector('#family-cards').textContent.includes(parent.name));
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
  assert.equal(art.satsang.src,'assets/events/satsang.webp');assert.equal(art.vidaai.src,'assets/events/vidaai.webp');
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
  assert.match(d.querySelector('#story-copy').textContent,/सपरिवार आमंत्रित/);
  assert.equal(env.errors.length,0);
 });

 test('music autoplays when permitted and first invitation tap retries blocked autoplay',async t=>{
  const allowed=setup({music:true,autoplayAllowed:true});t.after(allowed.close);await tick();assert.equal(allowed.audioPlays(),1);assert.equal(allowed.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'true');
  const blocked=setup({music:true});t.after(blocked.close);await tick();assert.equal(blocked.audioPlays(),0);blocked.d.querySelector('#water-tap').click();await tick();assert.equal(blocked.audioPlays(),1);
  blocked.d.querySelector('#music-toggle').click();await tick();assert(blocked.d.querySelector('audio').paused);blocked.d.querySelector('[data-side="bride"]').click();await tick();assert(blocked.d.querySelector('audio').paused);assert.equal(blocked.audioPlays(),1);
 });
