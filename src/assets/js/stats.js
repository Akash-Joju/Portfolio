/* ============================================================
   RESULTS IN NUMBERS — count-up + 3D tilt
   Cards settle into view with a staggered 3D reveal the first
   time the grid is scrolled into view, at which point every
   counter animates from 0 up to its data-target. While in view,
   each card also tilts toward the pointer and tracks a glare
   spot, layered on a separate element so it never fights the
   entrance transition. Respects prefers-reduced-motion.
   ============================================================ */

(() => {
  const grid  = document.getElementById('statsCards');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.stat-card'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- count-up -------- */
  function animateCount(el, target) {
    if (prefersReducedMotion || target <= 0) {
      el.textContent = target;
      return;
    }
    const duration = 1500;
    let startTime = null;

    function step(ts) {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.floor(eased * target);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  /* -------- reveal + trigger, once -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      grid.classList.add('is-in');
      cards.forEach((card) => {
        const target = parseInt(card.dataset.target, 10) || 0;
        const countEl = card.querySelector('.stat-card__count');
        if (countEl) animateCount(countEl, target);
      });
      io.disconnect();
    });
  }, { threshold: 0.3 });

  io.observe(grid);

  /* -------- pointer tilt + glare, per card --------
     Skipped for touch / reduced motion — the idle float still
     reads as "alive" without it. */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    cards.forEach((card) => {
      const tilt = card.querySelector('.stat-card__tilt');
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
        targetX = (py - 0.5) * -12;
        targetY = (px - 0.5) * 14;
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
