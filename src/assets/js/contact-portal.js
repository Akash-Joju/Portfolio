import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ============================================================
   CONTACT PROJECTION — renders the supplied support-bot model
   in place of the old flat contact-hologram.png. The canvas
   sits inside the exact same .contact-projection__stage rig as
   before, so the existing CSS keeps doing all the motion: the
   stage's projRock tilt, the canvas's own contactFloat bob, and
   the base pad's portalBaseHum "vibration" + pulsing rings are
   untouched. This file only loads and renders the model itself.
   ============================================================ */
const stageEl  = document.querySelector('.contact-projection__stage');
const canvas   = document.getElementById('contactPortalCanvas');
const loaderEl = document.getElementById('contactPortalLoader');
const loaderPct = document.getElementById('contactLoaderPct');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer, scene, camera, modelGroup, clock;

function initScene(){
  if (!canvas) return;

  try{
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  }catch(e){
    return;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.15, 4.8);

  // neutral studio environment only — same lighting scheme as the
  // services portal, so the model renders under its own materials
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
    'assets/models/contact-model.glb',
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 2.05;
      const scale = targetSize / maxDim;

      model.position.sub(center);
      model.scale.setScalar(scale);

      modelGroup.add(model);

      if (loaderEl){
        loaderEl.classList.add('is-hidden');
        setTimeout(() => { loaderEl.style.display = 'none'; }, 550);
      }
    },
    (progress) => {
      if (progress.total && loaderPct){
        const pct = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
        loaderPct.textContent = `${pct}%`;
      }
    },
    (err) => {
      console.error('Contact model failed to load:', err);
      if (loaderEl){
        const txt = loaderEl.querySelector('.contact-projection__loader-txt');
        if (txt) txt.textContent = 'MODEL UNAVAILABLE';
      }
    }
  );
}

function resizeRenderer(){
  if (!stageEl || !renderer) return;
  const w = stageEl.clientWidth;
  const h = stageEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function animate(){
  requestAnimationFrame(animate);

  try{
    renderer.render(scene, camera);
  }catch(err){
    console.error('Contact portal render tick failed, recovering next frame:', err);
  }
}

function boot(){
  window.addEventListener('resize', resizeRenderer);
  initScene();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
