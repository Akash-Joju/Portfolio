import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ============================================================
   SERVICES PORTAL — same hologram build-up + gentle floating
   drift as the home hero's portal (script.js), pointed at the
   new model instead. The one deliberate difference: lighting.
   No key/rim point lights are added here — the model is lit
   only by the neutral PMREM studio environment, so it renders
   under its own original studio lighting rather than the
   hero's stylised blue/violet accent lights.
   ============================================================ */
const portal    = document.getElementById('portal');
const canvas    = document.getElementById('portalCanvas');
const loaderEl  = document.getElementById('portalLoader');
const loaderPct = document.getElementById('loaderPct');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer, scene, camera, modelGroup, clock;
let floatBaseY = 0;

/* -------- hologram build-up state (identical scheme to the
   home hero — see script.js for the full explanation) -------- */
const BUILD_DURATION = 2.2;
const FADE_DURATION  = 0.7;
let revealPlane = null;
let buildMinY = 0, buildMaxY = 1;
let buildStartT = null;
let buildComplete = false;
let fadeStartT = null;
let fadeDone = false;
let holoGroup = null;
let flashDone = false;
let mainModel = null;

function easeInOutQuad(x){ return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

function initScene(){
  try{
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  }catch(e){
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.15, 4.8);

  /* -------- lighting: studio environment only --------
     No THREE.DirectionalLight / PointLight / AmbientLight are
     added. The PMREM-baked RoomEnvironment is the sole light
     source, exactly like the neutral studio pass the hero
     portal uses for its own material read — just without the
     hero's additional coloured accent lights layered on top. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

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
    'assets/models/services-model.glb',
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // slightly smaller than the hero's normalized fit so the wider
      // desk/laptop scene keeps clear margin from the canvas edge —
      // nothing skims the frame at any viewport width.
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 2.05;
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

  buildStartT = null;
}

function attachClipPlane(model){
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

  if (t >= 1 && !fadeDone){
    fadeDone = true;
    modelGroup.remove(holoGroup);
    holoGroup = null;

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
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

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
      modelGroup.position.y = floatBaseY + Math.sin(t * 1.1) * 0.05;
      modelGroup.rotation.z = Math.sin(t * 0.6) * 0.015;
      modelGroup.rotation.x = Math.cos(t * 0.45) * 0.01;
    }

    renderer.render(scene, camera);
  }catch(err){
    console.error('Portal render tick failed, recovering next frame:', err);
  }
}

function boot(){
  window.addEventListener('resize', resizeRenderer);
  initScene();

  // stagger the hero copy in, same fade/rise-in the home hero
  // uses for its own content — no slider here, so this runs once.
  requestAnimationFrame(() => {
    const content = document.getElementById('svcHeroContent');
    if (content) content.classList.add('is-in');
  });
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
