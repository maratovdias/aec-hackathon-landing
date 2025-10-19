// Smooth scroll + mobile menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
if (burger) {
  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      menu.classList.remove('open');
      burger && burger.setAttribute('aria-expanded', 'false');
    }
  });
});

// Countdown to next roadmap stage with label and roadmap agent
const cdEls = { days: document.getElementById('cd-days'), hours: document.getElementById('cd-hours'), mins: document.getElementById('cd-mins'), secs: document.getElementById('cd-secs') };
const stageLabelEl = document.createElement('div');
stageLabelEl.className = 'next-stage-label';
const countdownEl = document.getElementById('countdown');
if (countdownEl) countdownEl.appendChild(stageLabelEl);

// Define roadmap schedule (local time)
const ROADMAP_STEPS = [
  { at: new Date(2025,9,20,9,0,0), label: 'Открытие / Ашылу' },
  { at: new Date(2025,9,20,10,0,0), label: 'Рабочая сессия / Жұмыс сессиясы' },
  { at: new Date(2025,9,20,13,0,0), label: 'Обед / Түскі үзіліс' },
  { at: new Date(2025,9,20,14,0,0), label: 'Работа + менторы / Жұмыс + менторлар' },
  { at: new Date(2025,9,21,9,0,0), label: 'Завершение / Аяқтау' },
  { at: new Date(2025,9,21,14,0,0), label: 'Презентации / Таныстыру' },
  { at: new Date(2025,9,21,17,0,0), label: 'Награждение / Марапаттау' }
];

function pad(n){ return String(n).padStart(2,'0'); }
function nextStage(now){
  for (let i=0;i<ROADMAP_STEPS.length;i++){
    if (ROADMAP_STEPS[i].at.getTime() > now.getTime()) return { idx:i, step:ROADMAP_STEPS[i] };
  }
  return null;
}
function tickRoadmap(){
  const now = new Date();
  const ns = nextStage(now);
  if (!ns){ if (stageLabelEl) stageLabelEl.textContent = 'Все этапы завершены'; return; }
  const diff = Math.max(0, ns.step.at.getTime() - now.getTime());
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (cdEls.days) cdEls.days.textContent = pad(d);
  if (cdEls.hours) cdEls.hours.textContent = pad(h);
  if (cdEls.mins) cdEls.mins.textContent = pad(m);
  if (cdEls.secs) cdEls.secs.textContent = pad(s);
  if (stageLabelEl) {
    const isKazakh = document.documentElement.lang === 'kk';
    const prefix = isKazakh ? 'Келесі кезеңге дейін: ' : 'До следующего этапа: ';
    stageLabelEl.textContent = prefix + ns.step.label.split(' / ')[isKazakh?1:0];
  }
  // Move agent along timeline if present
  const agent = document.querySelector('.roadmap-agent');
  const items = Array.from(document.querySelectorAll('.timeline .t-item'));
  if (agent && items.length){
    const targetIndex = Math.max(0, ns.idx - 1);
    const anchorItem = items[Math.min(targetIndex, items.length-1)];
    const listTop = items[0].offsetTop;
    const itemTop = anchorItem.offsetTop;
    const relY = itemTop - listTop + 14; // align to dot center
    agent.style.top = relY + 'px';
    // Hide active dot when agent is on it (replace dot)
    items.forEach((it, idx) => {
      const dot = it;
      if (idx === Math.min(targetIndex, items.length-1)) {
        dot.style.setProperty('--hideDot','1');
        it.classList.add('active-stage');
      } else {
        dot.style.removeProperty('--hideDot');
        it.classList.remove('active-stage');
      }
    });
  }
}
tickRoadmap();
setInterval(tickRoadmap, 1000);

// Criteria accordion: open first by default
const firstDetails = document.querySelector('#criteria details');
if (firstDetails) firstDetails.setAttribute('open','');

// Animate on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
},{ threshold: .12 });
document.querySelectorAll('.section, .card, .t-item, details').forEach(el => {
  el.setAttribute('data-animate','');
  observer.observe(el);
});

// Background animated particles
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, raf;
  const particles = Array.from({length: 48}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-.5)*.0006, vy: (Math.random()-.5)*.0006,
    r: Math.random()*2+0.5
  }));
  function resize(){ w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(124,92,255,0.6)';
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>1) p.vx*=-1; if (p.y<0||p.y>1) p.vy*=-1;
      const px = p.x*w, py = p.y*h;
      ctx.beginPath(); ctx.arc(px,py,p.r,0,Math.PI*2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(35,214,209,0.25)';
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=(a.x-b.x)*w, dy=(a.y-b.y)*h;
        const dist=Math.hypot(dx,dy);
        if (dist<140){
          ctx.globalAlpha = 1 - dist/140;
          ctx.beginPath(); ctx.moveTo(a.x*w,a.y*h); ctx.lineTo(b.x*w,b.y*h); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    raf = requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize);
  resize();
  step();
}

// Registration removed: no-op

// Open external links in new tab
document.querySelectorAll('a[href^="http"]').forEach(a => {
  a.setAttribute('target','_blank');
  if (!a.getAttribute('rel')) a.setAttribute('rel','noopener');
});

// Modal: What is hackathon?
const whatBtn = document.getElementById('whatIsHackathon');
const dialog = document.getElementById('hackathonDialog');
if (whatBtn && dialog && dialog.showModal) {
  whatBtn.addEventListener('click', () => dialog.showModal());
}

// Default language redirect: open Kazakh version by default
try{
  const path = location.pathname;
  const href = location.href.toLowerCase();
  const isRootRU = /index\.html$/i.test(path) || path.endsWith('/') || path === '';
  const isAssignmentRU = /assignment-ru\.html$/i.test(path);
  const chosen = localStorage.getItem('langChosen');
  if (chosen !== 'ru'){
    if (isRootRU && document.documentElement.lang === 'ru') { location.replace('index-kz.html'); }
    if (isAssignmentRU && document.documentElement.lang === 'ru') { location.replace('assignment-kz.html'); }
  }
  document.querySelectorAll('a[href$="index-kz.html"],a[href$="assignment-kz.html"]').forEach(a=>{
    a.addEventListener('click',()=>localStorage.setItem('langChosen','kz'));
  });
  document.querySelectorAll('a[href$="index.html"],a[href$="assignment-ru.html"],a[aria-label="Русская версия"]').forEach(a=>{
    a.addEventListener('click',()=>localStorage.setItem('langChosen','ru'));
  });
}catch(e){}


