const root = document.documentElement;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;

// ---------------------------------------------------------------
// INTRO CRT — se muestra una vez por sesión del navegador (sessionStorage):
// al recargar o volver en la misma pestaña no se repite; en una visita nueva sí.
// No se muestra con movimiento reducido ni al entrar con un enlace a una sección.
// El CSS la termina sola a los ~1,9 s; aquí solo se puede saltar antes.
// ---------------------------------------------------------------
if(root.classList.contains('crt-play')){
  try{ sessionStorage.setItem('crt-visto', '1'); }catch(e){}
  const skipBtn = document.getElementById('crtSkip');
  const endIntro = () => {
    root.classList.add('crt-done');
    skipBtn.blur();
    document.removeEventListener('keydown', onKey);
    clearTimeout(timer);
  };
  const onKey = (e) => {
    if(!['Escape', 'Enter', ' '].includes(e.key)) return;
    if(e.key === ' ') e.preventDefault();
    endIntro();
  };
  const timer = setTimeout(endIntro, 1950);
  skipBtn.addEventListener('click', endIntro);
  document.getElementById('crtIntro').addEventListener('pointerdown', endIntro);
  document.addEventListener('keydown', onKey);
}

// ---------------------------------------------------------------
// MARQUESINA: duplica los clips (cloneNode, no innerHTML) para el loop infinito.
// Con movimiento reducido no se anima, así que no hace falta duplicar.
// ---------------------------------------------------------------
const track = document.getElementById('marqueeTrack');
if(track && !prefersReducedMotion){
  const fragment = document.createDocumentFragment();
  [...track.children].forEach(clip => {
    const copy = clip.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    fragment.appendChild(copy);
  });
  track.appendChild(fragment);

  const toggle = document.getElementById('marqueeToggle');
  toggle.addEventListener('click', () => {
    const paused = track.classList.toggle('paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Reanudar clips' : 'Pausar clips';
  });
}

// ---------------------------------------------------------------
// HEADER: se oculta al bajar y vuelve al subir (un listener pasivo + rAF).
// ---------------------------------------------------------------
const header = document.getElementById('siteHeader');
let lastY = scrollY;
let scrollTicking = false;
function handleScroll(){
  const y = scrollY;
  header.classList.toggle('scrolled', y > 40);
  header.classList.toggle('hide-nav', y > lastY && y > 120 && !navLinks.classList.contains('open'));
  lastY = y;
  scrollTicking = false;
}
addEventListener('scroll', () => {
  if(!scrollTicking){ requestAnimationFrame(handleScroll); scrollTicking = true; }
}, { passive:true });

// ---------------------------------------------------------------
// MENÚ MÓVIL (botón real con aria-expanded)
// ---------------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function setMenu(open){
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// ---------------------------------------------------------------
// APARICIÓN AL HACER SCROLL + "máquina de escribir" en los textos [data-tw]
// ---------------------------------------------------------------
function typewriterChars(el, charDelayMs, startDelayMs){
  if(prefersReducedMotion) return;
  el.setAttribute('aria-label', el.textContent.trim());
  let i = 0;
  (function wrap(node){
    if(node.nodeType === Node.TEXT_NODE){
      const frag = document.createDocumentFragment();
      // Cada palabra va en un span que no se parte; las letras se animan dentro.
      node.textContent.split(/(\s+)/).forEach(part => {
        if(!part) return;
        if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'tw-w';
        word.setAttribute('aria-hidden', 'true');
        for(const ch of part){
          const span = document.createElement('span');
          span.className = 'tw-c';
          span.textContent = ch;
          span.style.animationDelay = `${startDelayMs + i++ * charDelayMs}ms`;
          word.appendChild(span);
        }
        frag.appendChild(word);
      });
      node.replaceWith(frag);
    }else{
      [...node.childNodes].forEach(wrap);
    }
  })(el);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const targets = [e.target, ...e.target.querySelectorAll('[data-tw]')].filter(el => el.matches('[data-tw]'));
    targets.forEach(el => typewriterChars(el, 16, 60));
    e.target.classList.add('in');
    revealObserver.unobserve(e.target);
  });
}, { threshold:0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------------------------------------------------------------
// VIDEOS SIN SONIDO (marquesina y vistas previas): preload="none" en el HTML;
// solo se cargan y reproducen cuando están cerca de la pantalla.
// Las vistas previas de los trabajos destacados se reproducen siempre;
// el resto se omite con ahorro de datos. Con movimiento reducido, nada (se ve la portada).
// ---------------------------------------------------------------
if(!prefersReducedMotion){
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target:vid, isIntersecting }) => {
      if(isIntersecting) vid.play().catch(() => {});
      else vid.pause();
    });
  }, { threshold:0, rootMargin:'80px 200px' });

  const sel = saveData ? '#trabajos .card.featured video.preview' : '.clip-pill video, #trabajos .card video.preview';
  document.querySelectorAll(sel).forEach(v => {
    v.addEventListener('playing', () => v.closest('.card')?.classList.add('is-playing'), { once:true });
    playObserver.observe(v);
  });

  // Clip de fondo del televisor: se pide después de cargar la página y solo en pantallas medianas o grandes.
  const heroVideo = document.getElementById('heroVideo');
  if(heroVideo && !saveData && matchMedia('(min-width: 700px)').matches){
    addEventListener('load', () => {
      heroVideo.src = heroVideo.dataset.src;
      heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-on'), { once:true });
      playObserver.observe(heroVideo);
    }, { once:true });
  }
}

// ---------------------------------------------------------------
// MODAL: el reproductor (YouTube o Instagram) solo se crea al hacer clic.
// ---------------------------------------------------------------
const videoModal = document.getElementById('videoModal');
const videoModalInner = document.getElementById('videoModalInner');
const modalPlayer = document.getElementById('modalPlayer');
const modalClose = document.getElementById('modalClose');
const modalOut = document.getElementById('modalOut');
const outside = [...document.body.children].filter(el => el.id !== 'videoModal' && el.tagName !== 'SCRIPT');
let lastTrigger = null;

function openVideoModal(card, trigger){
  const { yt, ig, start, orientation } = card.dataset;
  let src, title;
  if(yt){
    const params = new URLSearchParams({ autoplay:'1', rel:'0', playsinline:'1' });
    if(start) params.set('start', start);
    src = `https://www.youtube-nocookie.com/embed/${yt}?${params}`;
    title = (card.querySelector('.card-title') || card.querySelector('.card-kind'))?.textContent || 'Video';
  }else if(ig){
    src = `https://www.instagram.com/reel/${ig}/embed/`;
    title = 'Reel de Instagram';
  }else return;

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  modalPlayer.replaceChildren(iframe);

  modalOut.hidden = !ig;
  if(ig) modalOut.href = `https://www.instagram.com/reel/${ig}/`;
  videoModalInner.classList.toggle('is-vertical', orientation === 'v');

  lastTrigger = trigger;
  outside.forEach(el => el.inert = true);
  videoModal.hidden = false;
  requestAnimationFrame(() => videoModal.classList.add('open'));
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeVideoModal(){
  if(videoModal.hidden) return;
  videoModal.classList.remove('open');
  videoModal.hidden = true;
  modalPlayer.replaceChildren(); // quitar el iframe detiene la reproducción
  outside.forEach(el => el.inert = false);
  document.body.style.overflow = '';
  lastTrigger?.focus();
}

document.querySelectorAll('#trabajos .card').forEach(card => {
  card.querySelector('.card-hit')?.addEventListener('click', (e) => openVideoModal(card, e.currentTarget));
});
modalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => { if(e.target === videoModal) closeVideoModal(); });
document.addEventListener('keydown', (e) => {
  if(e.key !== 'Escape') return;
  closeVideoModal();
  if(navLinks.classList.contains('open')){ setMenu(false); navToggle.focus(); }
});
