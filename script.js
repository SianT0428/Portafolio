// Marquesina: duplica los clips para lograr un loop infinito sin cortes
const track = document.getElementById('marqueeTrack');
if(track){
  track.innerHTML += track.innerHTML;
}

// Header: background on scroll + hide when scrolling down, show when scrolling up
const header = document.getElementById('siteHeader');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);

  if(y > lastY && y > 120){
    header.classList.add('hide-nav');   // scrolling down -> hide
  }else{
    header.classList.remove('hide-nav'); // scrolling up -> show
  }
  lastY = y;
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
// RENDIMIENTO: solo reproduce los videos de fondo (hero flotante +
// marquesina) cuando están realmente visibles en pantalla. Esto evita
// que 20-30 videos intenten decodificarse a la vez y hagan lenta la web.
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