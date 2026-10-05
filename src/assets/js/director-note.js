/* ============================================================
   DIRECTOR'S NOTE — live-typed code editor
   Types the director's message out line by line as plain text,
   then flips each line over to its syntax-highlighted markup
   once it lands — same "materialize, then settle" idea as the
   hero's hologram build-up, just done in DOM text instead of
   WebGL. Runs once, the first time the section scrolls into
   view, and respects prefers-reduced-motion throughout.
   ============================================================ */

const stage      = document.getElementById('noteStage');
const editor     = document.getElementById('editor');
const body       = document.getElementById('editorBody');
const signoff    = document.getElementById('noteSignoff');
const statusLn   = document.getElementById('editorStatusLn');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------- source content --------
   Each row is typed as plain text, then swapped for `html`
   (its syntax-highlighted version) once fully typed. Blank
   rows and the two real JS lines at the end render instantly
   as code rather than comment. */
const LINES = [
  { text: '/**' },
  { text: " * Director's Note", html: ' * <span class="tok-title">Director&rsquo;s Note</span>' },
  { text: ' * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500' },
  { text: ' *' },
  { text: ' * We, XERXES Limited, are building a', html: ' * We, <span class="tok-accent">XERXES Limited</span>, are building a' },
  { text: ' * reliable and diverse environment in' },
  { text: ' * the technology industry \u2014 to deliver' },
  { text: ' * and manage exceptional service.' },
  { text: ' *' },
  { text: ' * As a professional web development,' },
  { text: ' * mobile application, AI, brand' },
  { text: ' * development, and digital marketing' },
  { text: ' * company, our mission is to provide' },
  { text: ' * customer-centric, result-oriented,' },
  { text: ' * cost-competitive & functional IT' },
  { text: ' * solutions to our valuable global' },
  { text: ' * clients.' },
  { text: ' *' },
  { text: ' * We value integrity, commitment,' },
  { text: ' * excellence, teamwork, transparency,' },
  { text: ' * and satisfaction \u2014 for our clients' },
  { text: ' * and ourselves.' },
  { text: ' *' },
  { text: ' * Try us and love us. Our top priority', html: ' * <span class="tok-accent">Try us and love us.</span> Our top priority' },
  { text: ' * is our customer happiness.' },
  { text: ' *' },
  { text: ' * We create technology for innovators!!', html: ' * We create technology for <span class="tok-strong">innovators!!</span>' },
  { text: ' */' },
  { text: '', blank: true },
  {
    text: 'const signedBy = "Aarvin M Sasidharan";',
    html: '<span class="tok-kw">const</span> <span class="tok-var">signedBy</span> <span class="tok-punc">=</span> <span class="tok-str">"Aarvin M Sasidharan"</span><span class="tok-punc">;</span>',
    code: true
  },
  {
    text: 'export default signedBy; // Director, XERXES Limited',
    html: '<span class="tok-kw">export default</span> <span class="tok-var">signedBy</span><span class="tok-punc">;</span> <span class="tok-comment2">// Director, XERXES Limited</span>',
    code: true
  }
];

const CHAR_MS      = 11;   // base delay per typed character
const CHAR_JITTER   = 9;    // +/- randomness, so it doesn't feel mechanical
const LINE_PAUSE    = 90;   // pause after a finished comment line
const BLANK_PAUSE    = 60;   // pause on an empty line
const CODE_PAUSE    = 260;  // longer beat before the two real code lines land

let started = false;

function renderPlainRow(n){
  const row = document.createElement('div');
  row.className = 'editor__row';
  row.innerHTML = `<span class="editor__lineno">${n}</span><span class="editor__linetext"></span>`;
  body.appendChild(row);
  return row.querySelector('.editor__linetext');
}

function scrollToBottom(){
  body.scrollTop = body.scrollHeight;
}

async function typeLine(el, text){
  const cursor = document.createElement('span');
  cursor.className = 'editor__cursor';
  el.appendChild(cursor);

  for (let i = 0; i < text.length; i++){
    cursor.insertAdjacentText('beforebegin', text[i]);
    if (statusLn) statusLn.textContent = `Ln ${body.children.length}, Col ${i + 2}`;
    scrollToBottom();
    const delay = CHAR_MS + Math.random() * CHAR_JITTER;
    await new Promise((r) => setTimeout(r, delay));
  }
  cursor.remove();
}

function wait(ms){ return new Promise((r) => setTimeout(r, ms)); }

async function runTypewriter(){
  stage.classList.add('is-typing');

  for (let i = 0; i < LINES.length; i++){
    const line = LINES[i];
    const lineNo = i + 1;
    const el = renderPlainRow(lineNo);
    if (line.code) el.parentElement.classList.add('editor__row--code');

    if (line.blank){
      await wait(BLANK_PAUSE);
      continue;
    }

    await typeLine(el, line.text);

    if (line.html) el.innerHTML = line.html;

    await wait(line.code ? CODE_PAUSE : LINE_PAUSE);
  }

  stage.classList.remove('is-typing');
  if (statusLn) statusLn.textContent = `Ln ${LINES.length}, Col 1`;
  signoff.classList.add('is-in');
}

function renderInstant(){
  LINES.forEach((line, i) => {
    const el = renderPlainRow(i + 1);
    if (line.code) el.parentElement.classList.add('editor__row--code');
    el.innerHTML = line.html || line.text;
  });
  if (statusLn) statusLn.textContent = `Ln ${LINES.length}, Col 1`;
  signoff.classList.add('is-in');
}

function startOnce(){
  if (started) return;
  started = true;
  if (prefersReducedMotion){
    renderInstant();
  } else {
    runTypewriter();
  }
}

/* -------- reveal + trigger -------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting){
      stage.classList.add('is-in');
      startOnce();
      io.disconnect();
    }
  });
}, { threshold: 0.3 });

io.observe(stage);

/* -------- pointer parallax tilt --------
   A light 3D tilt that follows the cursor while the editor is
   in view, layered on top of the settle-in transform via two
   CSS custom properties. Skipped entirely for touch / reduced
   motion — the idle float still reads as "alive" without it. */
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches){
  let raf = null;
  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = py * -6;   // tilt around X from vertical position
    targetY = px * 8;    // tilt around Y from horizontal position
    if (!raf) raf = requestAnimationFrame(tick);
  });

  stage.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick(){
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    editor.style.setProperty('--tilt-x', `${curX.toFixed(2)}deg`);
    editor.style.setProperty('--tilt-y', `${curY.toFixed(2)}deg`);
    if (Math.abs(targetX - curX) > 0.01 || Math.abs(targetY - curY) > 0.01){
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }
}
