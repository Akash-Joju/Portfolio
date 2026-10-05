import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ============================================================
   THREE.JS SCENE
   The portal is now just a normal flex column (see style.css
   .hero__inner / .portal), centered on the right by CSS —
   no more JS math to track a ring in the background photo.
   No auto-spin: the only motion is a slow, gentle floating
   bob + a very small tilt sway, like the model is drifting
   in mid-air.
   ============================================================ */
const portal   = document.getElementById('portal');
const canvas   = document.getElementById('portalCanvas');
const loaderEl = document.getElementById('portalLoader');
const loaderPct = document.getElementById('loaderPct');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer, scene, camera, modelGroup, clock;
let webglOK = true;
let floatBaseY = 0;

/* -------- hologram build-up state --------
   The model materializes bottom-to-top like a hologram being
   projected, riding an unclipped wireframe "scaffold" that
   flickers with energy. Once the sweep finishes, the scaffold
   fades out and the real, fully-shaded model is left in place.
   Replays from scratch every time the hero slide changes. */
const BUILD_DURATION = 2.2;   // seconds for the reveal sweep
const FADE_DURATION  = 0.7;   // seconds to fade the holo scaffold out
let revealPlane = null;
let buildMinY = 0, buildMaxY = 1;
let buildStartT = null;
let buildComplete = false;
let fadeStartT = null;
let fadeDone = false;
let holoGroup = null;      // wireframe scaffold, unclipped
let flashDone = false;
let mainModel = null;      // reference to the real (clipped) model, for cleanup/replay

function easeInOutQuad(x){ return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

function initScene(){
  try{
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  }catch(e){
    webglOK = false;
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.15, 4.4);

  // soft neutral studio environment so the model's own materials read correctly
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // key + rim lights in the photo's own blue / violet palette
  const key = new THREE.DirectionalLight(0xdfe8ff, 2.0);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rimBlue = new THREE.PointLight(0x4f8cff, 14, 12, 2);
  rimBlue.position.set(-2.6, 0.6, -2.2);
  scene.add(rimBlue);

  const rimViolet = new THREE.PointLight(0xb26bff, 12, 12, 2);
  rimViolet.position.set(2.4, -1, -1.6);
  scene.add(rimViolet);

  scene.add(new THREE.AmbientLight(0x223055, 0.6));

  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  clock = new THREE.Clock();

  loadModel();
  resizeRenderer();
  animate();
}

function loadModel(){
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load(
    'assets/models/hero-model.glb',
    (gltf) => {
      const model = gltf.scene;

      // centre + normalise scale so any source model fills the portal consistently
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 2.35;
      const scale = targetSize / maxDim;

      model.position.sub(center);
      model.scale.setScalar(scale);

      modelGroup.add(model);
      floatBaseY = modelGroup.position.y;

      loaderEl.classList.add('is-hidden');
      setTimeout(() => { loaderEl.style.display = 'none'; }, 550);

      setupHologramBuild(model);
    },
    (progress) => {
      if (progress.total){
        const pct = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
        loaderPct.textContent = `${pct}%`;
      }
    },
    (err) => {
      console.error('Model failed to load:', err);
      loaderEl.querySelector('.portal__loader-txt').textContent = 'MODEL UNAVAILABLE';
    }
  );
}

/* ============================================================
   HOLOGRAM BUILD-UP
   1. Clip the real model with a horizontal plane and sweep the
      plane from its base to its top, so it "prints" upward.
   2. Show an unclipped wireframe scaffold riding along, for the
      hologram-assembly look — no extra scan-line box.
   3. Once the sweep finishes, fade the scaffold away and hand
      off to the normal, fully-shaded "real" projection.
   ============================================================ */
function setupHologramBuild(model){
  mainModel = model;

  if (prefersReducedMotion){
    buildComplete = true;
    fadeDone = true;
    return;
  }

  const box = new THREE.Box3().setFromObject(model);
  buildMinY = box.min.y;
  buildMaxY = box.max.y;

  attachClipPlane(model);
  buildWireframeScaffold(model);

  buildStartT = null; // set on first animate() tick
}

function attachClipPlane(model){
  // clip plane: keeps geometry where -y + constant >= 0, i.e. y <= constant
  revealPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), buildMinY - 0.06);

  model.traverse((node) => {
    if (!node.isMesh) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((m) => {
      if (!m) return;
      m.clippingPlanes = [revealPlane];
      m.clipShadows = true;
      m.needsUpdate = true;
    });
  });
}

function buildWireframeScaffold(model){
  // wireframe scaffold — the hologram "cage", unclipped, visible from frame 1
  holoGroup = new THREE.Group();
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x7fc4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    toneMapped: false
  });
  const wireModel = model.clone(true);
  wireModel.traverse((node) => {
    if (node.isMesh) node.material = wireMat;
  });
  wireModel.scale.multiplyScalar(1.012);
  holoGroup.add(wireModel);
  modelGroup.add(holoGroup);
}

/* Re-runs the whole materialize sequence on the already-loaded
   model — called by hero-slider.js each time the slide changes. */
function replayHologramBuild(){
  if (!mainModel || prefersReducedMotion) return;

  if (holoGroup){
    modelGroup.remove(holoGroup);
    holoGroup = null;
  }

  attachClipPlane(mainModel);
  buildWireframeScaffold(mainModel);

  buildComplete = false;
  fadeDone = false;
  flashDone = false;
  buildStartT = null;
  fadeStartT = null;
}
window.__replayHologram = replayHologramBuild;

function updateHologramBuild(elapsed){
  if (buildStartT === null) buildStartT = elapsed;
  const t = Math.min(1, (elapsed - buildStartT) / BUILD_DURATION);
  const eased = easeInOutQuad(t);
  const threshold = THREE.MathUtils.lerp(buildMinY - 0.06, buildMaxY + 0.06, eased);

  if (revealPlane) revealPlane.constant = threshold;
  if (holoGroup){
    holoGroup.children.forEach((w) => {
      w.traverse((node) => {
        if (node.isMesh) node.material.opacity = 0.42 + Math.random() * 0.16;
      });
    });
  }

  if (t >= 1 && !buildComplete){
    buildComplete = true;
    fadeStartT = elapsed;
  }
}

function updateHologramFade(elapsed){
  const t = Math.min(1, (elapsed - fadeStartT) / FADE_DURATION);

  if (holoGroup){
    holoGroup.children.forEach((w) => {
      w.traverse((node) => {
        if (node.isMesh) node.material.opacity = 0.5 * (1 - t);
      });
    });
  }

  // brief brightness pulse as the "real" projection settles in
  if (!flashDone && t > 0.15){
    flashDone = true;
    const pulse = { v: 1.9 };
    const start = performance.now();
    const dur = 500;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / dur);
      scene.children.forEach((c) => {
        if (c.isDirectionalLight) c.intensity = 2.0 + Math.sin(p * Math.PI) * (pulse.v - 2.0) * 0.35;
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  if (t >= 1 && !fadeDone){
    fadeDone = true;
    modelGroup.remove(holoGroup);
    holoGroup = null;

    // fully release clipping — the real projection now renders normally
    if (mainModel){
      mainModel.traverse((node) => {
        if (!node.isMesh) return;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((m) => { if (m) m.clippingPlanes = []; });
      });
    }
  }
}

function resizeRenderer(){
  const w = portal.clientWidth;
  const h = portal.clientHeight;
  // guard against a zero-size portal (e.g. mid-layout, display:none
  // ancestor, or a resize fired during a section transition) — an
  // aspect ratio of 0 or Infinity here would otherwise corrupt the
  // camera's projection matrix and leave the render loop stuck.
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/* Safety net for the hologram build/fade sequence: if anything ever
   keeps it from reaching its own completion (a stalled tween, a
   replay firing mid-fade, timing drift), force it closed after a
   generous grace window so the floating drift below is *always*
   guaranteed to kick in rather than leaving the model frozen. */
const HOLOGRAM_WATCHDOG_S = BUILD_DURATION + FADE_DURATION + 1.5;

function forceHologramComplete(){
  if (holoGroup){
    modelGroup.remove(holoGroup);
    holoGroup = null;
  }
  if (mainModel){
    mainModel.traverse((node) => {
      if (!node.isMesh) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => { if (m) m.clippingPlanes = []; });
    });
  }
  buildComplete = true;
  fadeDone = true;
}

function animate(){
  requestAnimationFrame(animate);

  // one bad frame (a transient WebGL hiccup, a null ref during a
  // replay race) should never be able to kill the whole rAF chain —
  // that would silently freeze the model with floating stopped for
  // good, since nothing would ever call requestAnimationFrame again.
  try{
    const t = clock.getElapsedTime();

    if (revealPlane && !buildComplete){
      updateHologramBuild(t);
      if (buildStartT !== null && t - buildStartT > HOLOGRAM_WATCHDOG_S) forceHologramComplete();
    } else if (revealPlane && buildComplete && !fadeDone){
      updateHologramFade(t);
      if (fadeStartT !== null && t - fadeStartT > HOLOGRAM_WATCHDOG_S) forceHologramComplete();
    }

    if (modelGroup && !prefersReducedMotion && (fadeDone || !revealPlane)){
      // gentle vertical drift, like the model is floating in air —
      // only once the hologram build/fade has finished settling
      modelGroup.position.y = floatBaseY + Math.sin(t * 1.1) * 0.05;
      // very small tilt sway — no continuous spin
      modelGroup.rotation.z = Math.sin(t * 0.6) * 0.015;
      modelGroup.rotation.x = Math.cos(t * 0.45) * 0.01;
    }

    renderer.render(scene, camera);
  }catch(err){
    console.error('Portal render tick failed, recovering next frame:', err);
  }
}

/* ============================================================
   BOOT
   ============================================================ */
function boot(){
  window.addEventListener('resize', resizeRenderer);
  initScene();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
