const weddingDay = new Date('2027-02-10T00:00:00+05:30');
function updateCountdown() {
  const remaining = Math.max(0, weddingDay - new Date());
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => document.getElementById(id).textContent = String(values[index]).padStart(2, '0'));
  if (!remaining) document.getElementById('countdown-note').textContent = 'Our forever has begun · 10 February 2027';
}
updateCountdown(); setInterval(updateCountdown, 1000);
document.querySelectorAll('.details-button').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!open));
  button.nextElementSibling.hidden = open;
  button.querySelector('span').textContent = open ? '+' : '−';
}));
const events = {
  keertan: { title: 'Himanshi & Shubham — Keertan', dates: 'DTSTART;VALUE=DATE:20270208\r\nDTEND;VALUE=DATE:20270209', location: 'Dehradun, Uttarakhand — venue to follow', description: 'Devotional music, prayers, and family blessings. Time and venue to follow.' },
  cocktail: { title: 'Himanshi & Shubham — Cocktail', dates: 'DTSTART;VALUE=DATE:20270209\r\nDTEND;VALUE=DATE:20270210', location: 'Sky Garden, Jogiwala, Dehradun', description: 'An evening of music and celebration at Sky Garden, Jogiwala, Dehradun. Exact time to follow.' },
  haldi: { title: 'Himanshi & Shubham — Haldi', dates: 'DTSTART:20270210T043000Z', location: 'Dehradun, Uttarakhand — venue to follow', description: 'Haldi starts at 10:00 AM IST. Venue to follow. End time to be confirmed.' },
  wedding: { title: 'Himanshi & Shubham — Wedding', dates: 'DTSTART;VALUE=DATE:20270210\r\nDTEND;VALUE=DATE:20270211', location: 'Shivpriya Farms, Dehradun', description: 'Our wedding night at Shivpriya Farms, Dehradun. Exact time to follow.' }
};
function escapeICS(value) { return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
let toastTimeout;
document.querySelectorAll('.calendar').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.event, event = events[key];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Himanshi and Shubham//Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${key}-202702@himanshi-shubham.example`, `DTSTAMP:${stamp}`, event.dates, `SUMMARY:${escapeICS(event.title)}`, `LOCATION:${escapeICS(event.location)}`, `DESCRIPTION:${escapeICS(event.description)}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], {type: 'text/calendar;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = `${key}-invitation.ics`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  const toast = document.querySelector('.toast'); toast.textContent = 'Calendar file ready — open it to save the date.'; toast.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), 4000);
}));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const filterButtons = document.querySelectorAll('[data-filter]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  const filter = button.dataset.filter;
  const grid = document.querySelector('.event-grid');
  grid.classList.toggle('single-event', filter !== 'all');
  document.querySelectorAll('.event').forEach(card => {
    const visible = filter === 'all' || card.classList.contains(filter);
    card.hidden = !visible;
    if (visible && !reduceMotion) card.animate([{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 380, easing: 'ease-out'});
  });
}));
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.querySelector(link.getAttribute('href'));
  if (target && !reduceMotion) target.animate([{opacity:.65}, {opacity:1}], {duration:600});
}));

// One shared album viewer for the hero, story, gallery, and closing portrait.
const photoDialog = document.querySelector('.photo-dialog');
const photoImage = photoDialog.querySelector('.lightbox-image');
const photoCaption = photoDialog.querySelector('.lightbox-caption');
const photoCounter = photoDialog.querySelector('.lightbox-counter');
const photoTriggers = [...document.querySelectorAll('[data-photo]')];
const album = [];
photoTriggers.forEach(trigger => {
  if (!album.some(photo => photo.src === trigger.dataset.photo)) {
    album.push({src: trigger.dataset.photo, caption: trigger.dataset.caption, alt: trigger.querySelector('img').alt});
  }
});
let photoIndex = 0;
let photoOpener;
function showPhoto(index) {
  photoIndex = (index + album.length) % album.length;
  const photo = album[photoIndex];
  photoImage.src = photo.src;
  photoImage.alt = photo.alt;
  photoCaption.textContent = photo.caption;
  photoCounter.textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(album.length).padStart(2, '0')}`;
  if (!reduceMotion) photoImage.animate([{opacity: .3, transform: 'scale(.98)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 260, easing: 'ease-out'});
}
photoTriggers.forEach(trigger => trigger.addEventListener('click', () => {
  photoOpener = trigger;
  showPhoto(album.findIndex(photo => photo.src === trigger.dataset.photo));
  photoDialog.showModal();
  document.documentElement.classList.add('album-open');
}));
photoDialog.querySelector('.lightbox-close').addEventListener('click', () => photoDialog.close());
photoDialog.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
photoDialog.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(photoIndex + 1));
photoDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
});
photoDialog.addEventListener('click', event => { if (event.target === photoDialog) photoDialog.close(); });
photoDialog.addEventListener('close', () => {
  document.documentElement.classList.remove('album-open');
  photoOpener?.focus({preventScroll: true});
});
let touchStart;
photoImage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, {passive: true});
photoImage.addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(delta) > 50) showPhoto(photoIndex + (delta < 0 ? 1 : -1));
  touchStart = undefined;
}, {passive: true});
if (!reduceMotion && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.animate([{opacity: 0, transform: 'translateY(22px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 650, easing: 'ease-out'});
      reveal.unobserve(entry.target);
    }
  }), {threshold: .12});
  document.querySelectorAll('.memory-card, .story-portrait, .closing-photo').forEach(item => reveal.observe(item));
}

// The date overview jumps straight into an expanded celebration.
document.querySelectorAll('.date-event').forEach(link => link.addEventListener('click', () => {
  const target = document.querySelector(link.getAttribute('href'));
  document.querySelector('[data-filter="all"]').click();
  const details = target.querySelector('.details-button');
  if (details.getAttribute('aria-expanded') !== 'true') details.click();
}));
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
function closeMenu() {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  mainNav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const readingProgress = document.querySelector('.reading-progress');
const mobileDates = document.querySelector('.mobile-date-link');
let scrollPending = false;
function updateScroll() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.style.width = `${height > 0 ? Math.min(100, window.scrollY / height * 100) : 0}%`;
  mobileDates.classList.toggle('visible', window.scrollY > 750);
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
}, {passive: true});
updateScroll();
