/* ============================================================
   BLOGS LISTING — tag filter chips
   Toggles .is-filtered-out on cards that don't match the active
   chip's data-filter, compared against each card's data-tag.
   Purely additive to blogs.js, which still owns the tilt/reveal
   behaviour for whichever cards remain visible.
   ============================================================ */

(() => {
  const filterBar = document.getElementById('blogsFilters');
  const grid = document.getElementById('blogsCards');
  if (!filterBar || !grid) return;

  const chips = Array.from(filterBar.querySelectorAll('.blogs-filters__chip'));
  const cards = Array.from(grid.querySelectorAll('.blog-card'));

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.blogs-filters__chip');
    if (!chip) return;

    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.tag === filter;
      card.classList.toggle('is-filtered-out', !match);
    });
  });
})();
