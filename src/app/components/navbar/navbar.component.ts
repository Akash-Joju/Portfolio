import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavLink {
  label: string;
  id: string; // section id on home page
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :host { display: block; }

    /* ── Base Nav ── */
    .xnav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      transition: padding 0.3s ease, background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
      padding: 1.25rem 0;
      background: transparent;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .xnav.scrolled {
      padding: 0.75rem 0;
      background: rgba(7, 17, 31, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }

    /* ── Inner container ── */
    .xnav__inner {
      max-width: var(--site-max, 80rem);
      margin: 0 auto;
      padding: 0 var(--site-gutter, 1.5rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Logo ── */
    .xnav__logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      cursor: pointer;
    }
    .xnav__logo img {
      height: 3.5rem;
      width: auto;
      object-fit: contain;
      /* logo.png has ~10px of transparent space on its left (600px wide);
         pull it back so the visible logo sits exactly on the content edge */
      margin-left: -0.175rem;
      transition: transform 0.2s ease;
    }
    .xnav__logo:hover img { transform: scale(1.05); }

    /* ── Desktop nav links ── */
    .xnav__links {
      display: none;
      align-items: center;
      gap: 2rem;
    }
    @media (min-width: 768px) { .xnav__links { display: flex; } }

    .xnav__link {
      position: relative;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.25rem 0;
      transition: color 0.2s ease;
      white-space: nowrap;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
    }
    .xnav__link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 2px;
      background: #8a181a;
      box-shadow: 0 0 8px #8a181a;
      border-radius: 2px;
      transition: width 0.25s ease;
    }
    .xnav__link:hover,
    .xnav__link.active {
      color: #ff7d7d;
    }
    .xnav__link:hover::after,
    .xnav__link.active::after {
      width: 100%;
    }

    /* ── Desktop CTA ── */
    .xnav__actions {
      display: none;
      align-items: center;
      gap: 1rem;
    }
    @media (min-width: 768px) { .xnav__actions { display: flex; } }

    .xnav__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      text-decoration: none;
      background: linear-gradient(135deg, #7c1a1a 0%, #8a181a 100%);
      box-shadow: 0 4px 15px rgba(138,24,26,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
      white-space: nowrap;
      cursor: pointer;
      border: none;
    }
    .xnav__cta:hover {
      transform: scale(1.05);
      background: linear-gradient(135deg, #8a181a 0%, #9e1b1d 100%);
      box-shadow: 0 6px 24px rgba(138,24,26,0.55);
    }
    .xnav__cta:active { transform: scale(0.97); }
    .xnav__cta svg {
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    .xnav__cta:hover svg { transform: translateX(3px); }

    /* ── Mobile Toggle ── */
    .xnav__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem; height: 2.5rem;
      border: none;
      background: rgba(255,255,255,0.08);
      border-radius: 0.625rem;
      color: #cbd5e1;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .xnav__toggle:hover { background: rgba(255,255,255,0.15); color: #fff; }
    @media (min-width: 768px) { .xnav__toggle { display: none; } }

    /* ── Mobile Drawer ── */
    .xnav__drawer {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(7, 17, 31, 0.96);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    @media (min-width: 768px) { .xnav__drawer { display: none !important; } }

    .xnav__drawer-link {
      display: block;
      padding: 0.625rem 1rem;
      border-radius: 0.625rem;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      background: none;
      border: none;
      text-align: left;
      width: 100%;
    }
    .xnav__drawer-link:hover,
    .xnav__drawer-link.active {
      background: rgba(138,24,26,0.2);
      color: #ff7d7d;
    }
    .xnav__drawer-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #7c1a1a, #8a181a);
      color: #fff;
      font-size: 0.9375rem;
      font-weight: 600;
      text-decoration: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
      cursor: pointer;
      border: none;
    }
  `],
  template: `
    <nav class="xnav" [class.scrolled]="isScrolled">
      <div class="xnav__inner">

        <!-- Logo -->
        <a class="xnav__logo" (click)="scrollTo('home')" aria-label="Home">
          <img src="assets/images/logo.png" alt="XERXES Limited" />
        </a>

        <!-- Desktop Links -->
        <div class="xnav__links">
          <button
            *ngFor="let link of links"
            type="button"
            class="xnav__link"
            [class.active]="activeSection === link.id"
            (click)="scrollTo(link.id)">
            {{ link.label }}
          </button>
        </div>

        <!-- Desktop CTA -->
        <div class="xnav__actions">
          <button type="button" class="xnav__cta" (click)="scrollTo('contact')">
            <span>Get in Touch</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Toggle -->
        <button class="xnav__toggle" (click)="toggleMenu($event)" aria-label="Toggle menu">
          <svg *ngIf="!isMenuOpen" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg *ngIf="isMenuOpen" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Drawer -->
      <div class="xnav__drawer" *ngIf="isMenuOpen" (click)="$event.stopPropagation()">
        <div style="max-width:var(--site-max,80rem);margin:0 auto;padding:0 var(--site-gutter,1.5rem)">
          <button
            *ngFor="let link of links"
            type="button"
            class="xnav__drawer-link"
            [class.active]="activeSection === link.id"
            (click)="scrollTo(link.id)">
            {{ link.label }}
          </button>
          <button type="button" class="xnav__drawer-cta" (click)="scrollTo('contact')">
            Get in Touch
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  activeSection = 'home';

  /** Section ids must match ids on your home page sections */
  links: NavLink[] = [
    { label: 'Home',     id: 'home' },
    { label: 'About',    id: 'about' },
    { label: 'Skills',   id: 'tech' },
    { label: 'Projects', id: 'projects' },
    // { label: 'Experience', id: 'experience' },
    { label: 'Contact',  id: 'contact' },
  ];

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    // Set initial active section on load
    this.updateActiveSection();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 40;
    this.updateActiveSection();
  }

  /** Smooth scroll to a section by id */
  scrollTo(id: string) {
    this.closeMenu();
    const el = document.getElementById(id);
    if (!el) return;

    // Offset for fixed navbar
    const navHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
    this.activeSection = id;
  }

  toggleMenu(e: Event) {
    e.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() { this.isMenuOpen = false; }

  /** Close drawer when user taps anywhere outside the nav host */
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.isMenuOpen) return;
    if (!this.elRef.nativeElement.contains(e.target as Node)) {
      this.closeMenu();
    }
  }

  /** Highlight whichever section is currently in view */
  private updateActiveSection() {
    const offset = 120;
    let current = this.links[0].id;

    for (const link of this.links) {
      const el = document.getElementById(link.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - offset <= 0) {
        current = link.id;
      }
    }
    this.activeSection = current;
  }
}