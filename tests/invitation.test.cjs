const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {createCanvas,Image}=require('@napi-rs/canvas');
const cssTree=require('css-tree');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

function setup({url='http://localhost:5173/',reduced=false,canvas=true,contact=null,music=false,clipboard=false,dpr=1,observeTimeline=false}={}) {
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
  if(contact)w.WEDDING.families.groom.contact=contact;
  if(music)w.WEDDING.music={src:'licensed-test-track.mp3',title:'Test track',licence:'Test fixture only'};
  let audioPaused=true,audioPlays=0;
  const audio=d.querySelector('audio');
  Object.defineProperty(audio,'paused',{get:()=>audioPaused});
  audio.play=async()=>{audioPaused=false;audioPlays++;audio.dispatchEvent(new w.Event('play'))};
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
 test('reduced motion immediately gives the complete usable invitation',t=>{const env=setup({reduced:true});t.after(env.close);assert.equal(env.w.WeddingApp.getState().intro,'revealed');assert(env.d.querySelector('.water-opening').classList.contains('instant'));assert(!env.d.querySelector('#send-whatsapp').hidden);assert.equal(env.errors.length,0)});
 test('scratch removes real cover pixels and completes at the configured threshold',t=>{
  const env=setup();t.after(env.close);const canvas=env.d.querySelector('.scratch-card canvas'),native=env.getBacking(canvas),ctx=native.getContext('2d');
  assert.equal(ctx.getImageData(75,79,1,1).data[3],255);
  pointer(env,canvas,'pointerdown',10,10);pointer(env,canvas,'pointermove',24,10);pointer(env,canvas,'pointerup',24,10);
  assert.equal(ctx.getImageData(15,10,1,1).data[3],0);assert.equal(env.w.WeddingApp.getState().scratched[0],false);
  pointer(env,canvas,'pointerdown',0,0);
  for(let y=0;y<=158;y+=14)for(let x=0;x<=150;x+=15)pointer(env,canvas,'pointermove',x,y);
  pointer(env,canvas,'pointerup',150,158);
  assert.equal(env.w.WeddingApp.getState().scratched[0],true);assert(env.d.querySelector('#date-details').hidden);
  env.d.querySelector('#reveal-date').click();assert.deepEqual([...env.w.WeddingApp.getState().scratched],[true,true,true]);assert(!env.d.querySelector('#date-details').hidden);assert.match(env.d.querySelector('#scratch-status').textContent,/३ में से ३/);
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
    const expected=side==='bride'?'bride':'groom';assert.equal(env.w.WeddingApp.getState().side,expected);assert.equal(env.d.querySelectorAll('#celebration-timeline .celebration-card').length,3);assert.equal(env.d.querySelectorAll('#event-wedding').length,1);assert.match(env.d.querySelector('#event-wedding').textContent,/शिवप्रिया फार्म्स/);
    const button=env.d.querySelector('[data-side="bride"]');button.focus();button.click();assert.equal(env.d.activeElement,button);assert.equal(new URL(env.w.location.href).searchParams.get('utm_source'),'family');assert.equal(env.d.querySelector('#rsvp-side').value,'bride');assert(!env.d.querySelector('#attend-groom-haldi'));assert(env.d.querySelector('#attend-wedding'));
    env.dom.reconfigure({url:'http://localhost:5173/?side=groom'});env.w.dispatchEvent(new env.w.PopStateEvent('popstate'));assert.equal(env.w.WeddingApp.getState().side,'groom');assert.equal(env.errors.length,0);
  }
 });
 test('unassigned facts are retained without inventing family dates, maps or calendar entries',t=>{const env=setup();t.after(env.close);const{d,w}=env;assert.match(d.querySelector('#unassigned-events').textContent,/९ फ़रवरी २०२७/);assert.match(d.querySelector('#unassigned-events').textContent,/स्काई गार्डन/);assert.match(d.querySelector('#unassigned-events').textContent,/प्रातः १०:०० बजे \(भारतीय समय\)/);assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,0);assert.equal(d.querySelectorAll('#celebration-timeline .timeline-event:not([data-family=shared]) a').length,0);assert.equal(w.WeddingApp.calendarText(w.WEDDING.events[0]),null);assert.match(d.querySelector('#family-cards').textContent,/परिजनों के नाम शीघ्र साझा/)});
 test('calendar is date-only when wedding time is unconfirmed and exports the actual venue',t=>{const env=setup();t.after(env.close);const event=env.w.WEDDING.events.find(e=>e.id==='wedding'),ics=env.w.WeddingApp.calendarText(event);assert.match(ics,/DTSTART;VALUE=DATE:20270210\r\nDTEND;VALUE=DATE:20270211/);assert.match(ics,/LOCATION:शिवप्रिया फार्म्स\\, देहरादून/);assert.match(ics,/आयोजन का सही समय अभी तय नहीं है/);env.d.querySelector('[data-calendar="wedding"]').click();assert.equal(env.downloads.length,1);assert.match(env.d.querySelector('[data-map="wedding"]').href,/Shivpriya%20Farms/)});
 test('countdown uses IST wedding date, has a date-only label and a post-date message',t=>{const env=setup();t.after(env.close);env.w.WeddingApp.updateCountdown(new Date('2027-02-09T18:29:00Z'));assert.equal(env.d.querySelector('#minutes').textContent,'०१');assert.match(env.d.querySelector('#countdown-note').textContent,/विवाह तिथि के आरंभ तक/);env.w.WeddingApp.updateCountdown(new Date('2027-02-10T00:00:00Z'));assert.equal(env.d.querySelector('#days').textContent,'००');assert.match(env.d.querySelector('#countdown-note').textContent,/शुभारंभ हो चुका है/)});
 test('gallery touch-friendly scrolling, lightbox navigation, close and restored focus',t=>{const env=setup();t.after(env.close);const{d,w}=env;assert.equal(d.querySelectorAll('.photo-memory').length,10);d.querySelector('#gallery-next').click();assert(d.querySelector('#photo-track').scrollLeft>0);const opener=d.querySelector('[data-photo="0"]');opener.focus();opener.click();assert(d.querySelector('#photo-dialog').open);const initial=d.querySelector('#lightbox-image').src;d.querySelector('#photo-next').click();assert.notEqual(d.querySelector('#lightbox-image').src,initial);d.querySelector('#photo-dialog').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(d.querySelector('#lightbox-image').src,initial);d.querySelector('#photo-prev').click();assert.match(d.querySelector('#photo-counter').textContent,/१० \/ १०/);d.querySelector('#photo-close').click();assert(!d.querySelector('#photo-dialog').open);assert.equal(d.activeElement,opener);assert(!d.documentElement.classList.contains('album-open'))});
 test('RSVP validates names and functions, retains per-side drafts and omits the other family',async t=>{
  const env=setup({clipboard:true});t.after(env.close);const{d,w}=env;
  assert(d.querySelector('#send-whatsapp').disabled);d.querySelector('#guest-name').value='   ';submit(env,'#copy-rsvp');assert.match(d.querySelector('#rsvp-error').textContent,/अपना नाम लिखें/);
  d.querySelector('#guest-name').value='Aditi & family';submit(env,'#copy-rsvp');assert.match(d.querySelector('#rsvp-error').textContent,/कम से कम एक समारोह/);
  selectEvent(env,'groom-haldi',3);selectEvent(env,'wedding',4);d.querySelector('#guest-message').value='Can’t wait! ♥';submit(env,'#copy-rsvp');await tick();
  assert.equal(env.copied.length,1);assert.match(env.copied[0],/शुभम की हल्दी — ३ अतिथि/);assert.match(env.copied[0],/शुभ विवाह — ४ अतिथि/);assert.match(env.copied[0],/Can’t wait! ♥/);assert(!env.copied[0].includes('हिमांशी की हल्दी'));assert.equal(env.opened.length,0);
  w.WeddingApp.setSide('bride');assert(d.querySelector('#attend-wedding').checked);assert.equal(d.querySelector('#count-wedding').value,'४');assert(!d.querySelector('#attend-bride-haldi').checked);w.WeddingApp.setSide('groom');assert(d.querySelector('#attend-groom-haldi').checked);assert.equal(d.querySelector('#count-groom-haldi').value,'३');assert.equal(d.querySelector('#guest-name').value,'Aditi & family');
 });
 test('clipboard-denied fallback offers the exact draft for manual copying',async t=>{const env=setup();t.after(env.close);env.d.querySelector('#guest-name').value='Aditi';selectEvent(env,'wedding',2);submit(env,'#copy-rsvp');await tick();assert(!env.d.querySelector('#copy-fallback').hidden);assert.match(env.d.querySelector('#reply-text').value,/२ अतिथि/);assert.equal(env.d.activeElement,env.d.querySelector('#reply-text'));assert.equal(env.opened.length,0)});
 test('WhatsApp draft is encoded and opens only after explicit submission; nothing is sent',async t=>{const env=setup({contact:'919999999999'});t.after(env.close);assert(!env.d.querySelector('#send-whatsapp').disabled);env.d.querySelector('#guest-name').value='A & B';env.d.querySelector('#guest-message').value='Hello + नमस्ते';selectEvent(env,'wedding',2);assert.equal(env.opened.length,0);submit(env,'#send-whatsapp');await tick();assert.equal(env.opened.length,1);const url=new URL(env.opened[0]);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/919999999999');assert.match(url.searchParams.get('text'),/अतिथि: A & B/);assert.match(url.searchParams.get('text'),/Hello \+ नमस्ते/);assert.match(env.d.querySelector('#rsvp-status').textContent,/उत्तर नहीं भेजा है/)});
 test('guest counts enforce integer bounds and controls change only selected events',t=>{const env=setup();t.after(env.close);assert(env.d.querySelector('#count-groom-haldi').disabled);selectEvent(env,'groom-haldi',1);const row=env.d.querySelector('[data-event="groom-haldi"]');row.querySelector('[data-step="-1"]').click();assert.equal(env.d.querySelector('#count-groom-haldi').value,'१');row.querySelector('[data-step="1"]').click();assert.equal(env.d.querySelector('#count-groom-haldi').value,'२');env.d.querySelector('#count-groom-haldi').value='50';row.querySelector('[data-step="1"]').click();assert.equal(env.d.querySelector('#count-groom-haldi').value,'५०');assert.equal(env.d.querySelector('#count-groom-haldi').max,'50')});
 test('music is absent without licensed content, never autoplays, and responds to explicit controls',async t=>{const silent=setup();t.after(silent.close);assert(silent.d.querySelector('#music-toggle').hidden);assert.equal(silent.audioPlays(),0);const env=setup({music:true});t.after(env.close);assert(!env.d.querySelector('#music-toggle').hidden);assert.equal(env.audioPlays(),0);env.d.querySelector('#music-toggle').click();await tick();assert.equal(env.audioPlays(),1);assert.equal(env.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'true');env.d.querySelector('#music-toggle').click();await tick();assert.equal(env.d.querySelector('#music-toggle').getAttribute('aria-pressed'),'false')});
 test('mobile menu, assets, anchor targets, unique IDs, no network submissions and CSS syntax',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  d.querySelector('.menu-toggle').click();assert(!d.querySelector('#mobile-nav').hidden);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert(d.querySelector('#mobile-nav').hidden);
  for(const image of d.querySelectorAll('img[src]'))assert(fs.existsSync(path.join(root,decodeURIComponent(image.getAttribute('src')))),image.src);
  for(const anchor of d.querySelectorAll('a[href^="#"]'))assert(d.querySelector(anchor.getAttribute('href')),anchor.href);
  const ids=[...d.querySelectorAll('[id]')].map(element=>element.id);assert.equal(new Set(ids).size,ids.length);
  assert(!d.querySelector('#rsvp-form').hasAttribute('action'));assert(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage/.test(fs.readFileSync(path.join(root,'script.js'),'utf8')));
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
    assert.equal(rows.length,3);assert.deepEqual(rows.map(row=>row.dataset.position),['art-left','art-right','art-left']);
    assert.equal(d.querySelectorAll('.timeline-track').length,1);assert.equal(d.querySelectorAll('.timeline-marker svg').length,3);assert.equal(d.querySelectorAll('.timeline-scene img').length,3);assert.equal(d.querySelectorAll('#event-wedding').length,1);
    assert(rows.every(row=>row.querySelector('.timeline-date')&&row.querySelector('.timeline-time')&&row.querySelector('.timeline-hindi')&&row.querySelector('.timeline-description')&&row.querySelector('.timeline-venue')));
    assert.match(rows[0].querySelector('.timeline-time').textContent,/समय शीघ्रबताया जाएगा/);
    assert(rows.every(row=>!row.querySelector('[data-calendar]')),'Unknown time must not produce a timeline calendar action');
  }
  assert(d.querySelector('#unassigned-events img[src="assets/events/keertan.webp"]'));
 });
 test('confirmed dates and times determine timeline order, large clock text, and calendar eligibility',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  const events=w.WEDDING.events;Object.assign(events.find(e=>e.id==='groom-cocktail'),{date:'2027-02-10',time:'09:00'});Object.assign(events.find(e=>e.id==='groom-haldi'),{date:'2027-02-09',time:'10:00'});Object.assign(events.find(e=>e.id==='wedding'),{time:'20:30'});
  w.WeddingApp.setSide('groom');assert.deepEqual([...d.querySelectorAll('.timeline-event')].map(row=>row.id),['event-groom-haldi','event-groom-cocktail','event-wedding']);
  assert.match(d.querySelector('#event-groom-cocktail .timeline-time').textContent,/प्रातः ९:०० बजे/);assert(!d.querySelector('#event-groom-cocktail .timeline-time').classList.contains('is-pending'));assert.equal(d.querySelectorAll('#celebration-timeline [data-calendar]').length,3);
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

 test('Hindi branch contains no Latin text in rendered invitation copy or accessibility labels',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;
  assert.equal(d.documentElement.lang,'hi');assert.match(d.title,/हिमांशी एवं शुभम/);
  function checkCopy(){
    const walker=d.createTreeWalker(d.body,w.NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement?.closest('script,style,noscript'))continue;
      assert(!/[A-Za-z]/.test(node.textContent),`Untranslated visible text: ${node.textContent.trim()}`);
    }
    for(const element of d.querySelectorAll('[aria-label],[alt],[placeholder]')){
      for(const attribute of ['aria-label','alt','placeholder'])if(element.hasAttribute(attribute))assert(!/[A-Za-z]/.test(element.getAttribute(attribute)),`Untranslated ${attribute}: ${element.getAttribute(attribute)}`);
    }
  }
  checkCopy();w.WeddingApp.setSide('bride');checkCopy();w.WeddingApp.finishIntro({instant:true});w.WeddingApp.revealAllDates();d.querySelector('[data-photo="0"]').click();checkCopy();d.querySelector('#photo-close').click();
  assert(d.querySelector('link[href*="Noto+Serif+Devanagari"]'));
 });
 test('all displayed date, countdown, album and initial guest-count numerals are Devanagari',t=>{
  const env=setup();t.after(env.close);const{d,w}=env;assert.equal(d.querySelector('#date-day').textContent,'१०');assert.equal(d.querySelector('#date-year').textContent,'२०२७');assert.match(d.querySelector('#date-month').textContent,/फ़रवरी/);
  for(const id of ['days','hours','minutes','seconds'])assert(/^[०-९]+$/.test(d.getElementById(id).textContent));
  for(const input of d.querySelectorAll('[data-guest-count]'))assert.equal(input.value,'१');
  d.querySelector('[data-photo="0"]').click();assert.equal(d.querySelector('#photo-counter').textContent,'०१ / १०');
  assert(!/[0-9]/.test(d.querySelector('#event-wedding').textContent));
 });
 test('Hindi and Latin numeral input produce the same Hindi reply and preserve counts across family switches',async t=>{
  const env=setup({clipboard:true});t.after(env.close);const{d,w}=env;d.querySelector('#guest-name').value='अदिति';selectEvent(env,'groom-haldi','१२');
  const input=d.querySelector('#count-groom-haldi'),row=input.closest('.rsvp-event');row.querySelector('[data-step="1"]').click();assert.equal(input.value,'१३');input.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));assert.equal(input.value,'१४');
  submit(env,'#copy-rsvp');await tick();assert.match(env.copied[0],/शुभम की हल्दी — १४ अतिथि/);assert(!/[A-Za-z0-9]/.test(env.copied[0]));
  w.WeddingApp.setSide('bride');w.WeddingApp.setSide('groom');assert.equal(d.querySelector('#count-groom-haldi').value,'१४');
  const count=d.querySelector('#count-groom-haldi');count.value='15';count.dispatchEvent(new w.Event('input',{bubbles:true}));count.dispatchEvent(new w.Event('focusout',{bubbles:true}));assert.equal(count.value,'१५');submit(env,'#copy-rsvp');await tick();assert.match(env.copied[1],/१५ अतिथि/);
 });
 test('native form validation messages are Hindi and clear after correction',async t=>{
  const env=setup({clipboard:true});t.after(env.close);const{d,w}=env;submit(env,'#copy-rsvp');const name=d.querySelector('#guest-name');assert.equal(name.validationMessage,'कृपया अपना नाम लिखें।');
  name.value='अदिति';name.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(name.validationMessage,'');selectEvent(env,'wedding',2);
  const count=d.querySelector('#count-wedding');count.value='१२.५';count.dispatchEvent(new w.Event('input',{bubbles:true}));submit(env,'#copy-rsvp');assert.match(count.validationMessage,/१ से ५०/);assert.equal(env.copied.length,0);
  count.value='३';count.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(count.validationMessage,'');submit(env,'#copy-rsvp');await tick();assert.match(env.copied[0],/३ अतिथि/);
 });
 test('translation preserves confirmed event facts, map targets and machine-readable calendar dates',t=>{
  const env=setup();t.after(env.close);const{w}=env,events=w.WEDDING.events;
  const wedding=events.find(e=>e.id==='wedding');assert.equal(wedding.date,'2027-02-10');assert.equal(wedding.time,null);assert.equal(wedding.venue.mapsQuery,'Shivpriya Farms, Dehradun');assert.equal(wedding.venue.name,'शिवप्रिया फार्म्स');
  assert.equal(events.find(e=>e.id==='unassigned-keertan').date,'2027-02-08');assert.equal(events.find(e=>e.id==='unassigned-cocktail').venue.mapsQuery,'Sky Garden, Jogiwala, Dehradun');assert.equal(events.find(e=>e.id==='unassigned-haldi').time,'10:00');
  for(const event of events.filter(e=>['groom','bride'].includes(e.side))){assert.equal(event.date,null);assert.equal(event.venue,null)}
  const ics=w.WeddingApp.calendarText(wedding);assert.match(ics,/SUMMARY:हिमांशी एवं शुभम — शुभ विवाह/);assert.match(ics,/DTSTART;VALUE=DATE:20270210/);assert.match(ics,/LOCATION:शिवप्रिया फार्म्स\\, देहरादून/);
 });
