/* ============================================================
   APPLY DRAWER — slide-in application form
   Opens from either "Apply now" trigger on the job-details page
   (hero link + sidebar CTA), reading the role title off the
   trigger's data-job-title (set by career-details.js). Same
   validated demo-submit pattern as newsletter.js / contact.js:
   no backend here, so a valid submit just swaps the form for a
   success state after a short "sending" delay.
   ============================================================ */

(() => {
  const drawer = document.getElementById('applyDrawer');
  if (!drawer) return;

  const backdrop = document.getElementById('applyDrawerBackdrop');
  const closeBtn = document.getElementById('applyDrawerClose');
  const doneBtn = document.getElementById('applyDone');
  const roleEl = document.getElementById('applyDrawerRole');
  const successRoleEl = document.getElementById('applySuccessRole');
  const triggers = [document.getElementById('jobApplyLink'), document.getElementById('jobApplyCta')]
    .filter(Boolean);

  let lastFocused = null;

  function openDrawer(title) {
    lastFocused = document.activeElement;

    const fallbackTitle = document.getElementById('jobTitle')?.textContent?.trim();
    const roleName = title || (fallbackTitle && fallbackTitle !== 'Loading role…' ? fallbackTitle : 'this role');
    if (roleEl) roleEl.textContent = roleName;
    if (successRoleEl) successRoleEl.textContent = roleName;

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('apply-drawer-open');

    window.setTimeout(() => {
      const firstField = document.getElementById('applyName');
      if (firstField) firstField.focus();
    }, 350);
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('apply-drawer-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer(trigger.dataset.jobTitle);
    });
  });

  const cancelBtn = document.getElementById('applyCancel');

  backdrop && backdrop.addEventListener('click', closeDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  cancelBtn && cancelBtn.addEventListener('click', closeDrawer);
  doneBtn && doneBtn.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* -------- simple focus trap while open -------- */
  drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
    const focusable = drawer.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* -------- résumé file label -------- */
  const resumeInput = document.getElementById('applyResume');
  const resumeText = document.getElementById('applyResumeText');
  const resumeLabel = document.getElementById('applyResumeLabel');
  const resumeError = document.getElementById('applyResumeError');

  resumeInput && resumeInput.addEventListener('change', () => {
    const file = resumeInput.files && resumeInput.files[0];
    if (file) {
      resumeText.textContent = file.name;
      resumeLabel.classList.add('is-filled');
      resumeError.classList.remove('is-visible');
    } else {
      resumeText.textContent = 'Upload PDF or DOC — max 8MB';
      resumeLabel.classList.remove('is-filled');
    }
  });

  /* -------- validated demo submit -------- */
  const form = document.getElementById('applyForm');
  const submitBtn = document.getElementById('applySubmit');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const nameInput = document.getElementById('applyName');
  const emailInput = document.getElementById('applyEmail');
  const noteInput = document.getElementById('applyNote');

  const fieldErrorPairs = [
    [nameInput, document.getElementById('applyNameError'), (v) => v.trim().length > 1],
    [emailInput, document.getElementById('applyEmailError'), (v) => emailPattern.test(v.trim())],
    [noteInput, document.getElementById('applyNoteError'), (v) => v.trim().length > 4],
  ];

  function clearErrorOnInput(input, errorEl, isValid) {
    input.addEventListener('input', () => {
      if (isValid(input.value)) errorEl.classList.remove('is-visible');
    });
  }
  fieldErrorPairs.forEach(([input, errorEl, isValid]) => clearErrorOnInput(input, errorEl, isValid));

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalid = null;
    fieldErrorPairs.forEach(([input, errorEl, isValid]) => {
      const valid = isValid(input.value);
      errorEl.classList.toggle('is-visible', !valid);
      if (!valid && !firstInvalid) firstInvalid = input;
    });

    const hasResume = resumeInput.files && resumeInput.files.length > 0;
    resumeError.classList.toggle('is-visible', !hasResume);
    if (!hasResume && !firstInvalid) firstInvalid = resumeInput;

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    window.setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      form.classList.add('is-submitted');
    }, 750);
  });

  /* reset the form for next time once the drawer's fully closed */
  drawer.addEventListener('transitionend', (e) => {
    if (e.target !== drawer.querySelector('.apply-drawer__panel')) return;
    if (drawer.classList.contains('is-open')) return;
    window.setTimeout(() => {
      form && form.reset();
      form && form.classList.remove('is-submitted');
      fieldErrorPairs.forEach(([, errorEl]) => errorEl.classList.remove('is-visible'));
      resumeError.classList.remove('is-visible');
      resumeText.textContent = 'Upload PDF or DOC — max 8MB';
      resumeLabel.classList.remove('is-filled');
      drawer.querySelector('.apply-drawer__scroll').scrollTop = 0;
    }, 50);
  });
})();
