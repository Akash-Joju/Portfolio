/* ============================================================
   CONTACT PAGE
   - Fades the hero copy panel in on load (mirrors hero__anim).
   - Reveals the form card once on scroll, then tilts it toward
     the cursor while hovered — same mechanics as the newsletter
     card on the home page.
   - Runs a light client-side validation + demo "submit" that
     swaps the form for a success state. No backend here.
   ============================================================ */
(() => {
  const panel = document.getElementById('contactPanel');
  if (panel) requestAnimationFrame(() => panel.classList.add('is-in'));

  const card = document.getElementById('contactCard');
  if (!card) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- reveal, once -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      card.classList.add('is-in');
      io.disconnect();
    });
  }, { threshold: 0.15 });
  io.observe(card);

  /* -------- pointer tilt -------- */
  const tilt = document.getElementById('contactTilt');
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
      targetX = (py - 0.5) * -5;
      targetY = (px - 0.5) * 7;
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
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('cName');
  const emailInput = document.getElementById('cEmail');
  const emailError = document.getElementById('cEmailError');
  const messageInput = document.getElementById('cMessage');
  const humanCheck = document.getElementById('cHuman');
  const submitBtn = document.getElementById('contactSubmit');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const nameValid = nameInput.value.trim().length > 0;
    const emailValid = emailPattern.test(emailInput.value.trim());
    const messageValid = messageInput.value.trim().length > 0;
    return nameValid && emailValid && messageValid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailValid = emailPattern.test(emailInput.value.trim());
    form.classList.toggle('has-error', !emailValid);
    if (emailError) emailError.classList.toggle('is-visible', !emailValid);

    if (!validate()) {
      if (!emailValid) { emailInput.focus(); }
      else if (!nameInput.value.trim()) { nameInput.focus(); }
      else { messageInput.focus(); }
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
