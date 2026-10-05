import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TechCard {
  targetValue: number;
  displayValue: string;
  label: string;
  techStack: string;
  subtext: string;
  iconBg: string;
  textColorClass: string;
  borderColorClass: string;
  bottomGlowClass: string;
  svgPath: string;
  delayMs: number;
  accentColor: string;
  glowColor: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :host {
      display: block;
      width: 100%;
    }

    .stats-section {
      position: relative;
      padding: clamp(4.5rem, 8vw, 6.5rem) 0;
      background-color: transparent;
      color: #fff;
      overflow: hidden;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    /* Ambient Glows */
    .stats-ambient {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(138, 24, 26, 0.12) 0%, rgba(101, 26, 25, 0.08) 50%, transparent 80%);
      pointer-events: none;
    }

    .stats-glow-left {
      position: absolute;
      top: 20%;
      left: -5%;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      background: rgba(138, 24, 26, 0.14);
      filter: blur(110px);
      pointer-events: none;
    }

    .stats-glow-right {
      position: absolute;
      bottom: 10%;
      right: -5%;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      background: rgba(101, 26, 25, 0.12);
      filter: blur(120px);
      pointer-events: none;
    }

    /* Layout Container */
    .stats-container {
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 clamp(1.25rem, 4vw, 2.5rem);
      position: relative;
      z-index: 10;
    }

    /* Section Header */
    .stats-header {
      text-align: center;
      max-width: 44rem;
      margin: 0 auto clamp(2.5rem, 5vw, 3.75rem);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
    }

    .stats-header.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .stats-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1.1rem;
      border-radius: 9999px;
      background: rgba(138, 24, 26, 0.15);
      border: 1px solid rgba(138, 24, 26, 0.4);
      color: #ff7d7d;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin-bottom: 0.85rem;
    }

    .stats-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #8a181a;
      box-shadow: 0 0 8px #8a181a;
    }

    .stats-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
      color: #ffffff;
      margin: 0;
    }

    .stats-title-gradient {
      background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 50%, #7c1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* 4-Card Grid — 4 cols desktop, 2 cols tablet, 1 col mobile */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(1rem, 2.5vw, 2rem);
      align-items: stretch;
      perspective: 1200px;
    }

    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    /* ============ 3D MOTION KEYFRAMES ============ */
    @keyframes statTilt3D {
      0%, 100% {
        transform: rotateX(7deg) rotateY(-6deg) translateY(0px) translateZ(0px);
      }
      25% {
        transform: rotateX(-5deg) rotateY(7deg) translateY(-10px) translateZ(14px);
      }
      50% {
        transform: rotateX(-9deg) rotateY(-6deg) translateY(-16px) translateZ(22px);
      }
      75% {
        transform: rotateX(6deg) rotateY(8deg) translateY(-7px) translateZ(10px);
      }
    }

    @keyframes laserScan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(180%); }
    }

    /* Stat Card Wrap with 3D perspective */
    .stat-box-wrap {
      position: relative;
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.7s ease, transform 0.7s ease;
      height: 100%;
      min-width: 0;
      perspective: 1200px;
    }

    .stat-box-wrap.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Continuous 3D tilt animation loop */
    .stat-box-wrap.is-visible .stat-box {
      animation: statTilt3D 7.5s ease-in-out infinite;
    }

    .stat-box-wrap:nth-child(1) .stat-box { animation-delay: 0s; }
    .stat-box-wrap:nth-child(2) .stat-box { animation-delay: -1.8s; }
    .stat-box-wrap:nth-child(3) .stat-box { animation-delay: -3.6s; }
    .stat-box-wrap:nth-child(4) .stat-box { animation-delay: -5.4s; }

    @media (prefers-reduced-motion: reduce) {
      .stat-box-wrap.is-visible .stat-box { animation: none; }
      .stat-laser-beam::after { animation: none; }
    }

    /* Thick 3D Bezel & Multi-layer Depth */
    .stat-box {
      position: relative;
      z-index: 2;
      border-radius: 1.75rem;
      padding: clamp(1.6rem, 2.6vw, 2.2rem);
      border: 3.5px solid transparent;
      background-image:
        linear-gradient(160deg, rgba(14,28,56,.85) 0%, rgba(9,18,38,.92) 55%, rgba(16,22,46,.9) 100%),
        linear-gradient(140deg, var(--stat-accent, #ff7d7d), rgba(255,255,255,0.4) 30%, var(--stat-glow, rgba(138,24,26,0.8)) 60%, var(--stat-accent, #ff7d7d));
      background-origin: border-box;
      background-clip: padding-box, border-box;
      box-shadow:
        0 30px 70px -15px rgba(0, 0, 0, 0.95),
        0 0 35px -5px var(--stat-glow, rgba(255, 125, 125, 0.35)),
        inset 0 2px 3px rgba(255,255,255,0.25),
        inset 0 -10px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      height: 100%;
      transform-style: preserve-3d;
      will-change: transform;
      transition: box-shadow 0.35s ease, border-color 0.35s ease;
    }

    /* Laser light beam sweeping continuously across top edge */
    .stat-laser-beam {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      overflow: hidden;
      z-index: 4;
      pointer-events: none;
    }

    .stat-laser-beam::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 55%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--stat-accent, #ff7d7d), #ffffff, var(--stat-accent, #ff7d7d), transparent);
      animation: laserScan 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .stat-box-wrap:nth-child(2) .stat-laser-beam::after { animation-delay: 0.8s; }
    .stat-box-wrap:nth-child(3) .stat-laser-beam::after { animation-delay: 1.6s; }
    .stat-box-wrap:nth-child(4) .stat-laser-beam::after { animation-delay: 2.4s; }

    /* Tech Corner Brackets */
    .stat-box::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 1.5rem;
      padding: 1px;
      background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 40%, transparent 60%, rgba(255,255,255,0.15));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      pointer-events: none;
    }

    .stat-box:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 28px 60px -15px rgba(0, 0, 0, 0.9), 0 0 28px -5px var(--stat-glow, rgba(255, 125, 125, 0.4));
    }

    /* Card Top Bar with 3D Pop */
    .stat-box-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      transform: translateZ(32px);
    }

    .stat-icon-wrap {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease;
    }

    .stat-box:hover .stat-icon-wrap {
      transform: scale(1.08);
    }

    .stat-icon-wrap svg {
      width: 1.625rem;
      height: 1.625rem;
    }

    .stat-badge-verified {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.3rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Counter Number with 3D Pop */
    .stat-counter-number {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.35rem, 3.5vw, 3.15rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 0.6rem;
      transform: translateZ(48px);
      text-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
    }

    /* Color variations */
    .text-cyan {
      background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text-blue {
      background: linear-gradient(135deg, #ff7d7d 0%, #7c1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text-gold {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text-emerald {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .bg-cyan-icon {
      background: rgba(138, 24, 26, 0.15);
      color: #ff7d7d;
      border: 1px solid rgba(138, 24, 26, 0.35);
    }

    .bg-blue-icon {
      background: rgba(124, 26, 26, 0.15);
      color: #ff7d7d;
      border: 1px solid rgba(124, 26, 26, 0.35);
    }

    .bg-orange-icon {
      background: rgba(101, 26, 25, 0.15);
      color: #ff7d7d;
      border: 1px solid rgba(101, 26, 25, 0.35);
    }

    .bg-emerald-icon {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Card Label & Subtext */
    .stat-label {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: #ffffff;
      margin: 0 0 0.35rem;
      transition: color 0.2s ease;
    }

    .stat-box:hover .stat-label {
      color: #ff7d7d;
    }

    /* Tech stack line — subtle, monospace-ish accent */
    .stat-tech-stack {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #ff7d7d;
      margin: 0 0 0.55rem;
      opacity: 0.92;
    }

    .stat-subtext {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.8125rem;
      line-height: 1.55;
      color: #94a3b8;
      margin: 0;
    }

    /* Bottom Glow Line */
    .stat-bottom-line {
      position: absolute;
      bottom: 0;
      left: 1.5rem;
      right: 1.5rem;
      height: 2px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-box:hover .stat-bottom-line {
      opacity: 1;
    }

    .glow-cyan {
      background: linear-gradient(90deg, transparent, rgba(138, 24, 26, 0.8), transparent);
    }

    .glow-blue {
      background: linear-gradient(90deg, transparent, rgba(124, 26, 26, 0.8), transparent);
    }

    .line-orange {
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.7), transparent);
    }

    .line-emerald {
      background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.7), transparent);
    }

    /* ============ RESPONSIVE OVERRIDES (must stay after base rules) ============ */
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
      .stat-box-wrap { height: auto; }
      .stat-box { border-width: 2.5px; border-radius: 1.4rem; }
      .stat-box-top { margin-bottom: 1rem; }
      .stat-label { font-size: 1.05rem; }
      .stat-tech-stack { overflow-wrap: anywhere; }
      /* gentler tilt so cards never push past the screen edge */
      .stat-box-wrap.is-visible .stat-box { animation-name: statTiltMobile; }
    }

    @media (max-width: 380px) {
      .stat-box { padding: 1.35rem 1.15rem; }
      .stat-icon-wrap { width: 2.75rem; height: 2.75rem; }
      .stat-icon-wrap svg { width: 1.4rem; height: 1.4rem; }
      .stat-counter-number { font-size: 2.1rem; }
      .stat-subtext { font-size: 0.78rem; }
    }

    @keyframes statTiltMobile {
      0%, 100% { transform: rotateX(2deg) rotateY(-2deg) translateY(0); }
      50%      { transform: rotateX(-2deg) rotateY(2deg) translateY(-6px); }
    }
  `],
  template: `
    <section #statsSection class="stats-section" id="tech">
      <!-- Ambient Glows -->
      <div class="stats-ambient" aria-hidden="true"></div>
      <div class="stats-glow-left" aria-hidden="true"></div>
      <div class="stats-glow-right" aria-hidden="true"></div>

      <div class="stats-container">
        <!-- Section Header -->
        <div class="stats-header" [class.is-visible]="hasAppeared">
          <div class="stats-badge">
            <span class="stats-badge-dot" aria-hidden="true"></span>
            <span>Technical Expertise</span>
          </div>
          <h2 class="stats-title">
            Built With <span class="stats-title-gradient">Modern Technologies</span>
          </h2>
        </div>

        <!-- 4 Technology Cards Grid -->
        <div class="stats-grid">
          <div
            *ngFor="let stat of stats; let i = index"
            class="stat-box-wrap"
            [class.is-visible]="hasAppeared"
            [style.transition-delay]="stat.delayMs + 'ms'">

            <div class="stat-box"
                 [style.--stat-accent]="stat.accentColor"
                 [style.--stat-glow]="stat.glowColor">

              <!-- Top Laser Light Beam -->
              <div class="stat-laser-beam" aria-hidden="true"></div>

              <!-- Card Top: Icon & Badge -->
              <div class="stat-box-top">
                <div class="stat-icon-wrap" [ngClass]="stat.iconBg">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" [attr.d]="stat.svgPath" />
                  </svg>
                </div>
                <span class="stat-badge-verified">Expert</span>
              </div>

              <!-- Big Category Number (01, 02, 03, 04) -->
              <div class="stat-counter-number" [ngClass]="stat.textColorClass">
                {{ stat.displayValue }}
              </div>

              <!-- Label + Tech Stack + Description -->
              <div>
                <h3 class="stat-label">{{ stat.label }}</h3>
                <p class="stat-tech-stack">{{ stat.techStack }}</p>
                <p class="stat-subtext">{{ stat.subtext }}</p>
              </div>

              <!-- Bottom Accent Glow -->
              <div class="stat-bottom-line" [ngClass]="stat.bottomGlowClass" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class StatsComponent implements OnInit, OnDestroy {
  @ViewChild('statsSection', { static: true }) statsSection!: ElementRef;

  private observer!: IntersectionObserver;
  private hasAnimated = false;
  hasAppeared = false;

  stats: TechCard[] = [
    {
      targetValue: 1,
      displayValue: '01',
      label: 'Frontend',
      techStack: 'Angular • React • TypeScript',
      subtext: 'Modern, responsive interfaces and component-driven applications',
      iconBg: 'bg-cyan-icon',
      textColorClass: 'text-cyan',
      borderColorClass: 'rgba(6, 182, 212, 0.22)',
      bottomGlowClass: 'glow-cyan',
      delayMs: 100,
      accentColor: '#ff7d7d',
      glowColor: 'rgba(255,125,125,0.4)',
      svgPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      targetValue: 2,
      displayValue: '02',
      label: 'Backend',
      techStack: 'Node.js • Express.js • REST APIs',
      subtext: 'Scalable APIs and reliable server-side architecture',
      iconBg: 'bg-blue-icon',
      textColorClass: 'text-cyan',
      borderColorClass: 'rgba(37, 99, 235, 0.22)',
      bottomGlowClass: 'glow-blue',
      delayMs: 200,
      accentColor: '#38bdf8',
      glowColor: 'rgba(56,189,248,0.4)',
      svgPath: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
    },
    {
      targetValue: 3,
      displayValue: '03',
      label: 'Database',
      techStack: 'MongoDB • MySQL • Firebase',
      subtext: 'Structured, scalable and efficient data solutions',
      iconBg: 'bg-orange-icon',
      textColorClass: 'text-gold',
      borderColorClass: 'rgba(249, 115, 22, 0.22)',
      bottomGlowClass: 'line-orange',
      delayMs: 300,
      accentColor: '#fbbf24',
      glowColor: 'rgba(251,191,36,0.4)',
      svgPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
    },
    {
      targetValue: 4,
      displayValue: '04',
      label: 'AI & ML',
      techStack: 'Python • TensorFlow • Keras',
      subtext: 'Intelligent solutions powered by data and machine learning',
      iconBg: 'bg-emerald-icon',
      textColorClass: 'text-emerald',
      borderColorClass: 'rgba(16, 185, 129, 0.22)',
      bottomGlowClass: 'line-emerald',
      delayMs: 400,
      accentColor: '#34d399',
      glowColor: 'rgba(52,211,153,0.4)',
      svgPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.hasAppeared = true;
            this.startCountAnimation();
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      this.observer.observe(this.statsSection.nativeElement);
    } else {
      // Fallback
      this.hasAppeared = true;
      this.stats.forEach(stat => {
        stat.displayValue = this.pad(stat.targetValue);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /** Zero-pads the category number (1 → "01"). */
  private pad(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

  private startCountAnimation(): void {
    const duration = 1400; // slightly quicker — cards are labels now
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.stats.forEach(stat => {
        // Counting up 0 → 1 … 0 → 4, padded to 2 digits → "00" → "01" … "04"
        const currentCount = Math.floor(easeProgress * stat.targetValue);
        stat.displayValue = this.pad(currentCount);
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.stats.forEach(stat => {
          stat.displayValue = this.pad(stat.targetValue);
        });
      }
    };

    requestAnimationFrame(step);
  }
}