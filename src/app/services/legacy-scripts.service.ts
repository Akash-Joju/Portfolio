import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LegacyScriptsService {
  private loaded: HTMLScriptElement[] = [];

  async load(sources: string[]): Promise<void> {
    this.unload();
    for (const src of sources) {
      await this.append(src);
    }
  }

  unload(): void {
    for (const script of this.loaded) script.remove();
    this.loaded = [];
  }

  private append(src: string): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      if (src.endsWith('script.js') || src.endsWith('contact-portal.js') || src.endsWith('services-portal.js')) {
        script.type = 'module';
      }
      script.dataset['angularLegacy'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => { console.error(`Failed to load ${src}`); resolve(); };
      document.body.appendChild(script);
      this.loaded.push(script);
    });
  }
}
