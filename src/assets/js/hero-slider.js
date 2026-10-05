/* ============================================================
   HERO SLIDER
   The background stays fixed — only the copy (eyebrow, headline,
   subcopy) rotates through 3 messages, each re-triggering the
   staggered fade/rise/blur-focus entrance on #heroContent.
   Autoplays, pauses on hover/focus, and is fully controllable
   via the dot rail. Respects prefers-reduced-motion by turning
   autoplay off.
   ============================================================ */
(function(){
  var dots       = document.querySelectorAll('#heroDots .hero__dot');
  var content    = document.getElementById('heroContent');
  var eyebrowTxt = document.getElementById('heroEyebrowTxt');
  var headline   = document.getElementById('heroHeadline');
  var subcopy    = document.getElementById('heroSubcopy');
  var hero       = document.getElementById('hero');

  if(!hero || !content) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var slides = [
    {
      eyebrow: 'BUSINESS TRANSFORMATION',
      headline: 'Built to promote your <span class="headline__accent">business.</span>',
      subcopy: 'Our focus is to map the technologies to solve the business transformation offering services.'
    },
    {
      eyebrow: 'CUSTOMER FIRST',
      headline: 'The best solution for your <span class="headline__accent">business.</span>',
      subcopy: 'Our top priority is our customer happiness.'
    },
    {
      eyebrow: 'BUILT FOR INNOVATORS',
      headline: 'We create technology for <span class="headline__accent">innovators.</span>',
      subcopy: 'We drive product and service innovation to improve technical performance and accelerate market speed.'
    }
  ];

  var current = 0;
  var timer = null;
  var AUTOPLAY_MS = 6000;

  function applySlide(i){
    var s = slides[i];

    eyebrowTxt.textContent = s.eyebrow;
    headline.innerHTML = s.headline;
    subcopy.textContent = s.subcopy;

    // retrigger the staggered fade/rise/blur-focus entrance
    content.classList.remove('is-in');
    // eslint-disable-next-line no-unused-expressions
    void content.offsetWidth; // force reflow so the class removal registers
    content.classList.add('is-in');

    // replay the hologram materialize sequence on the 3D portal
    if (typeof window.__replayHologram === 'function'){
      window.__replayHologram();
    }

    dots.forEach(function(dot, idx){
      var active = idx === i;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    current = i;
  }

  function next(){ applySlide((current + 1) % slides.length); }

  function startAutoplay(){
    if(reduceMotion) return;
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  dots.forEach(function(dot){
    dot.addEventListener('click', function(){
      var i = parseInt(dot.getAttribute('data-slide'), 10);
      if(i === current) return;
      applySlide(i);
      startAutoplay();
    });
  });

  hero.addEventListener('mouseenter', stopAutoplay);
  hero.addEventListener('mouseleave', startAutoplay);
  hero.addEventListener('focusin', stopAutoplay);
  hero.addEventListener('focusout', startAutoplay);

  // initial paint
  applySlide(0);
  startAutoplay();
})();
