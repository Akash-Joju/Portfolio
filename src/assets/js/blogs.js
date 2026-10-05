/* ============================================================
   BLOGS — 3D tilt + scroll reveal
   Same behaviour as the services grid: cards settle into view
   with a staggered 3D reveal the first time the rail is
   scrolled into view, and tilt toward the cursor with a glare
   spot while hovered. Respects prefers-reduced-motion.
   ============================================================ */

(() => {
  const grid = document.getElementById('blogsCards');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.blog-card'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- reveal, once -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      grid.classList.add('is-in');
      io.disconnect();
    });
  }, { threshold: 0.15 });

  io.observe(grid);

  /* -------- pointer tilt + glare, per card --------
     Skipped for touch / reduced motion. */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    cards.forEach((card) => {
      const tilt = card.querySelector('.blog-card__tilt');
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
        targetX = (py - 0.5) * -8;
        targetY = (px - 0.5) * 10;
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
