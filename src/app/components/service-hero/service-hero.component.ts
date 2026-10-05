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

const TOTAL_FRAMES = 156;
const FRAME_PATH = 'assets/images/about/ezgif-frame-';

export interface StageState {
  opacity: number;
  transform: string;
  visible: boolean;
}

@Component({
  selector: 'app-service-hero',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      position: relative;
    }

    .service-hero-scroll-driver {
      height: 500vh;
      position: relative;
      background: #060b14;
    }

    .service-hero-sticky {
      position: sticky;
      top: 0;
      height: 100vh;
      height: 100dvh;
      width: 100%;
      overflow: hidden;
      background: #060b14;
    }

    canvas {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      will-change: transform;
    }

    /* Cinematic atmospheric vignettes and ambient lighting */
    .vignette-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 50% 50%, rgba(6, 11, 20, 0.35) 0%, rgba(6, 11, 20, 0.82) 75%, #060b14 100%),
        linear-gradient(to bottom, rgba(6, 11, 20, 0.75) 0%, transparent 22%, transparent 72%, rgba(6, 11, 20, 0.95) 100%);
      pointer-events: none;
      z-index: 2;
    }

    .ambient-glow-cyan {
      position: absolute;
      top: 18%;
      left: 8%;
      width: 45vw;
      height: 45vw;
      max-width: 540px;
      max-height: 540px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, transparent 70%);
      filter: blur(65px);
      pointer-events: none;
      z-index: 1;
    }

    .ambient-glow-indigo {
      position: absolute;
      bottom: 15%;
      right: 8%;
      width: 40vw;
      height: 40vw;
      max-width: 500px;
      max-height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.13) 0%, transparent 70%);
      filter: blur(70px);
      pointer-events: none;
      z-index: 1;
    }

    /* Top accent edge glow */
    .top-accent-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #7c1a1a 25%, #8a181a 50%, #651a19 75%, transparent 100%);
      z-index: 20;
    }

    /* Stage card overlay container */
    .service-overlay-container {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rem 1.5rem 3.5rem;
    }

    @media (min-width: 768px) {
      .service-overlay-container {
        padding: 6.5rem 4rem 4rem;
      }
    }

    @media (min-width: 1280px) {
      .service-overlay-container {
        padding: 7rem 8rem 4.5rem;
      }
    }

    /* Stage content cards */
    .stage-card {
      max-width: 58rem;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 auto;
      will-change: opacity, transform;
      transition: opacity 0.12s linear, transform 0.12s linear;
    }

    .stage-card-compact {
      max-width: 46rem;
    }

    /* Badges & Chips */
    .stage-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-family: 'Outfit', sans-serif;
      background: rgba(138, 24, 26, 0.15);
      border: 1px solid rgba(138, 24, 26, 0.4);
      color: #ff6b6b;
      margin-bottom: 1.25rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 20px rgba(138, 24, 26, 0.25);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ff6b6b;
      box-shadow: 0 0 8px #ff6b6b;
      animation: pulse-dot 2s infinite ease-in-out;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.75); }
    }

    /* Typography */
    .stage-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 1.25rem 0;
      font-size: clamp(2.1rem, 5.2vw, 4.25rem);
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
    }

    .stage-title-sm {
      font-size: clamp(1.85rem, 4.2vw, 2.75rem);
      margin-bottom: 1rem;
    }

    .stage-desc {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: clamp(0.95rem, 1.35vw, 1.25rem);
      color: #cbd5e1;
      max-width: 44rem;
      line-height: 1.65;
      margin: 0 0 2rem 0;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
    }

    .stage-desc-sm {
      font-size: 1rem;
      max-width: 38rem;
      margin-bottom: 1.75rem;
    }

    /* Gradient Text Styling */
    .text-gradient-cyan {
      background: linear-gradient(135deg, #ff6b6b 0%, #8a181a 50%, #7c1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .text-gradient-purple {
      background: linear-gradient(135deg, #ff8080 0%, #8a181a 50%, #651a19 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Feature Pills */
    .feature-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      justify-content: center;
      margin-bottom: 2rem;
      pointer-events: auto;
    }

    .feature-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.25s ease;
    }

    .feature-pill:hover {
      color: #e2e8f0;
      border-color: rgba(138, 24, 26, 0.5);
      background: rgba(138, 24, 26, 0.15);
      transform: translateY(-2px);
    }

    .pill-icon {
      width: 14px;
      height: 14px;
      color: #ff6b6b;
    }

    /* CTA Row */
    .cta-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      pointer-events: auto;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-primary-glow {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.9rem 2.2rem;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #ffffff;
      text-decoration: none;
      background: linear-gradient(135deg, #7c1a1a 0%, #8a181a 50%, #651a19 100%);
      border-radius: 0.8rem;
      box-shadow: 0 10px 28px -4px rgba(138, 24, 26, 0.5);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-primary-glow:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 14px 36px -2px rgba(138, 24, 26, 0.7);
    }

    .btn-primary-glow:active {
      transform: translateY(1px) scale(0.98);
    }

    .btn-secondary-ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.9rem 1.8rem;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #e2e8f0;
      text-decoration: none;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 0.8rem;
      backdrop-filter: blur(12px);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-secondary-ghost:hover {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(138, 24, 26, 0.5);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .btn-icon {
      width: 1.15rem;
      height: 1.15rem;
      transition: transform 0.2s ease;
    }

    .btn-primary-glow:hover .btn-icon {
      transform: translateX(4px);
    }

    /* Scroll mouse prompt */
    .scroll-indicator-wrap {
      position: absolute;
      bottom: 2.2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: rgba(148, 163, 184, 0.75);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-family: 'Outfit', sans-serif;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .scroll-mouse-shell {
      width: 20px;
      height: 32px;
      border: 2px solid rgba(148, 163, 184, 0.4);
      border-radius: 11px;
      display: flex;
      justify-content: center;
      padding-top: 5px;
    }

    .scroll-wheel-dot {
      width: 3px;
      height: 6px;
      background: #ff6b6b;
      border-radius: 2px;
      animation: scroll-wheel-slide 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    @keyframes scroll-wheel-slide {
      0% { transform: translateY(0); opacity: 1; }
      75% { transform: translateY(8px); opacity: 0; }
      100% { transform: translateY(0); opacity: 0; }
    }

    /* Progress bar */
    .hero-progress-track {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.06);
      z-index: 25;
    }

    .hero-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #7c1a1a, #8a181a, #651a19);
      box-shadow: 0 0 12px rgba(138, 24, 26, 0.7);
      transition: width 0.05s linear;
    }

    /* Outro Pulse Icon */
    .discover-pulse {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ff6b6b;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      animation: float-bounce 2s infinite ease-in-out;
      pointer-events: auto;
      text-decoration: none;
    }

    @keyframes float-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }

    @media (max-width: 640px) {
      .hide-mobile {
        display: none;
      }
      .feature-pills {
        gap: 0.4rem;
      }
      .feature-pill {
        font-size: 0.72rem;
        padding: 0.3rem 0.65rem;
      }
    }
  `],
  template: `
    <section id="serviceHeroSection" class="service-hero-scroll-driver">
      <div class="service-hero-sticky" #stickyEl>

        <!-- Top Accent Line -->
        <div class="top-accent-line"></div>

        <!-- Atmospheric Glow Orbs -->
        <div class="ambient-glow-cyan"></div>
        <div class="ambient-glow-indigo"></div>

        <!-- Canvas for 156-frame high-framerate sequence -->
        <canvas #canvasEl></canvas>

        <!-- Vignette & contrast backdrop -->
        <div class="vignette-overlay"></div>

        <!-- ============================================================== -->
        <!-- SCROLL-SYNCHRONIZED CAPABILITIES & SERVICES OVERLAYS           -->
        <!-- ============================================================== -->
        <div class="service-overlay-container">

          <!-- STAGE 0: Service Menu & Brand Architecture (0.00 - 0.20) -->
          <div *ngIf="stage0.visible"
               class="stage-card"
               [style.opacity]="stage0.opacity"
               [style.transform]="stage0.transform">
<!-- 
            <div class="stage-badge">
              <span class="badge-dot"></span>
              <span>ENTERPRISE SERVICE MENU</span>
            </div> -->

            <h1 class="stage-title">
              Engineered for Scale, <br class="hide-mobile" />
              <span class="text-gradient-cyan">Designed for Impact</span>
            </h1>

            <p class="stage-desc">
              Web, commerce, and intelligent mobile systems — choose the track tailored to your growth, and we scope the build from initial discovery to continuous acceleration.
            </p>

            <!-- <div class="cta-container">
              <a href="#services" class="btn-primary-glow">
                <span>EXPLORE SERVICES</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a href="contact.html" class="btn-secondary-ghost">
                <span>Book Discovery Call</span>
              </a>
            </div> -->
          </div>

          <!-- STAGE 1: Feature 01 - High-Velocity Web & Cloud Systems (0.22 - 0.44) -->
          <div *ngIf="stage1.visible"
               class="stage-card"
               [style.opacity]="stage1.opacity"
               [style.transform]="stage1.transform">

            <!-- <div class="stage-badge">
              <span class="badge-dot"></span>
              <span>CAPABILITY 01 // ARCHITECTURE</span>
            </div> -->

            <h2 class="stage-title">
              High-Velocity <br class="hide-mobile" />
              <span class="text-gradient-cyan">Web Architecture</span>
            </h2>

            <p class="stage-desc">
              Fast, resilient, and ultra-responsive web platforms engineered with cutting-edge microservices, edge-native SSR, and battle-tested cloud backends.
            </p>

            <!-- <div class="feature-pills">
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Sub-Second Latency
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Ironclad Security
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                Microservices & APIs
              </span>
            </div> -->

            <!-- <div class="cta-container">
              <a href="service-details.html?service=web-development" class="btn-primary-glow">
                <span>VIEW WEB SERVICES</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div> -->
          </div>

          <!-- STAGE 2: Feature 02 - Cross-Platform Mobile & E-Commerce (0.46 - 0.70) -->
          <div *ngIf="stage2.visible"
               class="stage-card"
               [style.opacity]="stage2.opacity"
               [style.transform]="stage2.transform">
<!-- 
            <div class="stage-badge">
              <span class="badge-dot"></span>
              <span>CAPABILITY 02 // MOBILITY & COMMERCE</span>
            </div> -->

            <h2 class="stage-title">
              Cross-Platform Mobile & <br class="hide-mobile" />
              <span class="text-gradient-purple">Digital Commerce</span>
            </h2>

            <p class="stage-desc">
              High-converting digital storefronts and immersive native iOS & Android applications crafted for unmatched user engagement and seamless multi-channel transactions.
            </p>
<!-- 
            <div class="feature-pills">
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                iOS & Android Native
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                High-Conversion Checkouts
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Real-Time Data Sync
              </span>
            </div> -->

            <!-- <div class="cta-container">
              <a href="service-details.html?service=mobile-development" class="btn-primary-glow">
                <span>VIEW MOBILE & COMMERCE</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div> -->
          </div>

          <!-- STAGE 3: Feature 03 - Cognitive AI & Autonomous Automation (0.72 - 0.93) -->
          <div *ngIf="stage3.visible"
               class="stage-card"
               [style.opacity]="stage3.opacity"
               [style.transform]="stage3.transform">
<!-- 
            <div class="stage-badge">
              <span class="badge-dot"></span>
              <span>CAPABILITY 03 // INTELLIGENCE</span>
            </div> -->

            <h2 class="stage-title">
              Cognitive AI & <br class="hide-mobile" />
              <span class="text-gradient-cyan">Autonomous Automation</span>
            </h2>

            <p class="stage-desc">
              Infuse proprietary machine learning models, intelligent workflow bots, and real-time predictive analytics to automate heavy operational burdens.
            </p>
<!-- 
            <div class="feature-pills">
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Custom LLM Integration
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                Autonomous Agents
              </span>
              <span class="feature-pill">
                <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Predictive Analytics
              </span>
            </div> -->

            <!-- <div class="cta-container">
              <a href="contact.html" class="btn-primary-glow">
                <span>REQUEST AI DEMO</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div> -->
          </div>

          <!-- STAGE 4: Transition Outro (0.94 - 1.00) -->
          <div *ngIf="stage4.visible"
               class="stage-card stage-card-compact"
               [style.opacity]="stage4.opacity"
               [style.transform]="stage4.transform">

            <!-- <div class="stage-badge">
              <span class="badge-dot"></span>
              <span>5-STAGE EXECUTION CYCLE</span>
            </div> -->

            <h2 class="stage-title stage-title-sm">
              Explore Our <span class="text-gradient-cyan">Delivery Orbit</span>
            </h2>

            <p class="stage-desc stage-desc-sm">
              Scroll down to review our 5-step service management framework and discover the specialized technical squads ready to power your roadmap.
            </p>

            <a href="#serviceProcess" class="discover-pulse">
              <span>EXPLORE PROCESS</span>
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </a>
          </div>

        </div>

        <!-- Scroll Prompt Mouse Icon -->
        <div class="scroll-indicator-wrap" [style.opacity]="scrollPromptOpacity">
          <div class="scroll-mouse-shell">
            <div class="scroll-wheel-dot"></div>
          </div>
          <span>Scroll to explore capabilities</span>
        </div>

        <!-- Bottom Frame Progress Bar -->
        <div class="hero-progress-track">
          <div class="hero-progress-bar" [style.width.%]="progressPercent"></div>
        </div>

      </div>
    </section>
  `
})
export class ServiceHeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stickyEl') stickyRef!: ElementRef<HTMLDivElement>;

  readonly totalFrames = TOTAL_FRAMES;

  // Scroll tracking values
  progressPercent = 0;
  scrollPromptOpacity = 1;
  activeStageIndex = 0;

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

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.preloadFrames();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.ngZone.runOutsideAngular(() => {
      this.scrollHandler = () => this.onScroll();
      this.resizeHandler = () => this.fitCanvas();
      this.orientationHandler = () => setTimeout(() => this.fitCanvas(), 150);
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      window.addEventListener('resize', this.resizeHandler, { passive: true });
      window.addEventListener('orientationchange', this.orientationHandler);
    });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.orientationHandler) window.removeEventListener('orientationchange', this.orientationHandler);
    cancelAnimationFrame(this.rafId);
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.fitCanvas();
  }

  private fitCanvas(): void {
    if (!this.canvasRef?.nativeElement || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i + 1).padStart(3, '0');
      img.src = `${FRAME_PATH}${num}.webp`;

      img.onload = () => {
        if (i === 0) {
          this.drawFrame(0);
        }
      };

      this.frames[i] = img;
    }
  }

  private onScroll(): void {
    const scrollEl = this.stickyRef?.nativeElement?.parentElement;
    if (!scrollEl) return;

    const rect = scrollEl.getBoundingClientRect();
    const scrollableHeight = scrollEl.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / (scrollableHeight || 1)));

    this.targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
    this.progressPercent = progress * 100;

    // Calculate stage animations
    this.computeStageStates(progress);

    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.renderFrame());

    this.cdr.detectChanges();
  }

  private renderFrame(): void {
    const idx = this.targetFrame;
    if (idx !== this.currentFrameIndex) {
      this.currentFrameIndex = idx;
      this.drawFrame(idx);
    }
  }

  private drawFrame(index: number): void {
    const img = this.frames[index];
    if (!img || !img.complete || !this.ctx) return;

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

    // Stage 0: Brand & Service Menu Intro (0.00 -> 0.20)
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

    // Stage 1: Feature 01 (Web & Cloud Architecture) (0.22 -> 0.44)
    this.stage1 = this.calculateStageState(p, 0.22, 0.44, 0.05);

    // Stage 2: Feature 02 (Mobile & Commerce) (0.46 -> 0.70)
    this.stage2 = this.calculateStageState(p, 0.46, 0.70, 0.05);

    // Stage 3: Feature 03 (Cognitive AI & Automation) (0.72 -> 0.93)
    this.stage3 = this.calculateStageState(p, 0.72, 0.93, 0.05);

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

    // Determine active stage index
    if (p < 0.22) {
      this.activeStageIndex = 0;
    } else if (p < 0.46) {
      this.activeStageIndex = 1;
    } else if (p < 0.72) {
      this.activeStageIndex = 2;
    } else if (p < 0.94) {
      this.activeStageIndex = 3;
    } else {
      this.activeStageIndex = 4;
    }
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeIn(t: number): number {
    return t * t * t;
  }
}
