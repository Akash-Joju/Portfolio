/* ============================================================
   ORBIT CONSOLE — scroll reveal + tap-to-open checkpoints
   Adds .is-in to the stage once it enters the viewport, which
   staggers every checkpoint in (see .orbit__node using --i) and
   fades in the hub/spokes/rings behind them. One-shot, same
   IntersectionObserver pattern used for the services/career card
   grids. On top of the CSS :hover/:focus-within reveal, each
   checkpoint's dot is also click/tap-toggleable — closing any
   other open card first, and closing again on an outside click —
   so the radial console works without a mouse. Respects
   prefers-reduced-motion.
   ============================================================ */

(() => {
  const stage = document.getElementById('orbitStage');
  if (!stage) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    stage.classList.add('is-in');
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        stage.classList.add('is-in');
        io.disconnect();
      });
    }, { threshold: 0.15 });
    io.observe(stage);
  }

  const nodes = Array.from(stage.querySelectorAll('.orbit__node'));
  const hint = document.getElementById('orbitHint');

  function dismissHint() {
    if (hint) hint.classList.add('is-hidden');
  }

  function closeAll() {
    nodes.forEach((n) => {
      n.classList.remove('is-open');
      const b = n.querySelector('.orbit__dot');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  nodes.forEach((node) => {
    const dot = node.querySelector('.orbit__dot');
    if (!dot) return;
    dot.setAttribute('aria-expanded', 'false');

    dot.addEventListener('click', () => {
      dismissHint();
      const isOpen = node.classList.contains('is-open');
      closeAll();
      if (!isOpen) {
        node.classList.add('is-open');
        dot.setAttribute('aria-expanded', 'true');
      }
    });

    node.addEventListener('mouseenter', dismissHint);
    node.addEventListener('focusin', dismissHint);
  });

  document.addEventListener('click', (e) => {
    if (stage.contains(e.target)) return;
    closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();
