// Marquesina: duplica los clips para lograr un loop infinito sin cortes
const track = document.getElementById('marqueeTrack');
if(track){
  track.innerHTML += track.innerHTML;
}

// ---------------------------------------------------------------
// SCROLL: un solo listener (pasivo) para header + texto del hero,
// con el trabajo real hecho dentro de requestAnimationFrame para no
// disparar cálculos de layout en cada evento de scroll (más fluido).
// ---------------------------------------------------------------
const header = document.getElementById('siteHeader');
const heroCopy = document.getElementById('heroCopy');
let lastY = window.scrollY;
let scrollTicking = false;

function handleScroll(){
  const y = window.scrollY;
  const goingDown = y > lastY;

  header.classList.toggle('scrolled', y > 40);
  if(goingDown && y > 120){
    header.classList.add('hide-nav');   // scrolling down -> ocultar header
  }else{
    header.classList.remove('hide-nav'); // scrolling up -> mostrar header
  }

  // Texto inicial del hero: se oculta al bajar, reaparece al subir
  if(heroCopy){
    if(goingDown && y > 80){
      heroCopy.classList.add('hc-hidden');
    }else{
      heroCopy.classList.remove('hc-hidden');
    }
  }

  lastY = y;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if(!scrollTicking){
    requestAnimationFrame(handleScroll);
    scrollTicking = true;
  }
}, { passive:true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---------------------------------------------------------------
// EFECTO "MÁQUINA DE ESCRIBIR" SUAVE para el eyebrow y el título del hero.
// Envuelve cada letra en un <span class="tw-c"> con su propio delay de
// animación (definido en styles.css), simulando un tipeo progresivo.
// Si por algún motivo JS no corre, el texto queda intacto y visible
// (no depende de esto para mostrarse).
// ---------------------------------------------------------------
function typewriterize(el, charDelayMs, startDelayMs){
  if(!el) return startDelayMs;
  let i = 0;

  function wrapNode(node){
    if(node.nodeType === Node.TEXT_NODE){
      const frag = document.createDocumentFragment();
      for(const ch of node.textContent){
        const span = document.createElement('span');
        span.className = 'tw-c';
        span.textContent = ch;
        span.style.animationDelay = `${startDelayMs + i * charDelayMs}ms`;
        frag.appendChild(span);
        if(ch !== ' ') i++;
      }
      node.replaceWith(frag);
    }else if(node.nodeType === Node.ELEMENT_NODE){
      [...node.childNodes].forEach(wrapNode);
    }
  }

  [...el.childNodes].forEach(wrapNode);
  return startDelayMs + i * charDelayMs;
}

const eyebrowEl = document.querySelector('#heroCopy .eyebrow');
const wordmarkEl = document.querySelector('#heroCopy h1.wordmark');
const heroSubEl = document.querySelector('#heroCopy .hero-sub');
const heroCtasEl = document.querySelector('#heroCopy .hero-ctas');
const scrollCueEl = document.querySelector('#heroCopy .scroll-cue');

if(eyebrowEl && wordmarkEl){
  const afterEyebrow = typewriterize(eyebrowEl, 14, 150);
  const afterWordmark = typewriterize(wordmarkEl, 55, afterEyebrow + 150);
  const revealDelay = afterWordmark + 250;

  if(heroSubEl)  heroSubEl.style.animationDelay  = `${revealDelay}ms`;
  if(heroCtasEl) heroCtasEl.style.animationDelay = `${revealDelay + 180}ms`;
  if(scrollCueEl) scrollCueEl.style.animationDelay = `${revealDelay + 340}ms`;
}

// ---------------------------------------------------------------
// RENDIMIENTO: solo reproduce los videos de fondo (hero flotante +
// marquesina) cuando están realmente visibles en pantalla. Esto evita
// que 20-30 videos intenten decodificarse a la vez y hagan lenta la web.
// Como además ya no tienen "autoplay" en el HTML (ver index.html), el
// navegador tampoco intenta cargarlos de entrada: solo se cargan y
// reproducen cuando este observer los detecta en pantalla.
// ---------------------------------------------------------------
const bgVideos = document.querySelectorAll('.hero-float video, .clip-pill video, #trabajos .card video.preview');
const playObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const vid = entry.target;
    if(entry.isIntersecting){
      vid.play().catch(() => {});
    }else{
      vid.pause();
    }
  });
}, { threshold: 0.15 });
bgVideos.forEach(v => playObserver.observe(v));

// ---------------------------------------------------------------
// MODAL DE "MIS TRABAJOS": reproduce el video de YouTube correspondiente,
// con sonido y controles, dentro de la misma página (sin salir a youtube.com).
// ---------------------------------------------------------------
const videoModal = document.getElementById('videoModal');
const videoModalInner = document.getElementById('videoModalInner');
const modalPlayer = document.getElementById('modalPlayer');
const modalClose = document.getElementById('modalClose');

function openVideoModal(youtubeId, orientation){
  if(!youtubeId) return;
  videoModalInner.classList.toggle('is-vertical', orientation === 'v');

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`;
  modalPlayer.innerHTML = `<iframe src="${src}" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;

  videoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal(){
  videoModal.classList.remove('open');
  document.body.style.overflow = '';
  modalPlayer.innerHTML = ''; // quitar el iframe detiene la reproducción
}

document.querySelectorAll('#trabajos .card[data-yt]').forEach(card => {
  card.addEventListener('click', () => {
    openVideoModal(card.dataset.yt, card.dataset.orientation);
  });
});

modalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => {
  if(e.target === videoModal) closeVideoModal(); // click fuera del video cierra
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeVideoModal();
});
