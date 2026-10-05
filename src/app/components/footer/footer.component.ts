import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-nav',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :host { display: block; }

    .site-footer {
      position: relative;
      overflow: hidden;
      padding: clamp(3.5rem, 6vw, 5rem) 0 2rem;
      background: linear-gradient(180deg, #030814 0%, #05101f 60%, #030814 100%);
      color: #e6eefb;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* decorative */
    .sf-top-line {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 125, 125, 0.6) 50%, transparent);
      box-shadow: 0 0 24px rgba(255, 125, 125, 0.4);
    }
    .sf-grid-bg {
      position: absolute; inset: 0; pointer-events: none; opacity: .28;
      background-size: 46px 46px;
      background-image:
        linear-gradient(to right,  rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,.03) 1px, transparent 1px);
      -webkit-mask-image: radial-gradient(70% 70% at 50% 30%, #000 30%, transparent 100%);
              mask-image: radial-gradient(70% 70% at 50% 30%, #000 30%, transparent 100%);
    }
    .sf-glow {
      position: absolute; width: 380px; height: 380px;
      border-radius: 50%; filter: blur(110px);
      pointer-events: none;
    }
    .sf-glow--a { top: -20%; left: -8%;  background: rgba(138, 24, 26, 0.20); }
    .sf-glow--b { bottom: -30%; right: -8%; background: rgba(124, 26, 26, 0.18); }

    .sf-inner {
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 clamp(1.25rem, 4vw, 2.5rem);
      position: relative;
      z-index: 2;
    }

    /* grid */
    .sf-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1.3fr 1.2fr;
      gap: clamp(2rem, 4vw, 3rem);
    }
    @media (max-width: 1024px) { .sf-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px)  { .sf-grid { grid-template-columns: 1fr; gap: 2rem; } }

    /* brand */
    .sf-brand { display: flex; flex-direction: column; gap: 1rem; }

    .sf-logo {
      display: inline-flex;
      align-items: center;
      gap: .75rem;
      text-decoration: none;
      color: #fff;
      cursor: pointer;
    }
  .sf-logo__mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff7d7d 0%, #8a181a 60%, #7c1a1a 100%);
  box-shadow: 0 6px 20px -6px rgba(138, 24, 26, 0.75),
              0 0 18px -6px rgba(255, 125, 125, 0.55),
              inset 0 1px 0 rgba(255, 255, 255, 0.18);
  overflow: hidden;
  flex: 0 0 auto;
  transition: transform .25s ease, box-shadow .25s ease;
}
.sf-logo__mark img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  display: block;
  border: 2px solid #030814;
}
.sf-logo:hover .sf-logo__mark {
  transform: scale(1.06);
  box-shadow: 0 8px 26px -6px rgba(138, 24, 26, 0.95),
              0 0 26px -6px rgba(255, 125, 125, 0.75),
              inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
    .sf-logo__text {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -.01em;
    }
    .sf-logo__text span { color: #ff7d7d; }

    .sf-tagline {
      margin: 0;
      color: #94a3b8;
      font-size: .9rem;
      line-height: 1.7;
      max-width: 32ch;
    }

    .sf-badge {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .35rem .85rem;
      border-radius: 999px;
      background: rgba(138, 24, 26, 0.15);
      border: 1px solid rgba(138, 24, 26, 0.4);
      color: #ff7d7d;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      width: fit-content;
    }
    .sf-badge__dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #ff7d7d;
      box-shadow: 0 0 8px #ff7d7d;
      animation: sf-pulse 2s ease-in-out infinite;
    }
    @keyframes sf-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: .6; transform: scale(.85); }
    }

    /* columns */
    .sf-col { display: flex; flex-direction: column; gap: 1rem; }

    .sf-col__title {
      margin: 0;
      font-family: 'Outfit', sans-serif;
      font-size: .82rem;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #fff;
      position: relative;
      padding-bottom: .75rem;
    }
    .sf-col__title::after {
      content: '';
      position: absolute;
      left: 0; bottom: 0;
      width: 28px; height: 2px;
      background: #ff2244;
      box-shadow: 0 0 10px rgba(255, 34, 68, 0.8);
      border-radius: 2px;
    }

    .sf-list {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-direction: column;
      gap: .65rem;
    }

    .sf-link {
      display: inline-flex;
      align-items: center;
      gap: .65rem;
      text-decoration: none;
      color: #cbd5e1;
      font-size: .875rem;
      font-weight: 500;
      transition: color .2s ease, transform .2s ease;
      cursor: pointer;
      word-break: break-word;
    }
    .sf-link:hover { color: #ff7d7d; transform: translateX(3px); }

    .sf-link__arrow,
    .sf-link__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: #ff7d7d;
    }
    .sf-link__arrow svg,
    .sf-link__icon svg { width: .95rem; height: .95rem; }

    .sf-link__icon {
      width: 1.85rem; height: 1.85rem;
      border-radius: .55rem;
      background: rgba(138, 24, 26, 0.15);
      border: 1px solid rgba(138, 24, 26, 0.32);
      transition: background .2s ease, border-color .2s ease;
    }
    .sf-link:hover .sf-link__icon {
      background: rgba(138, 24, 26, 0.3);
      border-color: rgba(255, 125, 125, 0.5);
    }

    /* tech chips */
    .sf-chips {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .sf-chip {
      display: inline-block;
      padding: .35rem .75rem;
      border-radius: 999px;
      font-size: .72rem;
      font-weight: 600;
      letter-spacing: .02em;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.09);
      transition: color .2s ease, border-color .2s ease, background .2s ease;
    }
    .sf-chip:hover {
      color: #ff7d7d;
      border-color: rgba(255, 125, 125, 0.4);
      background: rgba(138, 24, 26, 0.12);
    }

    /* bottom */
    .sf-bottom {
      margin-top: clamp(2.5rem, 5vw, 3.5rem);
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .sf-copy {
      margin: 0;
      font-size: .82rem;
      color: #94a3b8;
    }
    .sf-copy strong { color: #fff; font-weight: 600; }

    .sf-top {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .55rem 1.1rem;
      border-radius: .75rem;
      border: 1px solid rgba(255, 125, 125, 0.35);
      background: rgba(138, 24, 26, 0.12);
      color: #ff7d7d;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: .8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
    }
    .sf-top:hover {
      background: rgba(138, 24, 26, 0.25);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -10px rgba(255, 125, 125, 0.5);
    }
    .sf-top svg { width: .95rem; height: .95rem; }

    @media (max-width: 640px) {
      .sf-bottom { flex-direction: column-reverse; align-items: flex-start; }
    }
  `],
  template: `
    <footer class="site-footer">
      <!-- decorative layers -->
      <div class="sf-grid-bg" aria-hidden="true"></div>
      <div class="sf-glow sf-glow--a" aria-hidden="true"></div>
      <div class="sf-glow sf-glow--b" aria-hidden="true"></div>
      <div class="sf-top-line" aria-hidden="true"></div>

      <div class="sf-inner">

        <!-- ============ TOP GRID ============ -->
        <div class="sf-grid">

          <!-- Brand -->
          <div class="sf-brand">
            <a class="sf-logo" (click)="scrollTo($event, '#home')" href="#home">
  <span class="sf-logo__mark">
    <img src="assets/images/profile.jpeg" alt="Akash Joju" />
  </span>
  <span class="sf-logo__text">Akash<span>.</span>Joju</span>
</a>
            <p class="sf-tagline">
              Full-stack developer &amp; designer crafting fast, thoughtful
              digital products — from IoT systems to AI-powered tools.
            </p>
            <div class="sf-badge">
              <span class="sf-badge__dot" aria-hidden="true"></span>
              <span>Available for work</span>
            </div>
          </div>

          <!-- Quick Links -->
          <nav class="sf-col" aria-label="Quick links">
            <h3 class="sf-col__title">Explore</h3>
            <ul class="sf-list">
              <li *ngFor="let l of quickLinks">
                <a class="sf-link" [href]="l.href" (click)="scrollTo($event, l.href)">
                  <span class="sf-link__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>{{ l.label }}</span>
                </a>
              </li>
            </ul>
          </nav>

          <!-- Contact -->
          <div class="sf-col">
            <h3 class="sf-col__title">Get in Touch</h3>
            <ul class="sf-list">

              <li>
                <a class="sf-link"
                   [href]="'mailto:' + email"
                   (click)="openContact($event, 'mailto:' + email)">
                  <span class="sf-link__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                      <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>{{ email }}</span>
                </a>
              </li>

              <li>
                <a class="sf-link"
                   [href]="'tel:' + phoneRaw"
                   (click)="openContact($event, 'tel:' + phoneRaw)">
                  <span class="sf-link__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 4h3l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"
                            stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>{{ phone }}</span>
                </a>
              </li>

              <li>
                <a class="sf-link"
                   [href]="linkedin"
                   target="_blank"
                   rel="noopener noreferrer"
                   (click)="openExternal($event, linkedin)">
                  <span class="sf-link__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/>
                      <path d="M7.5 10.5v6M7.5 7.75v.01M11 16.5v-3.25a2 2 0 114 0v3.25M11 10.5v6"
                            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>linkedin.com/in/akash-joju</span>
                </a>
              </li>

            </ul>
          </div>

          <!-- Tech stack -->
          <div class="sf-col">
            <h3 class="sf-col__title">Built With</h3>
            <ul class="sf-chips">
              <li *ngFor="let t of techStack" class="sf-chip">{{ t }}</li>
            </ul>
          </div>

        </div>

        <!-- ============ BOTTOM BAR ============ -->
        <div class="sf-bottom">
          <p class="sf-copy">
            © {{ year }} <strong>Akash Joju</strong>. All rights reserved.
          </p>

          <button class="sf-top" type="button" (click)="scrollTo($event, '#home')" aria-label="Back to top">
            <span>Back to top</span>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </footer>
  `
})
export class FooterNavComponent {
  readonly year = new Date().getFullYear();

  readonly email = 'akashjoju9@gmail.com';
  readonly phone = '+91 9846229603';
  readonly phoneRaw = '+919846229603';
  readonly linkedin = 'https://www.linkedin.com/in/akash-joju/';

  readonly quickLinks = [
    { label: 'Home',     href: '#home'     },
    { label: 'About',    href: '#about'    },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills',   href: '#tech'     },
    { label: 'Contact',  href: '#contact'  },
  ];

  readonly techStack = [
    'Angular', 'React', 'TypeScript', 'Node.js',
    'Python', 'TensorFlow', 'MongoDB', 'Three.js'
  ];

  /** Smooth-scroll to a section id. */
  scrollTo(e: Event, id: string): void {
    e.preventDefault();
    const el = document.getElementById(id.replace('#', ''));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /** Opens any external link in a new tab — bypasses overlay/tilt issues. */
  openExternal(e: Event, url: string): void {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** For mailto: and tel: — lets the OS pick the right app. */
  openContact(e: Event, url: string): void {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = url;
  }
}