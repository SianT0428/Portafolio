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
// IDIOMA (ES / EN) y MONEDA (USD / COP)
// El español está en el HTML; aquí solo va el inglés.
// Enlace directo en inglés: ?lang=en  ·  en COP: ?cur=cop
// ---------------------------------------------------------------
const EN = {
  nav_work:'Work', nav_prices:'Pricing', nav_about:'About', nav_contact:'Contact', nav_cta:"Let's talk",
  pill_editor:'Video editor', pill_director:'Creative director',
  hero_sub:'High-retention editing for <b>YouTubers</b>, <b>Streamers</b> and <b>Vertical Video</b> (TikTok / Reels / Shorts).',
  cta_work:'See my work', cta_prices:'See pricing',
  h_tech:'Techniques & Tools', h_work:'My Work', work_sub:'A selection of recent projects in horizontal and vertical formats.',
  fmt_h:'Horizontal — YouTube / Streaming', fmt_v:'Vertical — TikTok / Instagram / Shorts',
  tag_feat:'Featured', k_vlog:'Vlog / event', t_bts:'I went to the first BTS concert in Colombia',
  k_tutorial:'Tutorial', k_stream:'Stream / Gaming', k_science:'Science explainer · 012-s', t_universe:'How will the universe end?',
  k_viral:'Viral clip', k_brand:'Brand reel', k_streamer:'Streamer short', ig_see:'View on Instagram ↗',
  h_prices:'Pricing', prices_sub:'Three editing levels. Price per video; the exact quote depends on your footage and references.',
  tier1:'Basic Edit', tier2:'Dynamic Edit', from:'from',
  tier1_list:'<li>Cuts and pacing</li><li>Music and audio mix</li><li>Voice cleanup</li><li>Simple captions</li><li>Upload-ready export</li>',
  tier2_list:'<li>Everything in Basic</li><li>Memes, zooms and energy</li><li>Animated text</li><li>Effects and transitions</li><li>Sound design (SFX on beat)</li>',
  tier3_list:'<li>Everything in Dynamic</li><li>2D animation in After Effects</li><li>Custom titles and graphics</li><li>Camera tracking and parallax</li><li>Product animation</li>',
  th_service:'Service', r_yt:'YouTube video', r_yt_d:'up to 10 min', r_vlog:'Vlog / event', r_vlog_d:'up to 10 min · includes reviewing 2 h of footage',
  r_vert:'Long vertical video', r_vert_d:'up to 5 min · vlogs, tutorials', r_short_d:'up to 90 s', r_trailer:'Trailer / teaser',
  price_note:'Extra minute: +$3 / +$5 / +$8 USD by level. Bundles: weekly (2+ videos) −10% · monthly (8+ videos) −20%. Rush delivery: 48 h +30% · 24 h +50%.',
  h_extras:'Add-ons', x_thumb:'YouTube thumbnail', x_subs:'Full captions (long videos)', x_vert:'Vertical version of a horizontal video',
  x_rev:'Extra revision round', x_raw:'Extra hour of raw footage',
  h_process:'How I work',
  steps:'<li><b>Brief</b> Send me your footage, what you want and 1–2 references. I send a quote (valid 15 days).</li>'+
        '<li><b>Deposit</b> 50% to start; timelines run from there (business days, Mon–Sat).</li>'+
        '<li><b>First cut</b> Short or reel: 1–2 days. Basic long-form: 3 days. Dynamic: 5–7 days.</li>'+
        '<li><b>Revisions</b> 2 rounds included: send all changes in one message, with timestamps.</li>'+
        '<li><b>Delivery</b> MP4 via Drive or WeTransfer once the remaining 50% is paid. Licensed music and SFX.</li>',
  pay_note:'Payments in USD via PayPal or Binance (clients in Colombia: COP via Nequi or Nu).',
  cta_quote:'Get a quote',
  about_lead:"A good video isn't just about looking good: <b>it's about keeping people watching until the end</b>.",
  about_body:"I'm <b>Santiago (SianT)</b>. I combine pacing, visual storytelling and sound design to take content from <b>creators</b> and <b>brands</b> to the next level, in long-form and on <b>TikTok and Instagram</b>.",
  st_videos:'Videos edited', st_rev:'Revision rounds included in every video', st_resp:'Average response time',
  eyebrow:'Available for projects', contact_h:'Let’s make your next video <br>impossible to ignore.',
  contact_lead:'Email me or DM me on Instagram or X: what kind of video it is, how much footage you have and when you need it. I reply within 24 h.',
  k_mail:'Email', footer:'© 2026 Sian T. All rights reserved.'
};
const MAIL_SUBJECT = { es:'Proyecto de video', en:'Video editing project' };
const i18nEls = [...document.querySelectorAll('[data-i18n]')];
i18nEls.forEach(el => { el.dataset.es = el.innerHTML; });
const langBtn = document.getElementById('langBtn');
let lang = 'es';

function applyLang(next){
  lang = next;
  root.lang = next;
  i18nEls.forEach(el => {
    const key = el.dataset.i18n;
    el.innerHTML = next === 'en' && EN[key] ? EN[key] : el.dataset.es;
    if(el.hasAttribute('data-tw')) el.setAttribute('aria-label', el.textContent.trim());
  });
  document.querySelectorAll('.mail-cta').forEach(a => {
    a.href = `mailto:contact.scastaneda@gmail.com?subject=${encodeURIComponent(MAIL_SUBJECT[next])}`;
  });
  if(langBtn){
    langBtn.textContent = next === 'en' ? 'ES' : 'EN';
    langBtn.setAttribute('aria-label', next === 'en' ? 'Ver en español' : 'Switch to English');
  }
  const mt = document.getElementById('marqueeToggle');
  if(mt){
    const paused = mt.getAttribute('aria-pressed') === 'true';
    mt.textContent = next === 'en' ? (paused ? 'Resume clips' : 'Pause clips') : (paused ? 'Reanudar clips' : 'Pausar clips');
  }
  try{ localStorage.setItem('lang', next); }catch(e){}
}

const COP = new Intl.NumberFormat('es-CO');
function applyCur(cur){
  document.querySelectorAll('.price').forEach(el => {
    el.textContent = cur === 'cop' ? `$${COP.format(+el.dataset.cop)} COP` : `$${el.dataset.usd} USD`;
  });
  document.querySelectorAll('[data-cur]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cur === cur)));
}

(function initLangCur(){
  const q = new URLSearchParams(location.search);
  let saved = null;
  try{ saved = localStorage.getItem('lang'); }catch(e){}
  const nav = (navigator.language || 'es').toLowerCase();
  const startLang = ['en','es'].includes(q.get('lang')) ? q.get('lang') : (saved || (nav.startsWith('es') ? 'es' : 'en'));
  if(startLang !== 'es') applyLang(startLang);
  else document.querySelectorAll('.mail-cta').forEach(a => a.href = `mailto:contact.scastaneda@gmail.com?subject=${encodeURIComponent(MAIL_SUBJECT.es)}`);
  const startCur = ['usd','cop'].includes(q.get('cur')) ? q.get('cur') : (nav === 'es-co' && startLang === 'es' ? 'cop' : 'usd');
  applyCur(startCur);
  langBtn?.addEventListener('click', () => applyLang(lang === 'en' ? 'es' : 'en'));
  document.querySelectorAll('[data-cur]').forEach(b => b.addEventListener('click', () => applyCur(b.dataset.cur)));
})();

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
    toggle.textContent = lang === 'en' ? (paused ? 'Resume clips' : 'Pause clips') : (paused ? 'Reanudar clips' : 'Pausar clips');
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
