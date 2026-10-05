/* ============================================================
   NAV BEHAVIOR
   - Adds a blurred/bordered background once the page scrolls
     so the bar stays legible over any content.
   - Toggles the full-screen mobile menu, locking body scroll
     while it's open and closing on link click, backdrop tap,
     or Escape.
   ============================================================ */
(function(){
  var nav      = document.getElementById('siteNav');
  var toggle   = document.getElementById('navToggle');
  var mobile   = document.getElementById('navMobile');

  function onScroll(){
    if(window.scrollY > 8){ nav.classList.add('is-scrolled'); }
    else{ nav.classList.remove('is-scrolled'); }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function openMenu(){
    mobile.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    mobile.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function(){
    var isOpen = mobile.classList.contains('is-open');
    if(isOpen){ closeMenu(); } else { openMenu(); }
  });

  mobile.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeMenu(); }
  });
})();
