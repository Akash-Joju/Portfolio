/**
 * EnergySphere — a dependency-free, GPU-accelerated (WebGL) 3D particle "energy sphere".
 *
 * DEFAULT STATE
 *   ~2800 glowing dots on a thin spherical shell, projected with perspective. Because the
 *   shell is projected, dots naturally bunch up at the silhouette and form a bright dotted
 *   rim. Front dots are brighter/larger than back dots (depth cue), a slow wave breathes
 *   through the surface, and a few embers drift on their own tilted orbits.
 *
 * ORBITAL STATE  (hover / tap / keyboard focus — see setOrbital)
 *   • the sphere tilts toward the cursor and spins faster,
 *   • ~30% of the dots fly out of the shell into THREE precessing orbital rings, each with
 *     comet-style heads, so the orbital motion is clearly visible,
 *   • the remaining shell dims a little so the rings (and the value pills the component
 *     overlays) read clearly, embers speed up, the halo intensifies, a pulse ring expands.
 *
 * WHY WEBGL
 *   All per-dot work (rotation, perspective, ring migration, comet brightness, cursor bulge,
 *   shading) runs in a vertex shader. The whole sphere is 3 draw calls per frame and the CPU
 *   only updates a handful of uniforms, so it stays smooth even next to the section's other
 *   effects and the glowing value pills. (The previous Canvas-2D version issued ~3000
 *   drawImage calls per frame, which made hover feel "stuck" on busy pages.)
 *
 * Public API is unchanged: setOrbital, pointerMove, pointerLeave, setVisible, start, stop,
 * resize, renderAt, destroy. The constructor throws if WebGL is unavailable.
 */

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

interface Tint { r: number; g: number; b: number }

/** Palette = the project's reds (#ff1f4a brand red, #ff4d63, #ff8fa3) — no orange / gold. */
const TINTS: Tint[] = [
  { r: 255, g: 226, b: 232 }, // 0 hot white-pink spark
  { r: 255, g: 143, b: 163 }, // 1 soft rose        (#ff8fa3)
  { r: 255, g: 77,  b: 99 },  // 2 bright red       (#ff4d63)
  { r: 255, g: 31,  b: 74 },  // 3 brand red        (#ff1f4a)
  { r: 205, g: 14,  b: 58 },  // 4 deep crimson
];

/** Cumulative weights used to pick a tint for each particle. */
const TINT_CDF = [0.06, 0.26, 0.58, 0.86, 1.0];

/** The three orbital rings: tilt, precession speed, orbit speed (rad/s), radius. */
const RINGS = [
  { tiltX:  1.16, tiltY:  0.20, precess:  0.34, omega:  1.30, radius: 1.00 },
  { tiltX:  0.34, tiltY:  1.90, precess: -0.27, omega: -1.00, radius: 1.07 },
  { tiltX: -0.86, tiltY: -0.90, precess:  0.21, omega:  0.78, radius: 1.14 },
];

/** Comet heads per ring (bright head + fading tail). */
const COMETS_PER_RING = 2;

/** Perspective camera distance, in sphere radii. Higher = flatter. */
const CAM_DIST = 4.4;

export interface EnergySphereOptions {
  /** Total dots making up the shell (rings are borrowed from these). */
  count?: number;
  /** Number of loose embers orbiting outside the shell. */
  embers?: number;
  /** Max device-pixel-ratio to render at (keeps mobile cheap). */
  maxDpr?: number;
}

/* ========================================================================== */
/* shaders                                                                    */
/* ========================================================================== */

/** Shared by the shell and the embers: a soft glowing dot (white-pink core → tint → falloff). */
const FS_DOT = `
precision mediump float;
varying vec4 v_col;                       // rgb = tint, a = alpha
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r >= 1.0) discard;
  float a = r < 0.14 ? 1.0
          : r < 0.32 ? mix(1.0, 0.50, (r - 0.14) / 0.18)
          : r < 0.60 ? mix(0.50, 0.12, (r - 0.32) / 0.28)
          :            mix(0.12, 0.0,  (r - 0.60) / 0.40);
  vec3 core = vec3(1.0, 0.925, 0.941);
  vec3 col = mix(core, v_col.rgb, clamp(r / 0.14, 0.0, 1.0));
  float A = a * v_col.a;
  gl_FragColor = vec4(col * A, A);        // premultiplied, added with blendFunc(ONE, ONE)
}`;

const VS_SHELL = `
precision highp float;
attribute vec4 a_dir;   // xyz = unit direction, w = migration delay
attribute vec4 a_p1;    // radius, size, phase, twinkle speed
attribute vec4 a_p2;    // tint, ring (-1 = none), ring theta, ring lateral offset
uniform float u_t, u_orbit, u_hover, u_R, u_S, u_dpr, u_dotK, u_cam, u_maxPt;
uniform mat3 u_ms;
uniform vec3 u_ptr;
uniform vec3 u_ringU[3];
uniform vec3 u_ringV[3];
uniform float u_ringAng[3];
uniform float u_ringRad[3];
uniform float u_ringDir[3];
uniform vec3 u_tint[5];
varying vec4 v_col;

void main() {
  vec3 d = a_dir.xyz;
  float size = a_p1.y, phase = a_p1.z, tw = a_p1.w;

  // breathing + energy wave rolling across the surface
  float wave = 0.009 * sin(u_t * 1.35 + d.y * 5.0 + d.x * 3.0)
             + 0.005 * sin(u_t * tw * 0.6 + phase);
  float rr = (a_p1.x + wave) * (1.0 - 0.05 * u_orbit);
  vec3 q = (u_ms * d) * rr;

  // migrate towards this dot's orbital ring
  float mig = 0.0, comet = 0.0;
  if (a_p2.y > -0.5 && u_orbit > 0.0) {
    float p = (u_orbit - a_dir.w * 0.55) / 0.45;
    if (p > 0.0) {
      mig = p >= 1.0 ? 1.0 : p * p * (3.0 - 2.0 * p);
      int k = int(a_p2.y + 0.5);
      float th = a_p2.z + u_ringAng[k];
      vec3 U = u_ringU[k], V = u_ringV[k];
      vec3 rp = (U * cos(th) + V * sin(th)) * u_ringRad[k] + cross(U, V) * a_p2.w;
      q += (rp - q) * mig;
      float f = fract(a_p2.z / ${TAU} * ${COMETS_PER_RING}.0);
      if (u_ringDir[k] < 0.0) f = 1.0 - f;
      comet = f * f * f * f;              // sharp head, long tail
    }
  }

  // cursor bulge: soft 3D bump under the pointer
  float bump = 0.0;
  if (u_hover > 0.01) {
    float dd = dot(q, u_ptr) / max(length(q), 0.0001);
    if (dd > 0.5) {
      bump = exp(-(1.0 - dd) * 15.0) * u_hover;
      q *= 1.0 + 0.085 * bump;
    }
  }

  // perspective (y up, clip space spans +-S/2 css px)
  float persp = u_cam / (u_cam - q.z);
  vec2 s = q.xy * u_R * persp;

  // shading
  float rho2 = dot(q.xy, q.xy);
  float depth = 0.40 + 0.60 * (q.z * 0.5 + 0.5);
  float rim = 0.20 + 0.80 * pow(max(min(1.0, rho2), 0.00001), 1.3);
  float twk = 0.72 + 0.28 * sin(u_t * tw + phase);
  float shellDim = 1.0 - 0.42 * u_orbit;
  float alpha = 0.95 * depth * rim * twk * (shellDim + (1.0 - shellDim) * mig);
  float sz = size * (0.9 + 0.25 * rho2) * persp;
  float tint = a_p2.x;

  if (mig > 0.0) {
    float ringAlpha = (0.36 + 0.50 * comet) * (0.55 + 0.45 * depth);
    alpha = alpha * (1.0 - mig) + ringAlpha * mig;
    sz *= 1.0 + 0.45 * comet * mig;
    if (comet > 0.8 && mig > 0.6) tint = 1.0;     // rose-pink head
  }
  if (bump > 0.02) {
    alpha = min(1.0, alpha * (1.0 + 1.3 * bump));
    sz *= 1.0 + 0.6 * bump;
  }

  if (alpha < 0.02) { gl_Position = vec4(3.0, 3.0, 0.0, 1.0); gl_PointSize = 0.0; v_col = vec4(0.0); return; }
  gl_Position = vec4(s / (u_S * 0.5), 0.0, 1.0);
  gl_PointSize = min(min(sz, 2.0) * 10.5 * u_dotK * u_dpr, u_maxPt);
  v_col = vec4(u_tint[int(tint + 0.5)], alpha);
}`;

const VS_EMBER = `
precision highp float;
attribute vec4 a_u;     // plane basis u (xyz) + start angle
attribute vec4 a_v;     // plane basis v (xyz) + angular speed
attribute vec4 a_e;     // radius, size, phase, tint
uniform float u_t, u_orbit, u_R, u_S, u_dpr, u_dotK, u_cam, u_maxPt;
uniform mat3 u_mr;
uniform vec3 u_tint[5];
varying vec4 v_col;

void main() {
  float th = a_u.w + u_t * a_v.w * (1.0 + 1.9 * u_orbit);
  vec3 l = a_u.xyz * cos(th) + a_v.xyz * sin(th);
  float r = a_e.x * (1.0 + 0.03 * sin(u_t * 1.1 + a_e.z));
  vec3 q = (u_mr * l) * r;
  float persp = u_cam / (u_cam - q.z);
  float depth = 0.35 + 0.65 * (q.z * 0.5 + 0.5);
  float twk = 0.55 + 0.45 * sin(u_t * 2.1 + a_e.z);
  float alpha = (0.55 + 0.30 * u_orbit) * depth * twk;
  gl_Position = vec4(q.xy * u_R * persp / (u_S * 0.5), 0.0, 1.0);
  gl_PointSize = min(a_e.y * 10.0 * persp * (1.0 + 0.5 * u_orbit) * u_dotK * u_dpr, u_maxPt);
  v_col = vec4(u_tint[int(a_e.w + 0.5)], alpha);
}`;

/** Full-screen quad: soft red rim halo + the expanding pulse ring. */
const VS_QUAD = `
precision highp float;
attribute vec2 a_pos;
uniform float u_S;
varying vec2 v_px;
void main() { v_px = a_pos * u_S * 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FS_QUAD = `
precision mediump float;
varying vec2 v_px;
uniform float u_R, u_haloG, u_e;          // u_e < 0 => no pulse ring
void main() {
  float r = length(v_px);
  vec4 acc = vec4(0.0);

  float t = (r / u_R - 0.55) / 0.77;      // 0..1 across the halo gradient
  if (t > 0.0 && t < 1.0) {
    float a = t < 0.40 ? mix(0.0,  0.05, t / 0.40)
            : t < 0.62 ? mix(0.05, 0.14, (t - 0.40) / 0.22)
            : t < 0.72 ? mix(0.14, 0.17, (t - 0.62) / 0.10)
            : t < 0.86 ? mix(0.17, 0.07, (t - 0.72) / 0.14)
            :            mix(0.07, 0.0,  (t - 0.86) / 0.14);
    vec3 c = mix(vec3(1.0, 0.122, 0.29), vec3(0.824, 0.118, 0.353), smoothstep(0.62, 0.90, t));
    a *= u_haloG;
    acc += vec4(c * a, a);
  }

  if (u_e >= 0.0) {
    float ease = 1.0 - pow(1.0 - u_e, 3.0);
    float ringR = u_R * (0.90 + 0.30 * ease);
    float fade = pow(1.0 - u_e, 1.6);
    float d = abs(r - ringR);
    float w1 = 10.0 * (1.0 - u_e) + 1.0;
    float m1 = 1.0 - smoothstep(w1 * 0.5 - 0.75, w1 * 0.5 + 0.75, d);
    float m2 = 1.0 - smoothstep(0.8 - 0.75, 0.8 + 0.75, d);
    float a1 = 0.20 * fade * m1, a2 = 0.55 * fade * m2;
    acc += vec4(vec3(1.0, 0.122, 0.29) * a1 + vec3(1.0, 0.588, 0.667) * a2, a1 + a2);
  }
  gl_FragColor = acc;
}`;

/* ========================================================================== */
/* engine                                                                     */
/* ========================================================================== */

export class EnergySphere {
  private gl!: WebGLRenderingContext;
  private progShell!: WebGLProgram;
  private progEmber!: WebGLProgram;
  private progQuad!: WebGLProgram;
  private bufShell: WebGLBuffer[] = [];
  private bufEmber: WebGLBuffer[] = [];
  private bufQuad!: WebGLBuffer;
  private maxPt = 64;
  private contextLost = false;

  /* ---- particle data (built once) ---- */
  private readonly n: number;
  private readonly ne: number;
  private readonly aDir: Float32Array;  // n × 4
  private readonly aP1: Float32Array;   // n × 4
  private readonly aP2: Float32Array;   // n × 4
  private readonly eU: Float32Array;    // ne × 4
  private readonly eV: Float32Array;    // ne × 4
  private readonly eE: Float32Array;    // ne × 4

  /* ---- state ---- */
  private readonly dprCap: number;
  private dotK = 1;
  private cssSize = 0;
  private R = 0;
  private dpr = 1;
  private t = 0;
  private last = 0;
  private raf = 0;
  private visible = true;
  private running = false;

  private yaw = 0;
  private orbit = 0;
  private orbitTarget = 0;
  private hover = 0;
  private pointerOn = false;
  private rawX = 0; private rawY = 0; private rawDirty = false;
  private tpx = 0; private tpy = 0;
  private px = 0;  private py = 0;
  private pulse = 9;

  /* ---- per-frame uniforms (kept as typed arrays; no allocation in the loop) ---- */
  private readonly uMs = new Float32Array(9);
  private readonly uMr = new Float32Array(9);
  private readonly uPtr = new Float32Array(3);
  private readonly uRingU = new Float32Array(9);
  private readonly uRingV = new Float32Array(9);
  private readonly uRingAng = new Float32Array(3);
  private readonly uRingRad = new Float32Array(RINGS.map(r => r.radius));
  private readonly uRingDir = new Float32Array(RINGS.map(r => (r.omega < 0 ? -1 : 1)));
  private readonly uTint = new Float32Array(TINTS.flatMap(t => [t.r / 255, t.g / 255, t.b / 255]));
  private readonly mA = new Float32Array(9);   // scratch matrices
  private readonly mB = new Float32Array(9);
  private readonly mC = new Float32Array(9);

  constructor(private readonly canvas: HTMLCanvasElement, opts: EnergySphereOptions = {}) {
    this.dprCap = opts.maxDpr ?? 2;

    /* ---------- particle generation (same distribution as before) ---------- */
    const n = this.n = opts.count ?? 2800;
    this.aDir = new Float32Array(n * 4);
    this.aP1 = new Float32Array(n * 4);
    this.aP2 = new Float32Array(n * 4);

    const perRing = Math.floor((n * 0.30) / RINGS.length);
    let ringIdx = 0, inRing = 0;
    for (let i = 0; i < n; i++) {
      // jittered Fibonacci lattice: even coverage (no random clumps) but still organic
      const u = 1 - 2 * ((i + 0.5 + (Math.random() - 0.5) * 0.9) / n);
      const a = i * GOLDEN_ANGLE + (Math.random() - 0.5) * 0.55;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      const o = i * 4;
      this.aDir[o] = s * Math.cos(a); this.aDir[o + 1] = u; this.aDir[o + 2] = s * Math.sin(a);
      this.aDir[o + 3] = Math.random();                                   // migration delay

      const hot = Math.random();
      this.aP1[o] = 0.985 + Math.random() * 0.03;                         // very thin shell
      this.aP1[o + 1] = hot < 0.04 ? 1.6 + Math.random() * 0.6            // rare bright sparks
                      : hot < 0.25 ? 0.95 + Math.random() * 0.3
                      : 0.55 + Math.random() * 0.3;
      this.aP1[o + 2] = Math.random() * TAU;                              // phase
      this.aP1[o + 3] = 0.8 + Math.random() * 2.2;                        // twinkle speed

      this.aP2[o] = EnergySphere.pickTint(Math.random());
      if (ringIdx < RINGS.length) {
        this.aP2[o + 1] = ringIdx;
        this.aP2[o + 2] = ((inRing + Math.random() * 0.8) / perRing) * TAU;
        this.aP2[o + 3] = (Math.random() - 0.5) * 0.045;
        if (++inRing >= perRing) { inRing = 0; ringIdx++; }
      } else {
        this.aP2[o + 1] = -1;
      }
    }
    // scatter ring membership through the buffer so the migration is spatially even
    for (let i = n - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      for (let c = 1; c <= 3; c++) {
        const tmp = this.aP2[i * 4 + c]; this.aP2[i * 4 + c] = this.aP2[j * 4 + c]; this.aP2[j * 4 + c] = tmp;
      }
    }

    const ne = this.ne = opts.embers ?? 140;
    this.eU = new Float32Array(ne * 4);
    this.eV = new Float32Array(ne * 4);
    this.eE = new Float32Array(ne * 4);
    for (let i = 0; i < ne; i++) {
      // random orthonormal basis (u, v) for this ember's private orbit plane
      const ux = Math.random() * 2 - 1, uy = Math.random() * 2 - 1, uz = Math.random() * 2 - 1;
      const ul = Math.hypot(ux, uy, uz) || 1;
      const u0 = [ux / ul, uy / ul, uz / ul];
      let w = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
      const dp = w[0] * u0[0] + w[1] * u0[1] + w[2] * u0[2];
      w = [w[0] - dp * u0[0], w[1] - dp * u0[1], w[2] - dp * u0[2]];
      const wl = Math.hypot(w[0], w[1], w[2]) || 1;
      const o = i * 4;
      this.eU[o] = u0[0]; this.eU[o + 1] = u0[1]; this.eU[o + 2] = u0[2]; this.eU[o + 3] = Math.random() * TAU;
      this.eV[o] = w[0] / wl; this.eV[o + 1] = w[1] / wl; this.eV[o + 2] = w[2] / wl;
      this.eV[o + 3] = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.34);
      this.eE[o] = 1.10 + Math.random() * 0.10;
      this.eE[o + 1] = 0.45 + Math.random() * 0.55;
      this.eE[o + 2] = Math.random() * TAU;
      this.eE[o + 3] = EnergySphere.pickTint(Math.random());
    }

    this.initGL();                       // throws if WebGL is unavailable
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
    this.resize();
  }

  /* ====================================================================== */
  /* public API                                                             */
  /* ====================================================================== */

  /** Switch between the default dots state and the orbital-motion state. */
  setOrbital(on: boolean): void {
    if (on && this.orbitTarget === 0) this.pulse = 0;   // fire the pulse ring once
    this.orbitTarget = on ? 1 : 0;
  }

  /** Feed the pointer position (client coordinates). Cheap: the layout read happens once per frame. */
  pointerMove(clientX: number, clientY: number): void {
    this.rawX = clientX; this.rawY = clientY;
    this.rawDirty = true;
    this.pointerOn = true;
  }

  pointerLeave(): void {
    this.pointerOn = false;
    this.rawDirty = false;
    this.tpx = 0; this.tpy = 0;
  }

  /** Pause rendering while off-screen. */
  setVisible(v: boolean): void {
    this.visible = v;
    if (v) this.start(); else this.stop();
  }

  start(): void {
    if (this.running || !this.visible || this.contextLost) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy(): void {
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored, false);
    const gl = this.gl;
    if (gl && !this.contextLost) {
      [...this.bufShell, ...this.bufEmber, this.bufQuad].forEach(b => gl.deleteBuffer(b));
      [this.progShell, this.progEmber, this.progQuad].forEach(p => gl.deleteProgram(p));
      gl.getExtension('WEBGL_lose_context')?.loseContext();   // free the GPU context (SPA route changes)
    }
  }

  /** Re-measure the canvas (call from a ResizeObserver). */
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || 360));
    this.cssSize = size;
    this.R = size * 0.38;
    this.dotK = Math.max(1, Math.pow(this.R / 137, 0.7));
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.canvas.width = Math.round(size * this.dpr);
    this.canvas.height = Math.round(size * this.dpr);
    if (!this.contextLost) this.draw();   // never leave a blank canvas after a resize
  }

  /** Render a single frame at a fixed time (used for tests / static poster). */
  renderAt(seconds: number): void {
    this.t = seconds;
    this.update(0.016);
    this.draw();
  }

  /* ====================================================================== */
  /* loop                                                                   */
  /* ====================================================================== */

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    this.t += dt;
    this.update(dt);
    this.draw();
  };

  private update(dt: number): void {
    const k = (rate: number) => 1 - Math.exp(-rate * dt);

    // pointer → sphere space (one layout read per frame instead of one per mouse event)
    if (this.rawDirty) {
      this.rawDirty = false;
      const r = this.canvas.getBoundingClientRect();
      if (r.width > 0 && this.R > 0) {
        let x = (this.rawX - (r.left + r.width / 2)) / this.R;
        let y = (this.rawY - (r.top + r.height / 2)) / this.R;
        const len = Math.hypot(x, y);
        if (len > 1) { x /= len; y /= len; }      // keep the bulge on the sphere
        this.tpx = x; this.tpy = y;
      }
    }

    this.orbit += (this.orbitTarget - this.orbit) * k(2.6);
    if (Math.abs(this.orbitTarget - this.orbit) < 0.002) this.orbit = this.orbitTarget;

    this.hover += ((this.pointerOn ? 1 : 0) - this.hover) * k(4.0);
    this.px += (this.tpx - this.px) * k(7.0);
    this.py += (this.tpy - this.py) * k(7.0);

    this.yaw += dt * (0.15 + 0.55 * this.orbit);
    if (this.pulse < 9) this.pulse += dt;
  }

  /* ====================================================================== */
  /* drawing                                                                */
  /* ====================================================================== */

  private draw(): void {
    const gl = this.gl;
    if (!gl || this.contextLost) return;
    const S = this.cssSize, R = this.R, t = this.t, orbit = this.orbit, hover = this.hover;

    /* ---- view matrices ----
       Shell:  Rx(pitch) · Ry(yaw + cursor yaw)   (spins)
       Rings:  Rx(pitch) · Ry(cursor yaw)         (do not spin — they precess on their own) */
    const pitch = -0.36 + this.py * 0.42 * (0.35 + 0.65 * hover);
    const yawOff = this.px * 0.55;
    mulRxRy(this.mA, pitch, this.yaw + yawOff);          // mA = shell matrix (row-major)
    mulRxRy(this.mB, pitch, yawOff);                     // mB = ring/ember matrix (row-major)
    toColumnMajor(this.uMs, this.mA);
    toColumnMajor(this.uMr, this.mB);

    for (let k = 0; k < RINGS.length; k++) {
      const rg = RINGS[k];
      mulRxRy(this.mA, rg.tiltX, rg.tiltY + t * rg.precess);   // ring orientation
      mat3Mul(this.mC, this.mB, this.mA);                      // into view space
      const m = this.mC;                                       // columns 0/1 = in-plane axes
      this.uRingU[k * 3] = m[0]; this.uRingU[k * 3 + 1] = m[3]; this.uRingU[k * 3 + 2] = m[6];
      this.uRingV[k * 3] = m[1]; this.uRingV[k * 3 + 1] = m[4]; this.uRingV[k * 3 + 2] = m[7];
      this.uRingAng[k] = t * rg.omega;
    }

    // pointer as a 3D direction on the front of the sphere (view space, y up)
    const pvx = this.px, pvy = -this.py;
    this.uPtr[0] = pvx; this.uPtr[1] = pvy; this.uPtr[2] = Math.sqrt(Math.max(0, 1 - pvx * pvx - pvy * pvy));

    /* ---- GL ---- */
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);                        // additive, premultiplied

    // 1) halo + pulse ring
    const breathe = 0.5 + 0.5 * Math.sin(t * 1.7);
    gl.useProgram(this.progQuad);
    gl.uniform1f(this.loc(this.progQuad, 'u_S'), S);
    gl.uniform1f(this.loc(this.progQuad, 'u_R'), R);
    gl.uniform1f(this.loc(this.progQuad, 'u_haloG'), 0.62 + 0.18 * breathe + 0.30 * orbit + 0.10 * hover);
    gl.uniform1f(this.loc(this.progQuad, 'u_e'), this.pulse < 1.25 ? this.pulse / 1.25 : -1);
    this.bindAttr(this.progQuad, 'a_pos', this.bufQuad, 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.unbindAttr(this.progQuad, 'a_pos');

    // 2) shell + ring dots
    const ps = this.progShell;
    gl.useProgram(ps);
    this.commonUniforms(ps);
    gl.uniform1f(this.loc(ps, 'u_orbit'), orbit);
    gl.uniform1f(this.loc(ps, 'u_hover'), hover);
    gl.uniformMatrix3fv(this.loc(ps, 'u_ms'), false, this.uMs);
    gl.uniform3fv(this.loc(ps, 'u_ptr'), this.uPtr);
    gl.uniform3fv(this.loc(ps, 'u_ringU'), this.uRingU);
    gl.uniform3fv(this.loc(ps, 'u_ringV'), this.uRingV);
    gl.uniform1fv(this.loc(ps, 'u_ringAng'), this.uRingAng);
    gl.uniform1fv(this.loc(ps, 'u_ringRad'), this.uRingRad);
    gl.uniform1fv(this.loc(ps, 'u_ringDir'), this.uRingDir);
    this.bindAttr(ps, 'a_dir', this.bufShell[0], 4);
    this.bindAttr(ps, 'a_p1', this.bufShell[1], 4);
    this.bindAttr(ps, 'a_p2', this.bufShell[2], 4);
    gl.drawArrays(gl.POINTS, 0, this.n);
    this.unbindAttr(ps, 'a_dir'); this.unbindAttr(ps, 'a_p1'); this.unbindAttr(ps, 'a_p2');

    // 3) embers
    const pe = this.progEmber;
    gl.useProgram(pe);
    this.commonUniforms(pe);
    gl.uniform1f(this.loc(pe, 'u_orbit'), orbit);
    gl.uniformMatrix3fv(this.loc(pe, 'u_mr'), false, this.uMr);
    this.bindAttr(pe, 'a_u', this.bufEmber[0], 4);
    this.bindAttr(pe, 'a_v', this.bufEmber[1], 4);
    this.bindAttr(pe, 'a_e', this.bufEmber[2], 4);
    gl.drawArrays(gl.POINTS, 0, this.ne);
    this.unbindAttr(pe, 'a_u'); this.unbindAttr(pe, 'a_v'); this.unbindAttr(pe, 'a_e');
  }

  private commonUniforms(p: WebGLProgram): void {
    const gl = this.gl;
    gl.uniform1f(this.loc(p, 'u_t'), this.t);
    gl.uniform1f(this.loc(p, 'u_R'), this.R);
    gl.uniform1f(this.loc(p, 'u_S'), this.cssSize);
    gl.uniform1f(this.loc(p, 'u_dpr'), this.dpr);
    gl.uniform1f(this.loc(p, 'u_dotK'), this.dotK);
    gl.uniform1f(this.loc(p, 'u_cam'), CAM_DIST);
    gl.uniform1f(this.loc(p, 'u_maxPt'), this.maxPt);
    gl.uniform3fv(this.loc(p, 'u_tint'), this.uTint);
  }

  /* ====================================================================== */
  /* GL plumbing                                                            */
  /* ====================================================================== */

  private locCache = new Map<string, WebGLUniformLocation | null>();
  private attrCache = new Map<string, number>();

  private loc(p: WebGLProgram, name: string): WebGLUniformLocation | null {
    const key = (p as any).__id + name;
    let l = this.locCache.get(key);
    if (l === undefined) { l = this.gl.getUniformLocation(p, name); this.locCache.set(key, l); }
    return l;
  }

  private bindAttr(p: WebGLProgram, name: string, buf: WebGLBuffer, size: number): void {
    const gl = this.gl;
    const key = (p as any).__id + name;
    let a = this.attrCache.get(key);
    if (a === undefined) { a = gl.getAttribLocation(p, name); this.attrCache.set(key, a); }
    if (a < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, size, gl.FLOAT, false, 0, 0);
  }

  private unbindAttr(p: WebGLProgram, name: string): void {
    const a = this.attrCache.get((p as any).__id + name);
    if (a !== undefined && a >= 0) this.gl.disableVertexAttribArray(a);
  }

  private initGL(): void {
    const gl = this.canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false,
      stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) throw new Error('EnergySphere: WebGL not supported');
    this.gl = gl;

    const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
    this.maxPt = Math.max(8, Math.min(range[1] || 64, 256));

    this.locCache.clear(); this.attrCache.clear();
    this.progShell = this.program(VS_SHELL, FS_DOT, 'shell');
    this.progEmber = this.program(VS_EMBER, FS_DOT, 'ember');
    this.progQuad = this.program(VS_QUAD, FS_QUAD, 'quad');

    const mk = (data: Float32Array) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };
    this.bufShell = [mk(this.aDir), mk(this.aP1), mk(this.aP2)];
    this.bufEmber = [mk(this.eU), mk(this.eV), mk(this.eE)];
    this.bufQuad = mk(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
  }

  private static programId = 0;

  private program(vsSrc: string, fsSrc: string, label: string): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const msg = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error(`EnergySphere ${label} shader: ${msg}`);
      }
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`EnergySphere ${label} link: ${gl.getProgramInfoLog(p)}`);
    (p as any).__id = `${label}${EnergySphere.programId++}:`;
    return p;
  }

  private onContextLost = (ev: Event): void => {
    ev.preventDefault();               // allow restoration
    this.contextLost = true;
    this.stop();
  };

  private onContextRestored = (): void => {
    this.contextLost = false;
    try { this.initGL(); } catch { return; }
    this.resize();
    this.start();
  };

  private static pickTint(x: number): number {
    for (let i = 0; i < TINT_CDF.length; i++) if (x <= TINT_CDF[i]) return i;
    return TINT_CDF.length - 1;
  }
}

/* ---- tiny 3×3 matrix helpers (row-major unless stated; write into `out`, no allocation) ---- */

/** out = Rx(a) · Ry(b) */
function mulRxRy(out: Float32Array, a: number, b: number): void {
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  out[0] = cb;        out[1] = 0;   out[2] = sb;
  out[3] = sa * sb;   out[4] = ca;  out[5] = -sa * cb;
  out[6] = -ca * sb;  out[7] = sa;  out[8] = ca * cb;
}

/** out = a · b   (`out` must not alias `a` or `b`) */
function mat3Mul(out: Float32Array, a: Float32Array, b: Float32Array): void {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    }
  }
}

/** WebGL 1 has no matrix transpose on upload, and GLSL mat3 is column-major. */
function toColumnMajor(out: Float32Array, m: Float32Array): void {
  out[0] = m[0]; out[1] = m[3]; out[2] = m[6];
  out[3] = m[1]; out[4] = m[4]; out[5] = m[7];
  out[6] = m[2]; out[7] = m[5]; out[8] = m[8];
}