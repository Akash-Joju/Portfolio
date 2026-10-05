/* ============================================================
   SERVICES — 3D tilt + scroll reveal
   Cards settle into view with a staggered 3D reveal the first
   time the grid is scrolled into view. While in view, each card
   also tilts toward the pointer and tracks a glare spot, on a
   separate element so it never fights the entrance transition.
   The projected image's float + the pad's pulse rings are pure
   CSS and run regardless. Respects prefers-reduced-motion.
   ============================================================ */

(() => {
  const grid = document.getElementById('servicesCards');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.service-card'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- reveal, once -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      grid.classList.add('is-in');
      io.disconnect();
    });
  }, { threshold: 0.2 });

  io.observe(grid);

  /* -------- pointer tilt + glare, per card --------
     Skipped for touch / reduced motion. */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    cards.forEach((card) => {
      const tilt = card.querySelector('.service-card__tilt');
      if (!tilt) return;

      let raf = null;
      let targetX = 0, targetY = 0, curX = 0, curY = 0;

      function tick() {
        curX += (targetX - curX) * 0.15;
        curY += (targetY - curY) * 0.15;
        tilt.style.setProperty('--tilt-x', `${curX.toFixed(2)}deg`);
        tilt.style.setProperty('--tilt-y', `${curY.toFixed(2)}deg`);
        if (Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        targetX = (py - 0.5) * -10;
        targetY = (px - 0.5) * 12;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        if (!raf) raf = requestAnimationFrame(tick);
      });

      card.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }
})();
