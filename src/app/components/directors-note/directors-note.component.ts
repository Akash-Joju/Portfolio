import { Component, HostListener, AfterViewInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { EnergySphere } from './energy-sphere';

/** One active click/touch ripple in the Director's Note energy-field effect. */
interface DnRippleFx {
  point: THREE.Sprite;
  ring1: THREE.Sprite;
  ring2: THREE.Sprite;
  start: number;
  duration: number;
  maxRadius: number;
  strength: number;
}

@Component({
  selector: 'app-directors-note',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Great+Vibes&display=swap');

    :host { display:block; }

    /* ============ KEYFRAMES ============ */
    @keyframes beam-spin     { to   { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes card-float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes orbit-spin    { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
    @keyframes orbit-arm-cw  { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
    @keyframes orbit-arm-ccw { from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } }
    @keyframes pulse-ring    { 0%,100% { opacity:.25; transform:scale(1); } 50% { opacity:.55; transform:scale(1.04); } }
    @keyframes float-center  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
    @keyframes hub-pulse     { 0%,100% { box-shadow:0 0 40px rgba(255,31,74,.45), inset 0 0 26px rgba(255,31,74,.35); }
                               50%     { box-shadow:0 0 70px rgba(255,31,74,.75), inset 0 0 30px rgba(255,31,74,.5); } }
    @keyframes modal-in      { from { opacity:0; transform:scale(.86) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
    @keyframes modal-bg-in   { from { opacity:0; } to { opacity:1; } }
    @keyframes twinkle       { 0%,100% { opacity:.35; } 50% { opacity:.9; } }

    /* ============ SECTION / SPACE BACKDROP ============ */
    .dn-section {
      position: relative;
      overflow: hidden;
      padding: 6rem 0 7rem;
      color: #fff;
    }
    .dn-planet {
      position: absolute;
      top: -46%; right: -18%;
      width: 62rem; height: 62rem;
      border-radius: 50%;
      pointer-events: none;
      background:
        radial-gradient(circle at 34% 68%, rgba(12,72,160,.55) 0%, rgba(6,26,66,.35) 45%, rgba(3,10,26,0) 70%);
      box-shadow: inset 0 0 120px rgba(0,170,255,.28);
      filter: blur(2px);
      opacity: .85;
    }
    .dn-planet::after {
      content:''; position:absolute; inset:0; border-radius:50%;
      box-shadow: 0 0 90px rgba(60,170,255,.35), inset -30px 30px 120px rgba(255,60,90,.12);
    }
    .dn-stars {
      position:absolute; inset:0; pointer-events:none; opacity:.55;
      animation: twinkle 6s ease-in-out infinite;
      background-image:
        radial-gradient(1.4px 1.4px at 12% 22%, #cfe6ff 50%, transparent 51%),
        radial-gradient(1.2px 1.2px at 28% 68%, #ffd9df 50%, transparent 51%),
        radial-gradient(1.6px 1.6px at 46% 14%, #ffffff 50%, transparent 51%),
        radial-gradient(1.2px 1.2px at 64% 78%, #bcd9ff 50%, transparent 51%),
        radial-gradient(1.5px 1.5px at 78% 32%, #ffffff 50%, transparent 51%),
        radial-gradient(1.2px 1.2px at 91% 60%, #ffc6cf 50%, transparent 51%),
        radial-gradient(1.2px 1.2px at 8% 84%,  #ffffff 50%, transparent 51%);
    }
    .dn-grid-lines {
      position:absolute; inset:0; pointer-events:none; opacity:.35;
      background-size: 46px 46px;
      background-image:
        linear-gradient(to right,  rgba(255,255,255,.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px);
      -webkit-mask-image: radial-gradient(90% 70% at 50% 40%, #000 30%, transparent 100%);
              mask-image: radial-gradient(90% 70% at 50% 40%, #000 30%, transparent 100%);
    }
    .dn-canvas {
      position:absolute; inset:0; width:100%; height:100%;
      z-index:1; pointer-events:none; display:block;
    }

    /* ============ LAYOUT ============ */
    .dn-inner { max-width: var(--site-max, 80rem); margin:0 auto; padding: 0 var(--site-gutter, 1.25rem); position:relative; z-index:10; }
    .dn-grid  { display:grid; grid-template-columns:1fr; gap:4rem; align-items:center; }
    @media (min-width:1024px){ .dn-grid { grid-template-columns: 6.5fr 5.5fr; gap:3rem; } }

    .scroll-reveal { opacity:0; transform:translateY(26px); transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
    .scroll-reveal.visible { opacity:1; transform:translateY(0); }
    .scroll-reveal.delay-200 { transition-delay:180ms; }

    /* ============ LEFT: HEADING ============ */
    .dn-left { display:flex; flex-direction:column; gap:1.75rem; }
    .dn-heading {
      font-family:'Outfit',sans-serif;
      font-size: clamp(2.2rem, 4.6vw, 3.6rem);
      font-weight:800; letter-spacing:-.02em; margin:0; color:#fff;
      text-shadow: 0 4px 30px rgba(0,0,0,.6);
    }
    .dn-heading .accent { color:#ff2244; text-shadow:0 0 28px rgba(255,34,68,.55); }
    .dn-subheading {
      margin:.5rem 0 0; color:#ff4d63; font-size:clamp(.95rem,1.6vw,1.15rem);
      font-weight:500; font-family:'Plus Jakarta Sans',sans-serif;
    }

    /* ============ 3D CARD + TRAVELLING LIGHT ============ */
    .dn-card-perspective { perspective: 1500px; }
    .dn-card-float { animation: card-float 8s ease-in-out infinite; will-change: transform; }
    .dn-card-tilt {
      position:relative;
      transform-style: preserve-3d;
      transition: transform .35s cubic-bezier(.16,1,.3,1);
      will-change: transform;
    }
    .dn-proximity-glow {
      position:absolute; inset:-28px; border-radius:44px; z-index:0; pointer-events:none;
      background: radial-gradient(closest-side, rgba(255,60,90,.4), rgba(80,150,255,.22) 55%, transparent 75%);
      filter: blur(24px);
      opacity:0;
      transition: opacity .5s ease;
      will-change: opacity;
    }
    .dn-halo {
      position:absolute; inset:-16px; border-radius:42px;
      padding:18px; overflow:hidden; z-index:0;
      filter: blur(26px); opacity:.9; pointer-events:none;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
              mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      transform: translateZ(-40px);
    }
    .dn-shell {
      position:relative; z-index:2;
      border-radius:32px; padding:2px; overflow:hidden;
      background: linear-gradient(140deg, rgba(120,170,255,.45), rgba(255,60,90,.22) 45%, rgba(120,170,255,.38));
      box-shadow: 0 30px 70px -20px rgba(0,0,0,.85);
    }
    .dn-beam {
      position:absolute; top:50%; left:50%;
      width:170%; aspect-ratio:1/1;
      transform: translate(-50%,-50%);
      animation: beam-spin 6.5s linear infinite;
      will-change: transform;
      background: conic-gradient(from 0deg,
        rgba(255,31,74,0)    0deg,
        rgba(255,31,74,0)   28deg,
        rgba(255,31,74,.55) 46deg,
        #ff1f4a             58deg,
        #ff8fa3             64deg,
        #ffffff             67deg,
        #ff1f4a             71deg,
        rgba(255,31,74,.5)  84deg,
        rgba(255,31,74,0)  104deg,
        rgba(80,150,255,0) 196deg,
        rgba(80,150,255,.5) 218deg,
        #4d9bff            232deg,
        #cfe6ff            236deg,
        #4d9bff            240deg,
        rgba(80,150,255,0) 262deg,
        rgba(255,31,74,0)  300deg,
        rgba(255,31,74,.45) 318deg,
        #ff2b52            326deg,
        rgba(255,31,74,0)  344deg,
        rgba(255,31,74,0)  360deg);
    }
    .dn-card-inner {
      position:relative; z-index:3;
      border-radius:30px;
      padding: 2.4rem 2.4rem 2rem;
      background:
        linear-gradient(160deg, rgba(14,28,56,.86) 0%, rgba(9,18,38,.9) 55%, rgba(16,22,46,.88) 100%);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.08), inset 0 -40px 80px rgba(0,0,0,.35);
      transform-style: preserve-3d;
    }
    @media (max-width:640px){ .dn-card-inner { padding:1.75rem 1.4rem 1.5rem; } }

    .dn-sheen {
      position:absolute; inset:0; border-radius:30px; pointer-events:none; z-index:4;
      background: radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgba(255,255,255,.09), transparent 62%);
      opacity:0; transition:opacity .35s ease;
    }
    .dn-card-tilt:hover .dn-sheen { opacity:1; }

    .dn-quote-mark {
      font-family:Georgia,serif; font-size:3.2rem; line-height:1;
      color:#3fa9ff; opacity:.75; margin:0 0 .4rem;
      text-shadow:0 0 22px rgba(63,169,255,.6);
      transform: translateZ(28px);
    }
    .dn-para {
      margin:0 0 1.15rem; color:#dbe6f5; font-size:1.02rem; line-height:1.85;
      font-family:'Plus Jakarta Sans',sans-serif; transform: translateZ(18px);
    }
    .dn-para strong { color:#fff; font-weight:700; }

    .dn-author-row {
      margin-top:.6rem; padding-top:1.4rem;
      border-top:1px solid rgba(255,255,255,.12);
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:1rem; transform: translateZ(26px);
    }
    .dn-author-flex { display:flex; align-items:center; gap:1.1rem; }
    .dn-avatar {
  flex: 0 0 auto;
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 60%, #7c1a1a 100%);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.10),
    0 6px 22px -8px rgba(138,24,26,0.75),
    0 0 22px -6px rgba(255,125,125,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease;
}
.dn-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  display: block;
  border: 2px solid rgba(9,18,38,0.9);
}
.dn-avatar:hover {
  transform: scale(1.06);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.18),
    0 10px 30px -8px rgba(138,24,26,0.9),
    0 0 30px -6px rgba(255,125,125,0.75);
}
    .dn-author-name { margin:0 0 .25rem; font-family:'Outfit',sans-serif; font-weight:700; font-size:1.12rem; color:#fff; }
    .dn-author-title {
      margin:0; font-size:.72rem; color:#ff4d63; font-weight:600;
      letter-spacing:.14em; text-transform:uppercase; font-family:'Plus Jakarta Sans',sans-serif;
    }
    .dn-verified {
      display:flex; align-items:center; gap:.55rem; font-size:.8rem; color:#c2d2e6;
      background:rgba(255,255,255,.05); padding:.6rem 1rem; border-radius:999px;
      border:1px solid rgba(255,255,255,.14); font-family:'Plus Jakarta Sans',sans-serif;
    }

    /* ============ RIGHT: SKILLS ============ */
    .dn-right { display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
    .dn-right-label { text-align:center; }
    .dn-right-label h3 {
      margin:0; font-family:'Outfit',sans-serif; font-weight:800;
      font-size:clamp(1.7rem,3vw,2.6rem); color:#fff;
    }
    .dn-right-label h3 .accent { color:#ff2244; text-shadow:0 0 26px rgba(255,34,68,.5); }
    .dn-right-label p {
      margin:.45rem 0 0; font-size:.72rem; color:#9fb6d2;
      font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:.34em; text-transform:uppercase;
    }

    .dn-values-stage { position:relative; width:360px; height:360px; margin:0 auto; }
    @media (max-width:640px){ .dn-values-stage { width:300px; height:300px; } }

    .dn-orb-canvas {
      position:absolute; inset:0; width:100%; height:100%;
      cursor:pointer; touch-action:manipulation;
    }
    .dn-orb-canvas.no-gl {
      border-radius:50%;
      background: radial-gradient(circle closest-side,
        rgba(255,31,74,0) 0, rgba(255,31,74,0) 68%, rgba(255,31,74,.55) 76%,
        rgba(255,77,99,.30) 82%, rgba(255,31,74,0) 94%);
    }

    .orbital-container {
      position:absolute; inset:0; user-select:none;
      opacity:0; transform:scale(.92);
      pointer-events:none;
      transition: opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1);
    }
    .orbital-container.is-revealed { opacity:1; transform:scale(1); pointer-events:auto; }
    .dn-values-stage:focus-within .orbital-container { opacity:1; transform:scale(1); pointer-events:auto; }

    .orbit-ring { animation: orbit-spin 34s linear infinite; }
    .pulse-ring { animation: pulse-ring 3.4s ease-in-out infinite; }

    .orbit-arm {
      position:absolute; top:50%; left:50%; width:1px; height:1px;
      transform-origin:0 0; animation: orbit-arm-cw 26s linear infinite; pointer-events:none;
    }
    .orbit-node-pill {
      position:absolute; width:86px; height:86px; top:-183px; left:-43px;
      animation: orbit-arm-ccw 26s linear infinite;
      pointer-events:all; border-radius:50%; cursor:pointer;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      border:1.5px solid rgba(255,255,255,.35);
      transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
    }
    @media (max-width:640px){ .orbit-node-pill { width:74px; height:74px; top:-152px; left:-37px; } }
    .orbit-node-pill:hover { transform:scale(1.16); border-color:rgba(255,255,255,.8); }
    .orbit-node-icon  { width:20px; height:20px; margin-bottom:3px; }
    .orbit-node-label { font-size:9.5px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:.06em; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; }
    .orbit-node-sub   { font-size:7.5px; color:#d7e3f2; margin-top:3px; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; }

    .center-hub {
      position:absolute; z-index:30; cursor:pointer; border-radius:50%;
      width:132px; height:132px; top:calc(50% - 66px); left:calc(50% - 66px);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      border:2px solid rgba(255,60,90,.75);
      background: radial-gradient(circle at 50% 35%, #3a0a14 0%, #23060d 60%, #150409 100%);
      animation: float-center 5s ease-in-out infinite, hub-pulse 3.2s ease-in-out infinite;
      transition: transform .3s ease;
    }
    @media (max-width:640px){ .center-hub { width:112px; height:112px; top:calc(50% - 56px); left:calc(50% - 56px); } }
    .center-hub:hover { transform:scale(1.06); }
    .center-hub-label { font-size:12px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:.07em; text-align:center; line-height:1.25; font-family:'Plus Jakarta Sans',sans-serif; }
    .center-hub-sub   { font-size:9px; color:#ff8fa3; margin-top:4px; font-family:'Plus Jakarta Sans',sans-serif; }

    .dn-pedestal {
      position:relative; width:290px; max-width:82%; height:74px; margin:-14px auto 0;
      border-radius: 14px / 40px;
      background: linear-gradient(180deg, #2a3240 0%, #151b26 45%, #0b0f16 100%);
      box-shadow: 0 26px 50px -18px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.14);
      display:flex; align-items:center; justify-content:center; gap:.8rem;
      border:1px solid rgba(255,255,255,.08);
    }
    .dn-pedestal::before {
      content:''; position:absolute; top:-8px; left:8%; right:8%; height:16px;
      border-radius:50%; background: radial-gradient(ellipse at center, rgba(255,40,70,.5), transparent 70%);
      filter: blur(6px);
    }
    .dn-ped-logo { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.35rem; letter-spacing:.06em; color:#fff; }
    .dn-ped-logo span { color:#ff2244; }
    .dn-ped-tag { font-size:.5rem; line-height:1.35; letter-spacing:.16em; color:#9fb6d2; text-transform:uppercase; font-family:'Plus Jakarta Sans',sans-serif; border-left:1px solid rgba(255,255,255,.2); padding-left:.7rem; }

    .dn-rail {
      position:absolute; right:1.6rem; z-index:5;
      font-family:'Plus Jakarta Sans',sans-serif; font-size:.66rem; line-height:2;
      letter-spacing:.2em; text-transform:uppercase; color:#cbd9ea; pointer-events:none;
    }
    .dn-rail.top { top:2.2rem; }
    .dn-rail.bottom { bottom:2.6rem; }
    .dn-rail i { display:block; width:34px; height:2px; margin-top:.5rem; background:#ff2244; box-shadow:0 0 12px rgba(255,34,68,.8); }
    @media (max-width:1280px){ .dn-rail { display:none; } }

    /* ============ MODAL ============ */
    .modal-overlay {
      position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center;
      padding:1rem; background:rgba(4,10,24,.86); backdrop-filter:blur(8px);
      animation: modal-bg-in .2s ease forwards;
    }
    .modal-box {
      position:relative; width:100%; max-width:29rem; padding:2rem;
      border-radius:1.5rem; border:1px solid;
      background: linear-gradient(140deg,#0a1628 0%,#0e1f3c 100%);
      box-shadow:0 25px 60px -12px rgba(0,0,0,.85);
      animation: modal-in .35s cubic-bezier(.34,1.56,.64,1) forwards;
    }
    .modal-glow { position:absolute; top:-2.5rem; right:-2.5rem; width:10rem; height:10rem; border-radius:50%; filter:blur(2rem); opacity:.3; pointer-events:none; }
    .modal-close {
      position:absolute; top:1rem; right:1rem; width:2rem; height:2rem; border-radius:50%;
      background:rgba(255,255,255,.1); border:none; cursor:pointer; color:#fff;
      display:flex; align-items:center; justify-content:center; transition:background .2s;
    }
    .modal-close:hover { background:rgba(255,255,255,.22); }
    .modal-badge {
      display:inline-flex; align-items:center; gap:.5rem; padding:.28rem .8rem; border-radius:999px;
      font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
      border:1px solid; margin-bottom:1.25rem; font-family:'Plus Jakarta Sans',sans-serif;
    }
    .modal-title-row { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1rem; }
    .modal-num { font-family:monospace; font-weight:700; font-size:2.5rem; opacity:.2; color:#fff; line-height:1; margin-top:4px; }
    .modal-title { margin:0; font-family:'Outfit',sans-serif; font-weight:800; font-size:1.85rem; color:#fff; line-height:1.2; }
    .modal-body { margin:0; color:#cbd5e1; font-size:1rem; line-height:1.75; font-family:'Plus Jakarta Sans',sans-serif; }
    .modal-footer { margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:space-between; }
    .modal-footer-label { font-size:.72rem; color:#64748b; font-family:monospace; text-transform:uppercase; letter-spacing:.08em; }
    .modal-got-it { padding:.55rem 1.25rem; border-radius:.75rem; font-size:.875rem; font-weight:600; color:#fff; border:none; cursor:pointer; transition:transform .2s; font-family:'Plus Jakarta Sans',sans-serif; }
    .modal-got-it:hover { transform:scale(1.05); }

    /* ============ REDUCED MOTION ============ */
    @media (prefers-reduced-motion: reduce) {
      .dn-beam, .dn-card-float, .orbit-ring, .pulse-ring, .orbit-arm, .orbit-node-pill, .center-hub, .dn-stars {
        animation: none !important;
      }
      .dn-canvas { display:none !important; }
      .dn-proximity-glow { opacity:0 !important; transition:none !important; }
      .dn-orb-canvas { display:none !important; }
      .orbital-container { opacity:1 !important; transform:none !important; pointer-events:auto !important; }
    }

    @media (min-width:641px){
      .dn-values-stage { width:min(480px,100%); height:auto; aspect-ratio:1 / 1; }
      .orbital-container {
        inset:auto; top:50%; left:50%; width:360px; height:360px; margin:-180px 0 0 -180px;
        transform:scale(calc(var(--dn-k, 1) * .92));
      }
      .orbital-container.is-revealed,
      .dn-values-stage:focus-within .orbital-container { transform:scale(var(--dn-k, 1)); }
      @media (prefers-reduced-motion: reduce) {
        .orbital-container { transform:scale(var(--dn-k, 1)) !important; }
      }
    }
  `],
  template: `
    <section #dnSectionRef class="dn-section" id="about">

      <div class="dn-planet" aria-hidden="true"></div>
      <div class="dn-stars" aria-hidden="true"></div>
      <div class="dn-grid-lines" aria-hidden="true"></div>
      <canvas #dnCanvasRef class="dn-canvas" aria-hidden="true"></canvas>

      <div class="dn-rail top" aria-hidden="true">
        Design<br>Develop<br>Deploy<br>Delight
        <i></i>
      </div>
      <div class="dn-rail bottom" aria-hidden="true">
        Curious<br>Consistent<br>Craft-Focused<br>Always Learning
        <i></i>
      </div>

      <div class="dn-inner">
        <div class="dn-grid">

          <!-- ============ LEFT: ABOUT ============ -->
          <div #revealLeft class="dn-left scroll-reveal">

            <div>
              <h2 class="dn-heading">About <span class="accent">Me</span></h2>
              <p class="dn-subheading">Designer &amp; Developer crafting digital experiences</p>
            </div>

            <div class="dn-card-perspective">
              <div class="dn-card-float">
                <div #tiltCard
                     class="dn-card-tilt"
                     (mousemove)="onTilt($event)"
                     (mouseleave)="resetTilt($event)">

                  <div #proximityGlowRef class="dn-proximity-glow" aria-hidden="true"></div>

                  <div class="dn-halo" aria-hidden="true">
                    <div class="dn-beam"></div>
                  </div>

                  <div class="dn-shell">
                    <div class="dn-beam" aria-hidden="true"></div>

                    <div class="dn-card-inner">
                      <div class="dn-sheen" aria-hidden="true"></div>

                      <div class="dn-quote-mark" aria-hidden="true">&ldquo;</div>

                      <p class="dn-para">
                        Hi, I'm <strong>Akash Joju</strong> — a passionate full-stack developer and designer
                        who loves turning ideas into fast, beautiful, and accessible digital products.
                        Over the past few years I've worked across <strong>web apps, mobile experiences,
                        3D interfaces, and design systems</strong>, always with one goal in mind:
                        build things people genuinely enjoy using.
                      </p>

                      <p class="dn-para">
                        I care deeply about clean architecture, thoughtful motion, and the tiny details
                        that make an interface feel alive. From the first wireframe to the final deploy,
                        I own the journey end-to-end — and I never stop learning.
                      </p>

                      <div class="dn-author-row">
                        <div class="dn-author-flex">
  <div class="dn-avatar" aria-hidden="true">
    <img src="assets/images/profile.jpeg" alt="" />
  </div>
  <div>
    <p class="dn-author-name">Akash Joju</p>
    <p class="dn-author-title">Full-Stack Developer &amp; Designer</p>
  </div>
</div>

                        <div class="dn-verified">
                          <svg style="width:1rem;height:1rem;color:#34d399" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          <span>Open to opportunities</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          <!-- ============ RIGHT: SKILLS ORBIT ============ -->
          <div #revealRight class="dn-right scroll-reveal delay-200">

            <div class="dn-right-label">
              <h3>My <span class="accent">Skills</span></h3>
              <p>Tech Stack &middot; Hover the energy sphere</p>
            </div>

            <div #valuesStageRef class="dn-values-stage"
                 (mouseenter)="revealValues()" (mouseleave)="hideValues()"
                 (focusin)="revealValues()" (focusout)="onStageFocusOut($event)">

              <canvas #orbCanvasRef
                      class="dn-orb-canvas"
                      (click)="revealValues()"
                      aria-hidden="true"></canvas>

              <div class="orbital-container" [class.is-revealed]="valuesRevealed" aria-label="Skills orbital">

                <svg class="orbit-ring" style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 360 360" fill="none">
                  <circle cx="180" cy="180" r="156" stroke="rgba(120,180,255,.20)" stroke-width="1.5" stroke-dasharray="8 7"/>
                </svg>

                <svg class="pulse-ring" style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 360 360" fill="none">
                  <circle cx="180" cy="180" r="100" stroke="rgba(120,180,255,.32)" stroke-width="1" stroke-dasharray="4 8"/>
                </svg>

                <button class="center-hub" (click)="openModal(centerNode)" [attr.aria-label]="centerNode.label">
                  <svg style="width:1.9rem;height:1.9rem;color:#ff5c77;margin-bottom:5px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                  <span class="center-hub-label">FULL<br>STACK</span>
                  <span class="center-hub-sub">Core Stack</span>
                </button>

                <div *ngFor="let v of values" class="orbit-arm" [style.animation-delay]="orbDelay(v.angle)">
                  <button class="orbit-node-pill"
                          [style.background]="v.bg"
                          [style.box-shadow]="'0 0 26px ' + v.glow + ', inset 0 0 18px ' + v.glow"
                          [style.animation-delay]="orbDelay(v.angle)"
                          (click)="openModal(v)"
                          [attr.aria-label]="'Open ' + v.label">
                    <div class="orbit-node-icon" [innerHTML]="v.icon" [style.color]="v.color"></div>
                    <span class="orbit-node-label">{{v.label}}</span>
                    <span class="orbit-node-sub">{{v.subtitle}}</span>
                  </button>
                </div>

              </div>

            </div>

            <div class="dn-pedestal" aria-hidden="true">
              <div class="dn-ped-logo">DEV<span>.</span>ME</div>
              <div class="dn-ped-tag">Code<br>Design<br>Ship</div>
            </div>

          </div>


        </div>
      </div>
    </section>

    <!-- ============ MODAL ============ -->
    <div *ngIf="activeModal" (click)="closeModal()" class="modal-overlay">
      <div (click)="$event.stopPropagation()" class="modal-box" [style.border-color]="activeModal.color + '55'">
        <div class="modal-glow" [style.background]="activeModal.color"></div>
        <button (click)="closeModal()" class="modal-close" aria-label="Close modal">
          <svg style="width:1rem;height:1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="modal-badge"
             [style.color]="activeModal.color"
             [style.border-color]="activeModal.color + '44'"
             [style.background]="activeModal.color + '18'">
          <div style="width:1rem;height:1rem" [innerHTML]="activeModal.icon"></div>
          <span>{{activeModal.subtitle}}</span>
        </div>
        <div class="modal-title-row">
          <span class="modal-num">{{activeModal.id < 10 ? ('0' + activeModal.id) : activeModal.id}}</span>
          <h2 class="modal-title">{{activeModal.label}}</h2>
        </div>
        <p class="modal-body">{{activeModal.description}}</p>
        <div class="modal-footer">
          <span class="modal-footer-label">Core Skill</span>
          <button (click)="closeModal()" class="modal-got-it"
                  [style.background]="'linear-gradient(90deg,' + activeModal.color + ',' + activeModal.glow + ')'">
            Got it
          </button>
        </div>
      </div>
    </div>
  `
})
export class DirectorsNoteComponent implements AfterViewInit, OnDestroy {

  @ViewChildren('revealLeft, revealRight') revealEls!: QueryList<ElementRef>;
  @ViewChild('dnSectionRef') private dnSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('dnCanvasRef') private dnCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('proximityGlowRef') private proximityGlowRef?: ElementRef<HTMLElement>;
  @ViewChild('tiltCard') private tiltCardRef?: ElementRef<HTMLElement>;
  @ViewChild('valuesStageRef') private valuesStageRef?: ElementRef<HTMLElement>;
  @ViewChild('orbCanvasRef') private orbCanvasRef?: ElementRef<HTMLCanvasElement>;

  /** Whether the "My Skills" orbital is currently revealed over the energy sphere. */
  valuesRevealed = false;

  constructor(private ngZone: NgZone) {}

  /* ============ INTERACTIVE ENERGY-FIELD (Three.js) ============ */
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private points?: THREE.Points;
  private glowTexture?: THREE.Texture;
  private ringTexture?: THREE.Texture;

  private fxWidth = 0;
  private fxHeight = 0;
  private particleCount = 0;
  private basePositions = new Float32Array(0);
  private offsets = new Float32Array(0);
  private velocities = new Float32Array(0);
  private posAttr = new Float32Array(0);

  private ripples: DnRippleFx[] = [];
  private rafId = 0;
  private lastTime = 0;
  private lastTrailTime = 0;

  private pointerX = 0;
  private pointerY = 0;
  private pointerActive = false;
  private pointerIdleTimer: ReturnType<typeof setTimeout> | null = null;

  private isInView = true;
  private reducedMotion = false;
  private isMobile = false;
  private fxReady = false;

  private resizeObserver?: ResizeObserver;
  private fxVisibilityObserver?: IntersectionObserver;

  /* ============ SKILLS ENERGY SPHERE ============ */
  private sphere?: EnergySphere;
  private orbResizeObserver?: ResizeObserver;
  private orbVisibilityObserver?: IntersectionObserver;
  private onOrbPointerMove = (ev: PointerEvent) => this.sphere?.pointerMove(ev.clientX, ev.clientY);
  private onOrbPointerLeave = () => this.sphere?.pointerLeave();

  /** Center node — the "full-stack" hub. */
  readonly centerNode = {
    id: 0,
    label: 'Full-Stack Developer',
    subtitle: 'Core Stack',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
    color: '#ff2244',
    glow: 'rgba(255,34,68,0.5)',
    bg: 'linear-gradient(135deg,rgba(255,34,68,.2),rgba(40,4,10,.9))',
    description: `I build full-stack applications end-to-end — from pixel-perfect Angular / React frontends to robust Node.js, NestJS, and PostgreSQL backends. I love architecting systems that are fast, scalable, and delightful to work with on both sides of the API.`,
    angle: 0
  };

  /** Skills shown on the orbit. Edit freely to match your stack. */
  readonly values = [
    {
      id: 1, label: 'Angular', subtitle: 'Frontend',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 3-1.5 12L12 21l-7.5-3L3 6l9-3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7l-3.5 8h1.8l.7-1.7h2l.7 1.7h1.8L12 7z"/></svg>`,
      color: '#c084fc', glow: 'rgba(168,85,247,0.45)',
      bg: 'linear-gradient(135deg,rgba(168,85,247,.28),rgba(22,6,44,.92))',
      description: `Angular is my go-to for large, structured frontends. Standalone components, signals, RxJS, and strict typing keep my code clean and my apps fast. I've shipped production dashboards, e-commerce apps, and complex form systems with it.`,
      angle: 312
    },
    {
      id: 2, label: 'React', subtitle: 'Frontend',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/></svg>`,
      color: '#38bdf8', glow: 'rgba(56,189,248,0.45)',
      bg: 'linear-gradient(135deg,rgba(56,189,248,.28),rgba(3,26,48,.92))',
      description: `React with TypeScript is my other daily driver. I use hooks, context, React Query, and Next.js to build snappy SPAs and SSR apps. Component design, state management, and performance tuning are all part of my flow.`,
      angle: 24
    },
    {
      id: 3, label: 'Node.js', subtitle: 'Backend',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 5v8l-9 5-9-5V8l9-5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8M8 15h5"/></svg>`,
      color: '#fb923c', glow: 'rgba(249,115,22,0.45)',
      bg: 'linear-gradient(135deg,rgba(249,115,22,.28),rgba(42,14,3,.92))',
      description: `I design and ship REST and GraphQL APIs with Node.js, Express, and NestJS, backed by PostgreSQL / MongoDB. I focus on clean domain boundaries, solid testing, and deployment pipelines that just work.`,
      angle: 96
    },
    {
      id: 4, label: 'Three.js', subtitle: '3D / WebGL',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l9 5-9 5-9-5 9-5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10l9 5 9-5V7"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 12v10"/></svg>`,
      color: '#34d399', glow: 'rgba(16,185,129,0.45)',
      bg: 'linear-gradient(135deg,rgba(16,185,129,.28),rgba(3,32,22,.92))',
      description: `Interactive 3D on the web is my playground. With Three.js and raw WebGL I build particle systems, orbit visualizations, and physics-driven scenes — always optimised for mobile and accessible by default.`,
      angle: 168
    },
    {
      id: 5, label: 'UI / UX', subtitle: 'Design',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2.5 2.5 0 113.536 3.536L12.5 16.5H9v-3.5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 20h16"/></svg>`,
      color: '#facc15', glow: 'rgba(234,179,8,0.45)',
      bg: 'linear-gradient(135deg,rgba(234,179,8,.28),rgba(36,26,2,.92))',
      description: `I design in Figma with a systems mindset — tokens, components, and motion specs that translate cleanly to code. My goal is always the same: interfaces that feel obvious on first use and beautiful on the hundredth.`,
      angle: 240
    }
  ];

  activeModal: any = null;

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    this.revealEls.forEach(el => observer.observe(el.nativeElement));

    this.reducedMotion = typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(max-width: 768px)').matches;

    if (!this.reducedMotion && this.dnSectionRef && this.dnCanvasRef) {
      this.ngZone.runOutsideAngular(() => this.initFx());
    }
    if (this.valuesStageRef) {
      this.ngZone.runOutsideAngular(() => this.initStageScale());
    }
    if (!this.reducedMotion && this.orbCanvasRef && this.valuesStageRef) {
      this.ngZone.runOutsideAngular(() => this.initOrbSphere());
    }
  }

  revealValues() {
    this.valuesRevealed = true;
    this.sphere?.setOrbital(true);
  }
  hideValues() {
    this.valuesRevealed = false;
    this.sphere?.setOrbital(false);
  }

  /** Keyboard: leaving the stage with Tab closes the orbital — unless the mouse is still over it. */
  onStageFocusOut(ev: FocusEvent) {
    const stage = this.valuesStageRef?.nativeElement;
    const next = ev.relatedTarget as Node | null;
    if (stage && next && stage.contains(next)) return;
    if (stage?.matches(':hover')) return;
    this.hideValues();
  }

  /** Tap/click outside the values stage closes the revealed orbital (mobile fallback for "mouseleave"). */
  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(ev: PointerEvent) {
    if (!this.valuesRevealed) return;
    const stage = this.valuesStageRef?.nativeElement;
    if (stage && ev.target instanceof Node && !stage.contains(ev.target)) {
      this.hideValues();
    }
  }

  /** Cursor-driven 3D tilt + sheen position */
  onTilt(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width;
    const py = (ev.clientY - r.top) / r.height;
    const rotY = (px - 0.5) * 12;   // left / right
    const rotX = (0.5 - py) * 10;   // up / down
    el.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.012)`;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }

  resetTilt(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement;
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }

  orbDelay(angle: number): string {
    return `${-(angle / 360 * 26).toFixed(3)}s`;
  }

  openModal(v: any) { this.activeModal = v; }
  closeModal()      { this.activeModal = null; }

  @HostListener('document:keydown.escape')
  onEscape() { this.closeModal(); }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.pointerIdleTimer) clearTimeout(this.pointerIdleTimer);

    const section = this.dnSectionRef?.nativeElement;
    if (section) {
      section.removeEventListener('pointermove', this.onFxPointerMove);
      section.removeEventListener('pointerdown', this.onFxPointerDown);
      section.removeEventListener('pointerleave', this.onFxPointerLeave);
      section.removeEventListener('touchstart', this.onFxTouchStart);
      section.removeEventListener('touchmove', this.onFxTouchMove);
      section.removeEventListener('touchend', this.onFxTouchEnd);
    }

    this.resizeObserver?.disconnect();
    this.fxVisibilityObserver?.disconnect();

    this.ripples.forEach(r => this.disposeRipple(r));
    this.ripples = [];

    if (this.points) {
      this.scene?.remove(this.points);
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.points = undefined;
    }

    this.glowTexture?.dispose();
    this.ringTexture?.dispose();
    this.renderer?.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

    const stageEl = this.valuesStageRef?.nativeElement;
    if (stageEl) {
      stageEl.removeEventListener('pointermove', this.onOrbPointerMove);
      stageEl.removeEventListener('pointerleave', this.onOrbPointerLeave);
    }
    this.orbResizeObserver?.disconnect();
    this.orbVisibilityObserver?.disconnect();
    this.sphere?.destroy();
    this.sphere = undefined;
  }

  /* ============ SETUP ============ */

  private initFx() {
    const canvas = this.dnCanvasRef!.nativeElement;
    const section = this.dnSectionRef!.nativeElement;
    const rect = section.getBoundingClientRect();
    this.fxWidth = Math.max(1, Math.round(rect.width));
    this.fxHeight = Math.max(1, Math.round(rect.height));

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -this.fxWidth / 2, this.fxWidth / 2, this.fxHeight / 2, -this.fxHeight / 2, -500, 500
    );
    this.camera.position.z = 10;

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return; // WebGL unavailable — fail silently, rest of the section is unaffected
    }
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2));
    this.renderer.setSize(this.fxWidth, this.fxHeight, false);

    this.glowTexture = this.createGlowTexture();
    this.ringTexture = this.createRingTexture();

    this.particleCount = this.isMobile ? 20 : 52;
    this.buildParticles();

    section.addEventListener('pointermove', this.onFxPointerMove, { passive: true });
    section.addEventListener('pointerdown', this.onFxPointerDown, { passive: true });
    section.addEventListener('pointerleave', this.onFxPointerLeave, { passive: true });
    section.addEventListener('touchstart', this.onFxTouchStart, { passive: true });
    section.addEventListener('touchmove', this.onFxTouchMove, { passive: true });
    section.addEventListener('touchend', this.onFxTouchEnd, { passive: true });

    this.resizeObserver = new ResizeObserver(() => this.onFxResize());
    this.resizeObserver.observe(section);

    this.fxVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { this.isInView = entry.isIntersecting; });
    }, { threshold: 0.01 });
    this.fxVisibilityObserver.observe(section);

    this.fxReady = true;
    this.lastTime = performance.now();
    this.animate();
  }

  private createGlowTexture(): THREE.Texture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  private createRingTexture(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2, cy = size / 2;
    const g = ctx.createRadialGradient(cx, cy, size * 0.26, cx, cy, size * 0.5);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.78, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  private buildParticles() {
    if (this.points) {
      this.scene?.remove(this.points);
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
    }

    const n = this.particleCount;
    this.basePositions = new Float32Array(n * 2);
    this.offsets = new Float32Array(n * 2);
    this.velocities = new Float32Array(n * 2);
    this.posAttr = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);

    const blue = new THREE.Color(0x4d9bff);
    const red = new THREE.Color(0xff2b52);
    const white = new THREE.Color(0xdfe9ff);

    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * this.fxWidth;
      const y = (Math.random() - 0.5) * this.fxHeight;
      this.basePositions[i * 2] = x;
      this.basePositions[i * 2 + 1] = y;
      this.posAttr[i * 3] = x;
      this.posAttr[i * 3 + 1] = y;
      this.posAttr[i * 3 + 2] = 0;

      const c = Math.random();
      const col = c < 0.45 ? blue : c < 0.85 ? red : white;
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(this.posAttr, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 5 : 6.5,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false,
    });

    this.points = new THREE.Points(geom, mat);
    this.scene!.add(this.points);
  }

  /* ============ POINTER / TOUCH HANDLERS ============ */

  private onFxPointerMove = (ev: PointerEvent) => {
    if (ev.pointerType === 'touch') return; // touch handled via touch* events below
    this.updatePointer(ev.clientX, ev.clientY);
    this.updateCardProximity(ev.clientX, ev.clientY);
  };

  private onFxPointerDown = (ev: PointerEvent) => {
    if (ev.pointerType === 'touch') return;
    this.updatePointer(ev.clientX, ev.clientY);
    this.spawnRipple(this.pointerX, this.pointerY, 1);
  };

  private onFxPointerLeave = () => {
    this.pointerActive = false;
    this.setCardProximity(0);
  };

  private onFxTouchStart = (ev: TouchEvent) => {
    const t = ev.touches[0];
    if (!t) return;
    this.updatePointer(t.clientX, t.clientY);
    this.spawnRipple(this.pointerX, this.pointerY, 0.85);
    this.updateCardProximity(t.clientX, t.clientY);
  };

  private onFxTouchMove = (ev: TouchEvent) => {
    const t = ev.touches[0];
    if (!t) return;
    this.updatePointer(t.clientX, t.clientY);
    this.updateCardProximity(t.clientX, t.clientY);
    this.applyTrailImpulse(this.pointerX, this.pointerY);
  };

  private onFxTouchEnd = () => {
    this.pointerActive = false;
    this.setCardProximity(0);
  };

  private updatePointer(clientX: number, clientY: number) {
    const section = this.dnSectionRef?.nativeElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    this.pointerX = (clientX - rect.left) - this.fxWidth / 2;
    this.pointerY = this.fxHeight / 2 - (clientY - rect.top);
    this.pointerActive = true;
    if (this.pointerIdleTimer) clearTimeout(this.pointerIdleTimer);
    this.pointerIdleTimer = setTimeout(() => { this.pointerActive = false; }, 1200);
  }

  private updateCardProximity(clientX: number, clientY: number) {
    const card = this.tiltCardRef?.nativeElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const nx = Math.max(rect.left, Math.min(clientX, rect.right));
    const ny = Math.max(rect.top, Math.min(clientY, rect.bottom));
    const dist = Math.hypot(clientX - nx, clientY - ny);
    const range = 220;
    const intensity = Math.max(0, 1 - dist / range) * 0.4;
    this.setCardProximity(intensity);
  }

  private setCardProximity(intensity: number) {
    const glow = this.proximityGlowRef?.nativeElement;
    if (glow) glow.style.opacity = intensity.toFixed(3);
  }

  /* ============ RIPPLES ============ */

  private spawnRipple(x: number, y: number, strength: number) {
    if (!this.scene) return;
    const maxRadius = Math.max(this.fxWidth, this.fxHeight) * 0.32;

    const pointMat = new THREE.SpriteMaterial({
      map: this.glowTexture, color: 0xff5c77, transparent: true,
      opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const point = new THREE.Sprite(pointMat);
    point.scale.set(24, 24, 1);
    point.position.set(x, y, 2);
    this.scene.add(point);

    const ring1Mat = new THREE.SpriteMaterial({
      map: this.ringTexture, color: 0x6db4ff, transparent: true,
      opacity: 0.8 * strength, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring1 = new THREE.Sprite(ring1Mat);
    ring1.position.set(x, y, 1);
    this.scene.add(ring1);

    const ring2Mat = new THREE.SpriteMaterial({
      map: this.ringTexture, color: 0xff2b52, transparent: true,
      opacity: 0.35 * strength, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring2 = new THREE.Sprite(ring2Mat);
    ring2.position.set(x, y, 1);
    this.scene.add(ring2);

    this.ripples.push({ point, ring1, ring2, start: performance.now(), duration: 1300, maxRadius, strength });
    this.applyRadialImpulse(x, y, maxRadius * 0.6, 18 * strength);

    if (this.ripples.length > 5) {
      const old = this.ripples.shift();
      if (old) this.disposeRipple(old);
    }
  }

  private applyTrailImpulse(x: number, y: number) {
    const now = performance.now();
    if (now - this.lastTrailTime < 70) return;
    this.lastTrailTime = now;
    this.applyRadialImpulse(x, y, 70, 3);
  }

  private applyRadialImpulse(cx: number, cy: number, radius: number, strength: number) {
    const n = this.particleCount;
    for (let i = 0; i < n; i++) {
      const bx = this.basePositions[i * 2];
      const by = this.basePositions[i * 2 + 1];
      const dx = bx - cx;
      const dy = by - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        this.velocities[i * 2] += (dx / dist) * strength * falloff;
        this.velocities[i * 2 + 1] += (dy / dist) * strength * falloff;
      }
    }
  }

  private disposeRipple(r: DnRippleFx) {
    [r.point, r.ring1, r.ring2].forEach(sprite => {
      this.scene?.remove(sprite);
      (sprite.material as THREE.Material).dispose();
    });
  }

  /* ============ ANIMATION LOOP ============ */

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    if (!this.renderer || !this.scene || !this.camera || !this.isInView) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.updateParticles(dt);
    this.updateRipples(now);
    this.renderer.render(this.scene, this.camera);
  };

  private updateParticles(dt: number) {
    const n = this.particleCount;
    const spring = 3.2;
    const damping = Math.pow(0.86, dt * 60);
    const repulseRadius = 130;
    const repulseStrength = 46;

    for (let i = 0; i < n; i++) {
      const ox = this.offsets[i * 2];
      const oy = this.offsets[i * 2 + 1];
      let vx = this.velocities[i * 2];
      let vy = this.velocities[i * 2 + 1];

      if (this.pointerActive) {
        const bx = this.basePositions[i * 2] + ox;
        const by = this.basePositions[i * 2 + 1] + oy;
        const dx = bx - this.pointerX;
        const dy = by - this.pointerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < repulseRadius && dist > 0.001) {
          const falloff = 1 - dist / repulseRadius;
          const force = falloff * falloff * repulseStrength;
          vx += (dx / dist) * force * dt;
          vy += (dy / dist) * force * dt;
        }
      }

      vx += -ox * spring * dt;
      vy += -oy * spring * dt;
      vx *= damping;
      vy *= damping;

      const nx = ox + vx * dt;
      const ny = oy + vy * dt;

      this.offsets[i * 2] = nx;
      this.offsets[i * 2 + 1] = ny;
      this.velocities[i * 2] = vx;
      this.velocities[i * 2 + 1] = vy;

      this.posAttr[i * 3] = this.basePositions[i * 2] + nx;
      this.posAttr[i * 3 + 1] = this.basePositions[i * 2 + 1] + ny;
    }

    const attr = this.points!.geometry.attributes['position'] as THREE.BufferAttribute;
    attr.needsUpdate = true;
  }

  private updateRipples(now: number) {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      const elapsed = now - r.start;
      const t = Math.min(elapsed / r.duration, 1);

      const pointT = Math.min(elapsed / 260, 1);
      const pointScale = 24 * (1 + pointT * 1.4);
      r.point.scale.set(pointScale, pointScale, 1);
      (r.point.material as THREE.SpriteMaterial).opacity = 0.95 * (1 - pointT) * r.strength;

      const ease1 = 1 - Math.pow(1 - t, 3);
      const scale1 = 14 + ease1 * r.maxRadius * 2;
      r.ring1.scale.set(scale1, scale1, 1);
      (r.ring1.material as THREE.SpriteMaterial).opacity = 0.8 * (1 - t) * r.strength;

      const t2 = Math.max(0, Math.min((elapsed - 160) / (r.duration * 0.9), 1));
      const ease2 = 1 - Math.pow(1 - t2, 3);
      const scale2 = 10 + ease2 * r.maxRadius * 1.5;
      r.ring2.scale.set(scale2, scale2, 1);
      (r.ring2.material as THREE.SpriteMaterial).opacity = 0.35 * (1 - t2) * r.strength;

      if (t >= 1) {
        this.disposeRipple(r);
        this.ripples.splice(i, 1);
      }
    }
  }

  private onFxResize() {
    if (!this.renderer || !this.camera || !this.dnSectionRef) return;
    const rect = this.dnSectionRef.nativeElement.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === this.fxWidth && h === this.fxHeight) return;

    this.fxWidth = w;
    this.fxHeight = h;
    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.buildParticles();
  }

  /* ============ SKILLS ENERGY SPHERE ============ */

  /** Keeps --dn-k (stage width / 360) up to date so the orbital layer scales with the stage. */
  private initStageScale() {
    const stage = this.valuesStageRef?.nativeElement;
    if (!stage) return;
    const apply = () => {
      const w = stage.clientWidth || 360;
      stage.style.setProperty('--dn-k', (w / 360).toFixed(4));
      this.sphere?.resize();
    };
    apply();
    this.orbResizeObserver = new ResizeObserver(apply);
    this.orbResizeObserver.observe(stage);
  }

  private initOrbSphere() {
    const canvas = this.orbCanvasRef?.nativeElement;
    const stage = this.valuesStageRef?.nativeElement;
    if (!canvas || !stage) return;

    try {
      this.sphere = new EnergySphere(canvas, {
        count:  this.isMobile ? 900 : 2800,
        embers: this.isMobile ? 50  : 140,
        maxDpr: this.isMobile ? 1.5 : 2,
      });
    } catch {
      // WebGL unavailable (or shader failed on this GPU): show the static ring; the orbital still works
      canvas.classList.add('no-gl');
      return;
    }

    // cursor drives the sphere's tilt + 3D bulge (runs outside Angular: no change detection per move)
    stage.addEventListener('pointermove', this.onOrbPointerMove, { passive: true });
    stage.addEventListener('pointerleave', this.onOrbPointerLeave, { passive: true });

    // stop rendering while scrolled out of view
    this.orbVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => this.sphere?.setVisible(entry.isIntersecting));
    }, { threshold: 0.01 });
    this.orbVisibilityObserver.observe(stage);

    // in case the pointer/focus is already on the stage when the sphere finishes loading
    if (this.valuesRevealed) this.sphere.setOrbital(true);
    this.sphere.start();
  }
}