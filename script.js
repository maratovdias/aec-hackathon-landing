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

// Countdown to registration deadline
const deadlineEl = document.getElementById('deadline-date');
const cdEls = {
  days: document.getElementById('cd-days'),
  hours: document.getElementById('cd-hours'),
  mins: document.getElementById('cd-mins'),
  secs: document.getElementById('cd-secs')
};
const deadlineStr = deadlineEl ? deadlineEl.textContent : '16.10.2025';
function parseDateRu(ddmmyyyy){
  const [dd, mm, yyyy] = ddmmyyyy.split('.').map(Number);
  return new Date(yyyy, mm - 1, dd, 23, 59, 59);
}
const deadline = parseDateRu(deadlineStr || '16.10.2025');
function pad(n){ return String(n).padStart(2,'0'); }
function tick(){
  const now = new Date();
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (cdEls.days) cdEls.days.textContent = pad(d);
  if (cdEls.hours) cdEls.hours.textContent = pad(h);
  if (cdEls.mins) cdEls.mins.textContent = pad(m);
  if (cdEls.secs) cdEls.secs.textContent = pad(s);
}
tick();
setInterval(tick, 1000);

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

// Registration link wiring
const registerLink = document.getElementById('registerLink');
const registerBtn = document.getElementById('registerBtn');
const cfg = (window.HACKATHON_CONFIG||{});
if (registerLink && cfg.registrationUrl) registerLink.href = cfg.registrationUrl;
if (registerBtn && cfg.registrationUrl && cfg.registrationUrl !== '#') registerBtn.href = cfg.registrationUrl;

// Modal: What is hackathon?
const whatBtn = document.getElementById('whatIsHackathon');
const dialog = document.getElementById('hackathonDialog');
if (whatBtn && dialog && dialog.showModal) {
  whatBtn.addEventListener('click', () => dialog.showModal());
}


