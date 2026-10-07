import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const TOTAL_FRAMES = 300;
const FRAME_PATH = 'assets/images/herosection/ezgif-frame-';
const MODEL_PATH = 'assets/models/tiny-planet.glb';
const DRACO_DECODER_PATH = 'assets/draco/';
const MODEL_BASE_DIAMETER = 1.5; // "medium-small" on-screen size

// --- Where the 3D model sits: on the bottom part of the glowing globe (right side of the frame) ---
// Measured on frame 273 (1280x720). Values are in FRAME pixels, so the model stays on the
// globe on every screen size (same cover-fit maths as drawFrame()).
// (The Earth's horizon on the LEFT of that frame is around x 470, y 490 if you ever want it there.)
const FRAME_W = 1280;
const FRAME_H = 720;
const EARTH_X = 868;      // globe centre x (px from left of frame)
const EARTH_Y = 462;      // bottom edge of the globe (px from top of frame) - the model's base rests here
const MODEL_SINK = 0;     // how far the model's base dips below that edge (fraction of its height)
const MODEL_SCALE = 1;    // 1 = original size (unchanged). Raise/lower to resize.
const MODEL_OFFSET_X = 0; // nudge in frame px (+ = right)
const MODEL_OFFSET_Y = 0; // nudge in frame px (+ = down)

// Small screens: the frame image is cropped, so the Earth's rim is off-screen.
// Below this width (or whenever the model would be cut off) it sits in the screen centre.
const CENTER_BELOW_WIDTH = 900; // px
const CENTER_OFFSET_Y = 0;      // centre mode: + moves it up (fraction of screen height, e.g. 0.05)

export interface DockService {
  num: string;
  title: string;
  desc: string;
  slug: string;
  icon: 'web' | 'mobile' | 'cart' | 'marketing' | 'ai' | 'hosting' | 'brand';
}

export interface StageState {
  opacity: number;
  transform: string;
  visible: boolean;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
   

    :host {
      display: block;
      /* ---- Bottom service dock: tweak these to restyle it ---- */
      --dock-h: clamp(150px, 23vh, 230px);
      --dock-a: #0057e3ff;   /* blue   */
      --dock-b: #3850ebff;   /* violet */
    }

    .hero-scroll-driver {
      height: 520vh;
      position: relative;
    }

    .hero-sticky {
      position: sticky;
      top: 0;
      height: 100vh;
      height: 100dvh;
      width: 100%;
      overflow: hidden;
      background: #070d19;
    }

    canvas {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* 3D model layer — sits above the frame sequence, below the vignette/text */
    .model-canvas {
      z-index: 2;
      pointer-events: none;
    }

    /* Ambient atmospheric overlays */
    .vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 50% 50%, rgba(7, 13, 25, 0.25) 0%, rgba(7, 13, 25, 0.78) 85%, #070d19 100%),
        linear-gradient(to bottom, rgba(7,13,25,0.7) 0%, transparent 20%, transparent 75%, rgba(7,13,25,0.95) 100%);
      pointer-events: none;
      z-index: 1;
    }

    .ambient-glow-1 {
      position: absolute;
      top: 15%;
      left: 10%;
      width: 40vw;
      height: 40vw;
      max-width: 500px;
      max-height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(138, 24, 26, 0.16) 0%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
      z-index: 1;
    }

    .ambient-glow-2 {
      position: absolute;
      bottom: 20%;
      right: 10%;
      width: 35vw;
      height: 35vw;
      max-width: 450px;
      max-height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(101, 26, 25, 0.14) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 1;
    }

    /* Top accent line */
    .top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #8a181a, #7c1a1a, #ff7d7d, transparent);
      z-index: 20;
    }

    /* Stage content container */
    .overlay-container {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 5rem 1.5rem calc(var(--dock-h) + 1.5rem);
    }

    @media (min-width: 768px) {
      .overlay-container {
        padding: 6rem 4rem calc(var(--dock-h) + 2rem);
      }
    }

    @media (min-width: 1280px) {
      .overlay-container {
        padding: 6rem 8rem calc(var(--dock-h) + 2rem);
      }
    }

    /* Align hero text with the navbar logo / every other section */
    .overlay-container {
      padding-left: var(--site-edge);
      padding-right: var(--site-edge);
    }

    /* Stage card wrappers */
    .stage-card {
      max-width: 48rem;
      width: 100%;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-left: 0;
      margin-right: auto;
      transition: opacity 0.1s linear, transform 0.1s linear;
    }

    .stage-card-outro {
      max-width: 42rem;
    }

    /* Typography */
    .stage-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.025em;
      line-height: 1.08;
      margin: 0 0 1.5rem 0;
      font-size: clamp(2rem, 5vw, 4.25rem);
    }

    .stage-title-sm {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      margin-bottom: 0.75rem;
    }

    .stage-desc {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: clamp(0.95rem, 1.3vw, 1.25rem);
      color: #cbd5e1;
      max-width: 42rem;
      line-height: 1.625;
      margin: 0 0 2rem 0;
    }

    .stage-desc-sm {
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }

    /* Text Gradients */
    .text-gradient-blue {
      background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 60%, #7c1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .text-gradient-white,
    .bg-gradient-white {
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .text-gradient-cyan {
      background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 50%, #7c1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .bg-gradient-blue {
      background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* CTA Button */
    .cta-wrapper {
      margin-bottom: 2rem;
      pointer-events: auto;
    }

    .cta-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #ffffff;
      text-decoration: none;
      background: linear-gradient(90deg, #7c1a1a, #8a181a);
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(138, 24, 26, 0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .cta-btn:hover {
      transform: scale(1.04);
      background: linear-gradient(90deg, #8a181a, #9e1b1d);
      box-shadow: 0 14px 30px -4px rgba(138, 24, 26, 0.65);
    }

    .cta-btn:active {
      transform: scale(0.97);
    }

    .cta-icon {
      width: 1.25rem;
      height: 1.25rem;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;
    }

    .cta-btn:hover .cta-icon {
      transform: translateX(3px);
    }

    /* Outro Stage Badge & Action */
    .stage-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-family: 'Outfit', sans-serif;
      background: rgba(138, 24, 26, 0.15);
      border: 1px solid rgba(138, 24, 26, 0.4);
      color: #ff7d7d;
      margin-bottom: 1rem;
    }

    .discover-more {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffffffff;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      animation: bounce 1.8s infinite;
    }

    .discover-icon {
      width: 1rem;
      height: 1rem;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }

    /* Scroll Mouse Prompt (sits on top of the dock, joined to its border) */
    .scroll-hint {
      position: absolute;
      bottom: calc(var(--dock-h) - 2px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.55rem;
      color: rgba(226, 232, 255, 0.88);
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .scroll-mouse {
      width: 20px;
      height: 32px;
      border: 1.5px solid rgba(226, 232, 255, 0.8);
      border-radius: 10px;
      display: flex;
      justify-content: center;
      padding-top: 5px;
      box-sizing: border-box;
    }

    .scroll-wheel {
      width: 3px;
      height: 6px;
      background: #b6c8ff;
      border-radius: 2px;
      animation: scroll-wheel-anim 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    .scroll-line {
      width: 1px;
      height: clamp(16px, 4vh, 40px);
      background: linear-gradient(to bottom, rgba(226, 232, 255, 0.85), rgba(226, 232, 255, 0));
      transform-origin: top;
      animation: scroll-line-anim 1.8s ease-in-out infinite;
    }

    @keyframes scroll-wheel-anim {
      0% { transform: translateY(0); opacity: 1; }
      75% { transform: translateY(7px); opacity: 0; }
      100% { transform: translateY(0); opacity: 0; }
    }

    @keyframes scroll-line-anim {
      0%, 100% { transform: scaleY(0.55); opacity: 0.5; }
      50% { transform: scaleY(1); opacity: 1; }
    }

    /* ============================================================ */
    /* BOTTOM FLOATING SERVICE DOCK                                  */
    /* ============================================================ */
    .service-dock {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: var(--dock-h);
      z-index: 12;
      pointer-events: none;
      animation: dock-rise 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both;
    }

    @keyframes dock-rise {
      from { opacity: 0; transform: translateY(46px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Shared curved silhouette: big elliptical top corners.
       Extends 4px past the viewport so side/bottom edges are never drawn. */
    .dock-bg,
    .dock-ring {
      position: absolute;
      top: 0;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 13% 13% 0 0 / 68% 68% 0 0;
    }

    /* Glass fill */
    .dock-bg {
      // background:
      //   radial-gradient(ellipse 60% 120% at 50% 0%, rgba(80, 96, 255, 0.16), transparent 70%),
      //   linear-gradient(180deg, rgba(18, 26, 78, 0.62) 0%, rgba(8, 12, 40, 0.93) 55%, #050818 100%);
      -webkit-backdrop-filter: blur(16px);
      backdrop-filter: blur(16px);
      box-shadow: 0 -18px 60px -26px rgba(17, 51, 222, 0.55);
    }

    /* Glowing border ring (fades out toward the bottom) */
    .dock-ring {
      filter: drop-shadow(0 0 6px rgba(8, 75, 243, 0.65));
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 45%, rgba(0, 0, 0, 0.12) 100%);
      mask-image: linear-gradient(to bottom, #000 0%, #000 45%, rgba(0, 0, 0, 0.12) 100%);
    }

    .dock-ring__base,
    .dock-ring__comet {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1.5px; /* border thickness */
      box-sizing: border-box;
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      mask-composite: exclude;
    }

    /* Flowing blue -> violet colour along the border */
    .dock-ring__base {
      background: linear-gradient(
        90deg,
        var(--dock-a) 0%,
        var(--dock-b) 25%,
        var(--dock-a) 50%,
        var(--dock-b) 75%,
        var(--dock-a) 100%
      );
      background-size: 200% 100%;
      opacity: 0.85;
      animation: dock-flow 8s linear infinite;
    }

    /* Bright light that sweeps left -> right along the border */
    .dock-ring__comet {
      background: linear-gradient(
        90deg,
        transparent 0%,
        transparent 40%,
        rgba(207, 224, 255, 0) 43%,
        #e4edff 50%,
        rgba(207, 224, 255, 0) 57%,
        transparent 60%,
        transparent 100%
      );
      background-size: 300% 100%;
      background-repeat: no-repeat;
      animation: dock-comet 5.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    }

    @keyframes dock-flow  { to { background-position: 200% 0; } }
    @keyframes dock-comet {
      from { background-position: 100% 0; }
      to   { background-position: 0% 0; }
    }

    /* Content row: [<]  [ 3 services ]  [>] */
    .dock-inner {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(0.5rem, 2vw, 2rem);
      padding: 1.25rem var(--site-edge) 0;
      pointer-events: auto;
    }

    .dock-arrow {
      flex: 0 0 auto;
      width: 2.75rem;
      height: 2.75rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid rgba(120, 150, 255, 0.55);
      background: rgba(10, 16, 52, 0.6);
      color: #e4edff;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
    }

    .dock-arrow svg {
      width: 1.1rem;
      height: 1.1rem;
      transition: transform 0.25s ease;
    }

    .dock-arrow:hover {
      background: rgba(59, 90, 255, 0.28);
      border-color: rgba(170, 190, 255, 0.9);
      box-shadow: 0 0 18px rgba(96, 130, 255, 0.55);
      transform: scale(1.08);
    }

    .dock-arrow--prev:hover svg { transform: translateX(-2px); }
    .dock-arrow--next:hover svg { transform: translateX(2px); }
    .dock-arrow:active { transform: scale(0.94); }

    .dock-arrow:focus-visible,
    .dock-item:focus-visible {
      outline: 2px solid #9db4ff;
      outline-offset: 3px;
    }

    .dock-viewport {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      /* extra room so icon glow / float is not clipped */
      padding: 1.5rem 0;
      margin: -1.5rem 0;
    }

    .dock-track {
      display: flex;
      transition: transform 0.7s cubic-bezier(0.65, 0, 0.2, 1);
      will-change: transform;
    }

    .dock-item {
      position: relative;
      flex: 0 0 auto;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(0.85rem, 1.6vw, 1.5rem);
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: inherit;
    }

    /* Thin fading divider between services */
    .dock-item::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 50%;
      width: 1px;
      height: 62%;
      transform: translateY(-50%);
      background: linear-gradient(to bottom, transparent, rgba(150, 170, 255, 0.28), transparent);
    }

    .dock-icon {
      flex: 0 0 auto;
      width: clamp(3.4rem, 4.1vw, 4.25rem);
      height: clamp(3.4rem, 4.1vw, 4.25rem);
      display: grid;
      place-items: center;
      border-radius: 1.05rem;
      color: #ffffff;
      background: linear-gradient(145deg, var(--dock-a) 0%, #1a1adaff 50%, var(--dock-b) 100%);
      border: 1px solid rgba(170, 190, 255, 0.55);
      box-shadow:
        0 0 24px rgba(99, 102, 241, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.38),
        inset 0 0 16px rgba(255, 255, 255, 0.12);
      animation: dock-float 4.2s ease-in-out infinite;
      animation-delay: calc(var(--i, 0) * -0.7s);
      transition: box-shadow 0.3s ease;
    }

    .dock-icon svg {
      width: 46%;
      height: 46%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @keyframes dock-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }

    .dock-item:hover .dock-icon {
      box-shadow:
        0 0 34px rgba(120, 130, 255, 0.85),
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 0 18px rgba(255, 255, 255, 0.2);
    }

    .dock-text { min-width: 0; }

    .dock-num {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'Outfit', sans-serif;
      font-size: 0.8rem;
      font-weight: 500;
      color: #9aa6d8;
      margin-bottom: 0.15rem;
    }

    .dock-num i {
      display: block;
      width: 0.9rem;
      height: 1px;
      background: rgba(154, 166, 216, 0.55);
      transition: width 0.3s ease;
    }

    .dock-item:hover .dock-num i { width: 1.6rem; }

    .dock-title {
      margin: 0 0 0.3rem;
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1rem, 1.25vw, 1.25rem);
      font-weight: 600;
      color: #ffffff;
      line-height: 1.2;
    }

    .dock-desc {
      margin: 0;
      max-width: 15rem;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: clamp(0.74rem, 0.86vw, 0.86rem);
      line-height: 1.5;
      color: #9aa3c7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 640px) {
      :host { --dock-h: 170px; }
      .dock-arrow { width: 2.25rem; height: 2.25rem; }
      .dock-desc { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      .service-dock, .dock-icon, .dock-ring__base, .dock-ring__comet, .scroll-line { animation: none; }
      .dock-track { transition: none; }
    }

    /* Frame progress bar */
    .progress-bar-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.05);
      z-index: 20;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #651a19, #8a181a, #7c1a1a);
      box-shadow: 0 0 10px rgba(138, 24, 26, 0.6);
      transition: width 0.05s linear;
    }

    @media (max-width: 640px) {
      .hide-mobile {
        display: none;
      }
    }
  `],
  template: `
    <section id="hero" class="hero-scroll-driver">
      <div class="hero-sticky" #stickyEl>

        <!-- Top Accent Line -->
        <div class="top-accent"></div>

        <!-- Ambient Atmospheric Lights -->
        <div class="ambient-glow-1"></div>
        <div class="ambient-glow-2"></div>

        <!-- Canvas for high-performance 300-frame image sequence -->
        <canvas #canvasEl></canvas>

        <!-- 3D model canvas, layered over the frame sequence -->
        <canvas #modelCanvasEl class="model-canvas"></canvas>

        <!-- Vignette Mask for legibility -->
        <div class="vignette"></div>

        <!-- ============================================================== -->
        <!-- SCROLL-SYNCHRONIZED FEATURE & BRAND OVERLAYS                    -->
        <!-- ============================================================== -->
        <div class="overlay-container">

          <!-- STAGE 0: Brand Intro (0.00 - 0.20) -->
          <div *ngIf="stage0.visible"
               class="stage-card"
               [style.opacity]="stage0.opacity"
               [style.transform]="stage0.transform">

            <h1 class="stage-title">
              Creating modern <br class="hide-mobile" />
              <span class="text-gradient-white">digital experiences.</span>
            </h1>

            <p class="stage-desc">
          I love turning ideas into clean, interactive, and meaningful digital experiences that are visually engaging, responsive, and built with the user in mind.
            </p>

            <div class="cta-wrapper">
              <a href="#newsletter" class="cta-btn">
                <span>GET IN TOUCH</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="cta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          <!-- STAGE 1: Feature 01 - High-Velocity Web & Cloud Infrastructure (0.22 - 0.44) -->
          <div *ngIf="stage1.visible"
               class="stage-card"
               [style.opacity]="stage1.opacity"
               [style.transform]="stage1.transform">

            <h2 class="stage-title">
              Building powerful applications from<br class="hide-mobile" />
              <span class="text-gradient-white">frontend to backend</span>
            </h2>

            <p class="stage-desc">
             With experience in Angular, Node.js, REST APIs, and databases, I enjoy building complete applications that connect beautiful interfaces with powerful backend functionality.
            </p>

            <div class="cta-wrapper">
              <a href="#newsletter" class="cta-btn">
                <span>GET IN TOUCH</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="cta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          <!-- STAGE 2: Feature 02 - Cross-Platform Mobile & Digital Commerce (0.46 - 0.70) -->
          <div *ngIf="stage2.visible"
               class="stage-card"
               [style.opacity]="stage2.opacity"
               [style.transform]="stage2.transform">

            <h2 class="stage-title">
            Turning ideas into products<br class="hide-mobile" />
              <span class="bg-gradient-white">through code.</span>
            </h2>

            <p class="stage-desc">
             Through vibe coding and AI-assisted development, I experiment with new ideas, prototype quickly, and turn concepts into real products while keeping engineering and usability at the core.
            </p>

            <div class="cta-wrapper">
              <a href="#newsletter" class="cta-btn">
                <span>GET IN TOUCH</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="cta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          <!-- STAGE 3: Feature 03 - Enterprise AI & Autonomous Workflows (0.72 - 0.94) -->
          <div *ngIf="stage3.visible"
               class="stage-card"
               [style.opacity]="stage3.opacity"
               [style.transform]="stage3.transform">

            <h2 class="stage-title">
             Turning complex challenges <br class="hide-mobile" />
              <span class="text-gradient-white">into simple solutions</span>
            </h2>

            <p class="stage-desc">
             I enjoy breaking down complex problems, exploring different approaches, and building practical solutions that are efficient, scalable, and easy to use.
            </p>

            <div class="cta-wrapper">
              <a href="#newsletter" class="cta-btn">
                <span>GET IN TOUCH</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="cta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          <!-- STAGE 4: Transition Outro (0.95 - 1.00) -->
          <div *ngIf="stage4.visible"
               class="stage-card stage-card-outro"
               [style.opacity]="stage4.opacity"
               [style.transform]="stage4.transform">

            <div class="stage-badge">
  <span>Code. Create. Evolve.</span>
</div>

<h2 class="stage-title stage-title-sm">
  Explore My <span class="text-gradient-white">Work & Vision</span>
</h2>

<p class="stage-desc stage-desc-sm">
  From crafting seamless frontend experiences to building full-stack applications and experimenting with AI-powered vibe coding, explore how I turn ideas into meaningful digital products.
</p>

            <div class="discover-more">
              <span>Discover More</span>
              <svg class="discover-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </div>
          </div>

        </div>

        <!-- Scroll mouse hint -->
        <div class="scroll-hint" [style.opacity]="scrollPromptOpacity">
          <span>Scroll to explore</span>
          <div class="scroll-mouse">
            <div class="scroll-wheel"></div>
          </div>
          <div class="scroll-line"></div>
        </div>

        <!-- ============================================================== -->
        <!-- BOTTOM FLOATING SERVICE DOCK                                    -->
        <!-- ============================================================== -->
        <div class="service-dock">

          <div class="dock-bg"></div>
          <div class="dock-ring" aria-hidden="true">
            <span class="dock-ring__base"></span>
            <span class="dock-ring__comet"></span>
          </div>

          <div class="dock-inner"
               (mouseenter)="dockPaused = true"
               (mouseleave)="dockPaused = false">

            <button type="button" class="dock-arrow dock-arrow--prev" aria-label="Previous services" (click)="dockPrev()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
            </button>

            <div class="dock-viewport">
              <div class="dock-track" [style.transform]="dockTranslate">
                <a *ngFor="let svc of services; let i = index"
                   class="dock-item"
                   [href]="'service-details.html?service=' + svc.slug"
                   [style.flex-basis.%]="100 / dockVisible"
                   [style.--i]="i">

                  <span class="dock-icon" [ngSwitch]="svc.icon">
                    <svg *ngSwitchCase="'web'" viewBox="0 0 24 24"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
                    <svg *ngSwitchCase="'mobile'" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M12 18h.01"/></svg>
                    <svg *ngSwitchCase="'cart'" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    <svg *ngSwitchCase="'marketing'" viewBox="0 0 24 24"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                    <svg *ngSwitchCase="'ai'" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>
                    <svg *ngSwitchCase="'hosting'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    <svg *ngSwitchCase="'brand'" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/></svg>
                  </span>

                  <span class="dock-text">
                    <span class="dock-num">{{ svc.num }}<i></i></span>
                    <h3 class="dock-title">{{ svc.title }}</h3>
                    <p class="dock-desc">{{ svc.desc }}</p>
                  </span>
                </a>
              </div>
            </div>

            <button type="button" class="dock-arrow dock-arrow--next" aria-label="Next services" (click)="dockNext()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>

          </div>
        </div>

        <!-- Bottom Frame Progress Bar -->
        <!-- <div class="progress-bar-container">
          <div class="progress-bar-fill" [style.width.%]="progressPercent"></div>
        </div> -->

      </div>
    </section>
  `
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modelCanvasEl') modelCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stickyEl') stickyRef!: ElementRef<HTMLDivElement>;

  readonly totalFrames = TOTAL_FRAMES;

  // Scroll tracking values
  progressPercent = 0;
  scrollPromptOpacity = 1;
  activeStageIndex = 0;

  // Bottom service dock (carousel)
  readonly services: DockService[] = [
    {
    num: '01',
    title: 'Frontend Development',
    slug: 'frontend-development',
    icon: 'web',
    desc: 'Creating modern, responsive and interactive web experiences using Angular, TypeScript and modern frontend technologies.'
  },

  {
    num: '02',
    title: 'Full-Stack Development',
    slug: 'full-stack-development',
    icon: 'mobile',
    desc: 'Building complete applications from intuitive frontend interfaces to powerful backend systems using Node.js and databases.'
  },

  {
    num: '03',
    title: 'API & Backend Development',
    slug: 'api-backend-development',
    icon: 'cart',
    desc: 'Developing reliable REST APIs and backend services that connect applications, manage data and support scalable solutions.'
  },

  {
    num: '04',
    title: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    icon: 'marketing',
    desc: 'Exploring artificial intelligence and machine learning to build intelligent features, automation and smarter digital experiences.'
  },

  {
    num: '05',
    title: 'Vibe Coding',
    slug: 'vibe-coding',
    icon: 'ai',
    desc: 'Turning ideas into working products through AI-assisted development, rapid experimentation and creative problem solving.'
  },

  {
    num: '06',
    title: 'UI Development',
    slug: 'ui-development',
    icon: 'brand',
    desc: 'Transforming designs into polished, responsive and engaging interfaces with attention to usability and visual details.'
  },

  {
    num: '07',
    title: 'Developer Tools',
    slug: 'developer-tools',
    icon: 'hosting',
    desc: 'Building practical tools that simplify development workflows, automate repetitive tasks and improve developer productivity.'
  }
  ];
  dockIndex = 0;
  dockVisible = 3;
  dockPaused = false;
  private dockTimer: ReturnType<typeof setInterval> | undefined;

  // Stage Overlay States (opacity, transform, visibility)
  stage0: StageState = { opacity: 1, transform: 'translateY(0px)', visible: true };
  stage1: StageState = { opacity: 0, transform: 'translateY(24px)', visible: false };
  stage2: StageState = { opacity: 0, transform: 'translateY(24px)', visible: false };
  stage3: StageState = { opacity: 0, transform: 'translateY(24px)', visible: false };
  stage4: StageState = { opacity: 0, transform: 'translateY(24px)', visible: false };

  private frames: HTMLImageElement[] = [];
  private ctx!: CanvasRenderingContext2D;
  private rafId = 0;
  private targetFrame = 0;
  private currentFrameIndex = 0;
  private scrollHandler!: () => void;
  private resizeHandler!: () => void;
  private orientationHandler!: () => void;

  // --- 3D model layer state ---
  private modelScene!: THREE.Scene;
  private modelCamera!: THREE.PerspectiveCamera;
  private modelRenderer!: THREE.WebGLRenderer;
  private modelRoot!: THREE.Group;
  private modelRafId = 0;
  private modelClock = new THREE.Clock();
  private modelPlaced = false;
  private modelVisible = true;           // false while the hero is scrolled out of view
  private heroObserver?: IntersectionObserver;
  private lastW = 0;
  private lastH = 0;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateDockVisible();
    this.preloadFrames();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.setupModelScene();
    this.ngZone.runOutsideAngular(() => {
      this.scrollHandler = () => this.onScroll();
      this.lastW = window.innerWidth;
      this.lastH = window.innerHeight;
      this.resizeHandler = () => {
        // On phones the address bar showing/hiding fires 'resize' while scrolling.
        // Re-creating the canvases for that tiny height change causes stutter,
        // so only refit on a real size change.
        const w = window.innerWidth, h = window.innerHeight;
        if (w !== this.lastW || Math.abs(h - this.lastH) > 160 || w >= 1024) {
          this.lastW = w;
          this.lastH = h;
          this.fitCanvas();
          this.fitModelCanvas();
        }
        const before = this.dockVisible;
        this.updateDockVisible();
        if (before !== this.dockVisible) this.cdr.detectChanges();
      };
      this.orientationHandler = () => setTimeout(() => { this.fitCanvas(); this.fitModelCanvas(); }, 150);
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('resize', this.resizeHandler, { passive: true });
      window.addEventListener('orientationchange', this.orientationHandler);

      // Auto-advance the service dock every 4.5s (paused while hovered)
      this.dockTimer = setInterval(() => {
        if (this.dockPaused || document.hidden) return;
        this.dockNext();
        this.cdr.detectChanges();
      }, 4500);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.orientationHandler);
    cancelAnimationFrame(this.rafId);
    cancelAnimationFrame(this.modelRafId);
    this.heroObserver?.disconnect();
    if (this.dockTimer) clearInterval(this.dockTimer);
    this.disposeModelScene();
  }

  // ---------- Service dock carousel ----------
  get dockMaxIndex(): number {
    return Math.max(0, this.services.length - this.dockVisible);
  }

  get dockTranslate(): string {
    return `translateX(${-(this.dockIndex * 100) / this.dockVisible}%)`;
  }

  dockNext(): void {
    this.dockIndex = this.dockIndex >= this.dockMaxIndex ? 0 : this.dockIndex + 1;
  }

  dockPrev(): void {
    this.dockIndex = this.dockIndex <= 0 ? this.dockMaxIndex : this.dockIndex - 1;
  }

  private updateDockVisible(): void {
    const w = window.innerWidth;
    this.dockVisible = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
    this.dockIndex = Math.min(this.dockIndex, this.dockMaxIndex);
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.fitCanvas();
  }

  private fitCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    const logW = window.innerWidth;
    const logH = window.innerHeight;

    canvas.width = Math.round(logW * dpr);
    canvas.height = Math.round(logH * dpr);
    canvas.style.width = logW + 'px';
    canvas.style.height = logH + 'px';

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.frames[this.currentFrameIndex]?.complete) {
      this.drawFrame(this.currentFrameIndex);
    }
  }

  private preloadFrames(): void {
    this.frames = new Array(TOTAL_FRAMES);

    // Phones load every 2nd frame (half the data); drawFrame() falls back to
    // the nearest loaded frame, so the animation still looks continuous.
    const stride = window.innerWidth < 768 ? 2 : 1;
    const indexes: number[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i += stride) indexes.push(i);
    if (indexes[indexes.length - 1] !== TOTAL_FRAMES - 1) indexes.push(TOTAL_FRAMES - 1);

    const loadOne = (i: number) => new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      const num = String(i + 1).padStart(3, '0');
      img.onload = () => { if (i === 0) this.drawFrame(0); resolve(); };
      img.onerror = () => resolve();
      img.src = `${FRAME_PATH}${num}.webp`;
      this.frames[i] = img;
    });

    // First frame immediately, then the rest in small batches
    (async () => {
      await loadOne(0);
      for (let k = 1; k < indexes.length; k += 6) {
        await Promise.all(indexes.slice(k, k + 6).map(loadOne));
      }
    })();
  }

  /** Closest frame that has finished loading (used when the exact one is missing). */
  private nearestLoaded(index: number): HTMLImageElement | undefined {
    for (let d = 1; d < 40; d++) {
      for (const j of [index - d, index + d]) {
        const f = this.frames[j];
        if (f && f.complete && f.naturalWidth > 0) return f;
      }
    }
    return undefined;
  }

  private onScroll(): void {
    const scrollEl = this.stickyRef?.nativeElement?.parentElement;
    if (!scrollEl) return;

    const rect = scrollEl.getBoundingClientRect();
    const scrollableHeight = scrollEl.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

    this.targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
    this.progressPercent = progress * 100;

    // Calculate stage animations
    this.computeStageStates(progress);

    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.renderFrame();
      this.cdr.detectChanges();   // once per frame (was: on every scroll event)
    });
  }

  private renderFrame(): void {
    const idx = this.targetFrame;
    if (idx !== this.currentFrameIndex) {
      this.currentFrameIndex = idx;
      this.drawFrame(idx);
    }
  }

  private drawFrame(index: number): void {
    let img: HTMLImageElement | undefined = this.frames[index];
    if (!img || !img.complete || !img.naturalWidth) img = this.nearestLoaded(index);
    if (!img || !this.ctx) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    if (!iw || !ih) return;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    this.ctx.drawImage(img, sx, sy, sw, sh);
  }

  private calculateStageState(
    progress: number,
    start: number,
    end: number,
    fadeDur: number = 0.05
  ): StageState {
    if (progress < start || progress > end) {
      return { opacity: 0, transform: 'translateY(24px)', visible: false };
    }

    let opacity = 1;
    let translateY = 0;

    if (progress < start + fadeDur) {
      const t = (progress - start) / fadeDur;
      const eased = this.easeOut(t);
      opacity = eased;
      translateY = (1 - eased) * 24;
    } else if (progress > end - fadeDur) {
      const t = (end - progress) / fadeDur;
      const eased = this.easeIn(t);
      opacity = eased;
      translateY = -(1 - eased) * 18;
    }

    return {
      opacity,
      transform: `translateY(${translateY.toFixed(1)}px)`,
      visible: opacity > 0.01
    };
  }

  private computeStageStates(p: number): void {
    this.scrollPromptOpacity = Math.max(0, 1 - p / 0.06);

    // Stage 0: Brand Intro (0.00 -> 0.20)
    if (p <= 0.20) {
      const fadeOutStart = 0.14;
      let opacity = 1;
      let translateY = 0;
      if (p > fadeOutStart) {
        const t = (0.20 - p) / (0.20 - fadeOutStart);
        opacity = this.easeIn(t);
        translateY = -(1 - opacity) * 24;
      }
      this.stage0 = {
        opacity,
        transform: `translateY(${translateY.toFixed(1)}px)`,
        visible: opacity > 0.01
      };
    } else {
      this.stage0 = { opacity: 0, transform: 'translateY(-24px)', visible: false };
    }

    // Stage 1: Feature 01 (Web & Cloud) (0.22 -> 0.44)
    this.stage1 = this.calculateStageState(p, 0.22, 0.44, 0.05);

    // Stage 2: Feature 02 (Mobile & Commerce) (0.46 -> 0.70)
    this.stage2 = this.calculateStageState(p, 0.46, 0.70, 0.05);

    // Stage 3: Feature 03 (Enterprise AI) (0.72 -> 0.94)
    this.stage3 = this.calculateStageState(p, 0.72, 0.94, 0.05);

    // Stage 4: Outro Transition (0.94+ -> stays visible at end of scroll)
    if (p >= 0.94) {
      const fadeInStart = 0.94;
      const fadeInDur = 0.03;
      let opacity = 1;
      let translateY = 0;
      if (p < fadeInStart + fadeInDur) {
        const t = (p - fadeInStart) / fadeInDur;
        const eased = this.easeOut(t);
        opacity = eased;
        translateY = (1 - eased) * 24;
      }
      this.stage4 = {
        opacity,
        transform: `translateY(${translateY.toFixed(1)}px)`,
        visible: opacity > 0.01
      };
    } else {
      this.stage4 = { opacity: 0, transform: 'translateY(24px)', visible: false };
    }

    // Determine active phase index
    if (p < 0.22) {
      this.activeStageIndex = 0;
    } else if (p < 0.46) {
      this.activeStageIndex = 1;
    } else if (p < 0.72) {
      this.activeStageIndex = 2;
    } else {
      this.activeStageIndex = 3;
    }
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeIn(t: number): number {
    return t * t * t;
  }

  // ------------------------------------------------------------------
  // 3D MODEL LAYER — renders tiny-planet.glb on its own transparent
  // canvas, layered on top of the frame sequence. Position/scale are
  // driven by scroll progress; rotation spins continuously.
  // ------------------------------------------------------------------

  private setupModelScene(): void {
    const canvas = this.modelCanvasRef.nativeElement;

    this.modelScene = new THREE.Scene();

    this.modelCamera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.modelCamera.position.set(0, 0, 6);

    this.modelRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.innerWidth >= 768,
    });
    this.fitModelCanvas();

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 4, 5);
    const rim = new THREE.DirectionalLight(0xff9d9d, 0.7);
    rim.position.set(-4, -2, -3);
    this.modelScene.add(ambient, key, rim);

    // All scroll-driven transforms (position/scale) are applied to this
    // group; the loaded model spins independently inside it via rotation.
    this.modelRoot = new THREE.Group();
    this.modelScene.add(this.modelRoot);

    const loader = new GLTFLoader();

    // The model is Draco-compressed (geometry) + WebP (textures), which is
    // what cut it from ~28MB down to ~4.8MB. Draco needs its decoder files
    // available locally — see the setup note below.
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      MODEL_PATH,
      (gltf) => {
        const model = gltf.scene;

        // Center the model on its own origin and normalize its size so
        // it reads consistently regardless of how it was authored.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const normalizeScale = MODEL_BASE_DIAMETER / maxDim;
        model.scale.setScalar(normalizeScale);

        this.modelRoot.add(model);
      },
      undefined,
      (err) => console.error('Failed to load hero model:', err)
    );

    this.ngZone.runOutsideAngular(() => {
      this.animateModel();

      // Stop drawing the 3D model while the hero is scrolled out of view
      const heroEl = document.getElementById('hero');
      if (heroEl && 'IntersectionObserver' in window) {
        this.heroObserver = new IntersectionObserver((entries) => {
          const visible = entries[0].isIntersecting;
          this.modelVisible = visible;
          if (visible && !this.modelRafId) {
            this.modelClock.getDelta();            // drop the time spent paused
            this.modelRafId = requestAnimationFrame(this.animateModel);
          }
        }, { rootMargin: '100px 0px' });
        this.heroObserver.observe(heroEl);
      }
    });
  }

  private animateModel = (): void => {
    if (!this.modelVisible) { this.modelRafId = 0; return; }   // paused while off-screen
    this.modelRafId = requestAnimationFrame(this.animateModel);
    if (!this.modelRenderer || !this.modelRoot) return;

    const dt = this.modelClock.getDelta();

    // Continuous horizontal spin; position stays locked on the globe.
    this.modelRoot.rotation.y += dt * 0.6;

    this.applyModelPlacement(dt);

    this.modelRenderer.render(this.modelScene, this.modelCamera);
  };

  /**
   * Places the model on the bottom part of the glowing globe (from frame 273) at its
   * original size. On small / narrow screens - where the frame is cropped and the
   * globe can be off-screen - it glides to the centre of the screen instead.
   */
  private applyModelPlacement(dt: number): void {
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    // World-space size of the view at z = 0
    const halfH = Math.tan(THREE.MathUtils.degToRad(this.modelCamera.fov / 2)) * this.modelCamera.position.z;
    const halfW = halfH * (cw / ch);
    const modelH = MODEL_BASE_DIAMETER * MODEL_SCALE; // model's tallest side, world units

    // Globe anchor: same "cover" fit that drawFrame() uses for the frame image
    const s = Math.max(cw / FRAME_W, ch / FRAME_H);
    const screenX = (cw - FRAME_W * s) / 2 + (EARTH_X + MODEL_OFFSET_X) * s;
    const screenY = (ch - FRAME_H * s) / 2 + (EARTH_Y + MODEL_OFFSET_Y) * s;
    const anchorX = ((screenX / cw) * 2 - 1) * halfW;
    const anchorY = (1 - (screenY / ch) * 2) * halfH;

    // Would the model be cut off by the screen edges if it sat on the globe?
    const clipped = Math.abs(anchorX) + modelH * 0.5 > halfW;
    const centred = cw < CENTER_BELOW_WIDTH || clipped;

    const targetX = centred ? 0 : anchorX;
    // Model origin is its centre: lift it so its base rests on the globe's bottom edge
    const targetY = centred
      ? CENTER_OFFSET_Y * 2 * halfH
      : anchorY + (0.5 - MODEL_SINK) * modelH;

    // First frame snaps; afterwards glide (e.g. when the window is resized)
    const k = this.modelPlaced ? 1 - Math.exp(-dt * 6) : 1;
    this.modelPlaced = true;

    this.modelRoot.position.x += (targetX - this.modelRoot.position.x) * k;
    this.modelRoot.position.y += (targetY - this.modelRoot.position.y) * k;
    this.modelRoot.position.z = 0;
    this.modelRoot.scale.setScalar(MODEL_SCALE);
  }

  private fitModelCanvas(): void {
    if (!this.modelRenderer || !this.modelCamera) return;

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 2);
    this.modelRenderer.setPixelRatio(dpr);
    this.modelRenderer.setSize(window.innerWidth, window.innerHeight, false);

    this.modelCamera.aspect = window.innerWidth / window.innerHeight;
    this.modelCamera.updateProjectionMatrix();
  }

  private disposeModelScene(): void {
    if (!this.modelScene) return;

    this.modelScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = (mesh as any).material;
      if (Array.isArray(material)) {
        material.forEach((m: THREE.Material) => m.dispose());
      } else if (material) {
        material.dispose();
      }
    });

    this.modelRenderer?.dispose();
  }
}