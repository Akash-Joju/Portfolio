/* ============================================================
   REVEAL-HEAD — repeatable heading text animation
   Applies a staggered fade/rise-in to every ".reveal-head"
   block's direct children (eyebrow, title, sub, ...) each time
   it crosses into the viewport — scrolling down OR back up —
   unlike the one-shot card reveals used elsewhere on the page.
   Purely class-toggling; all motion lives in CSS. Respects
   prefers-reduced-motion by skipping the observer entirely and
   leaving content statically visible.
   ============================================================ */

(() => {
  const heads = Array.from(document.querySelectorAll('.reveal-head'));
  if (!heads.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    heads.forEach((head) => head.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-in', entry.isIntersecting);
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });

  heads.forEach((head) => io.observe(head));
})();
