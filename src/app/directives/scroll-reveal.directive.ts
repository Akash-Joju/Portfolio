import { Directive, ElementRef, OnInit, OnDestroy, inject, Input } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  @Input() revealThreshold = 0.12;
  @Input() revealRootMargin = '0px 0px -40px 0px';

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              // If the element is a container, also activate child reveal elements
              const children = Array.from(entry.target.querySelectorAll('.reveal-head, .pillar, .detail-row'));
              children.forEach((child: Element) => child.classList.add('is-in'));
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: this.revealThreshold,
          rootMargin: this.revealRootMargin
        }
      );

      const host = this.el.nativeElement as HTMLElement;
      if (host) {
        this.observer.observe(host);

        // Also independently observe child reveal targets for staggered triggers
        const targets = Array.from(host.querySelectorAll('.reveal-head, .pillar, .detail-row'));
        targets.forEach((target: Element) => {
          this.observer?.observe(target);
        });
      }
    } else {
      // Fallback for SSR or non-supporting environments
      const host = this.el.nativeElement as HTMLElement;
      if (host) {
        host.classList.add('is-in');
        const children = Array.from(host.querySelectorAll('.reveal-head, .pillar, .detail-row'));
        children.forEach((c: Element) => c.classList.add('is-in'));
      }
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
