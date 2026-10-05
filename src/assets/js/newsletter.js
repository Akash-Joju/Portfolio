/* ============================================================
   NEWSLETTER — 3D panel tilt + validated demo submit
   The card settles into view once on scroll, then tilts toward
   the cursor while hovered (paired with the CSS orbit rig that
   spins constantly behind it). On submit, does a light client
   side email check and swaps the form for a success state —
   there's no backend here, this is a front-end demo only.
   Respects prefers-reduced-motion.
   ============================================================ */

(() => {
  const card = document.getElementById('newsletterCard');
  if (!card) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- reveal, once -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      card.classList.add('is-in');
      io.disconnect();
    });
  }, { threshold: 0.2 });

  io.observe(card);

  /* -------- pointer tilt -------- */
  const tilt = document.getElementById('newsletterTilt');
  if (tilt && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    let raf = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    function tick() {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
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
      targetX = (py - 0.5) * -6;
      targetY = (px - 0.5) * 8;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      if (!raf) raf = requestAnimationFrame(tick);
    });

    card.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* -------- demo submit -------- */
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('nlEmail');
  const emailError = document.getElementById('nlEmailError');
  const humanCheck = document.getElementById('nlHuman');
  const submitBtn = document.getElementById('newsletterSubmit');
  if (!form) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValid = emailPattern.test(emailInput.value.trim());
    form.classList.toggle('has-error', !emailValid);
    if (emailError) emailError.classList.toggle('is-visible', !emailValid);
    if (!emailValid) {
      emailInput.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    window.setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      form.classList.add('is-submitted');
    }, 700);
  });

  emailInput.addEventListener('input', () => {
    if (form.classList.contains('has-error') && emailPattern.test(emailInput.value.trim())) {
      form.classList.remove('has-error');
      if (emailError) emailError.classList.remove('is-visible');
    }
  });
})();
