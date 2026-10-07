import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

const TOTAL_FRAMES = 90;
const FRAME_BASE_PATH = 'assets/images/section/ezgif-frame-';
const FRAME_EXTENSION = '.webp';
const PIXELS_PER_FRAME = 28; // pixels of scroll per animation frame advance

@Component({
  selector: 'app-section-background',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
      background: #070d19;
    }

    .bg-scroll-container {
      position: relative;
      width: 100%;
    }

    .bg-sticky-layer {
      position: sticky;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      background: #070d19;
    }

    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      z-index: 0;
    }

    /* Ambient atmospheric overlays for high contrast and rich aesthetic */
    .bg-vignette {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background:
        radial-gradient(ellipse at 50% 50%, rgba(7, 13, 25, 0.42) 0%, rgba(7, 13, 25, 0.78) 70%, #070d19 100%),
        linear-gradient(to bottom, rgba(7, 13, 25, 0.85) 0%, rgba(7, 13, 25, 0.35) 25%, rgba(7, 13, 25, 0.4) 75%, rgba(7, 13, 25, 0.95) 100%);
    }

    .bg-glow-1 {
      position: absolute;
      top: 15%;
      left: 8%;
      width: 45vw;
      height: 45vw;
      max-width: 550px;
      max-height: 550px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(138, 24, 26, 0.15) 0%, transparent 70%);
      filter: blur(70px);
      pointer-events: none;
      z-index: 1;
    }

    .bg-glow-2 {
      position: absolute;
      bottom: 20%;
      right: 6%;
      width: 40vw;
      height: 40vw;
      max-width: 500px;
      max-height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 1;
    }

    .bg-top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      // background: linear-gradient(90deg, transparent, rgba(138, 24, 26, 0.6), rgba(255, 125, 125, 0.4), transparent);
      z-index: 2;
    }

    .bg-content-layer {
      position: relative;
      z-index: 2;
      margin-top: -100vh;
      margin-top: -100dvh;
      pointer-events: auto;
    }
  `],
  template: `
    <div class="bg-scroll-container" #containerEl>
      <!-- Sticky Background Canvas Viewport -->
      <div class="bg-sticky-layer" #stickyEl>
        <div class="bg-top-accent"></div>
        <canvas #canvasEl></canvas>
        <div class="bg-vignette"></div>
        <div class="bg-glow-1"></div>
        <div class="bg-glow-2"></div>
      </div>

      <!-- Foreground Content Layer -->
      <div class="bg-content-layer">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SectionBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('containerEl', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasEl', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
  private currentFrameIndex = 0;
  private targetFrameIndex = 0;
  private isDestroyed = false;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.preloadFrames();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false });

    this.ngZone.runOutsideAngular(() => {
      this.resizeCanvas();
      this.drawFrame(0);

      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.resizeCanvas();
          this.drawFrame(this.currentFrameIndex);
        });
        this.resizeObserver.observe(this.canvasRef.nativeElement);
      }

      this.startRenderLoop();
    });
  }

  private preloadFrames(): void {
    // Load only the first frame immediately so the canvas has something to show
    this.loadSingleFrame(0).then(() => {
      this.drawFrame(0);
    });

    // Defer the rest until the section is close to the viewport
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.loadRemainingFrames();
        }
      }, { rootMargin: '600px 0px' }); // start loading 600px before it scrolls into view
      observer.observe(this.containerRef.nativeElement);
    } else {
      // Fallback: start loading after a delay
      setTimeout(() => this.loadRemainingFrames(), 2000);
    }
  }

  /**
   * Loads frames 1–179 in small batches (max 4 concurrent requests)
   * to avoid overwhelming the browser's connection pool.
   */
  private async loadRemainingFrames(): Promise<void> {
    const BATCH_SIZE = 4;
    for (let i = 1; i < TOTAL_FRAMES; i += BATCH_SIZE) {
      if (this.isDestroyed) return;
      const batch: Promise<void>[] = [];
      for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) {
        batch.push(this.loadSingleFrame(j));
      }
      await Promise.all(batch);
    }
  }

  private loadSingleFrame(index: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.images[index]) { resolve(); return; }
      const img = new Image();
      const frameNum = String(index + 1).padStart(3, '0');
      img.src = `${FRAME_BASE_PATH}${frameNum}${FRAME_EXTENSION}`;
      img.onload = () => {
        this.images[index] = img;
        if (this.currentFrameIndex === index) {
          this.drawFrame(index);
        }
        resolve();
      };
      img.onerror = () => resolve(); // skip broken frames gracefully
    });
  }

  private onScroll = (): void => {
    if (!this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();

    // Start advancing frames once container enters viewport
    // rect.top is the distance from viewport top to container top
    const scrolledPx = Math.max(0, -rect.top);

    // Continuous looping calculation:
    // When all 180 frames finish, modulo arithmetic wraps smoothly back to frame 0
    const rawFrame = Math.floor(scrolledPx / PIXELS_PER_FRAME);
    this.targetFrameIndex = ((rawFrame % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
  };

  private onResize = (): void => {
    this.resizeCanvas();
    this.drawFrame(this.currentFrameIndex);
  };

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.isDestroyed) return;

      // Smooth interpolation towards target frame
      if (this.currentFrameIndex !== this.targetFrameIndex) {
        // Find shortest path considering looping around the 0-179 boundary
        let diff = this.targetFrameIndex - this.currentFrameIndex;
        if (diff > TOTAL_FRAMES / 2) {
          diff -= TOTAL_FRAMES;
        } else if (diff < -TOTAL_FRAMES / 2) {
          diff += TOTAL_FRAMES;
        }

        if (Math.abs(diff) <= 1) {
          this.currentFrameIndex = this.targetFrameIndex;
        } else {
          // Advance smoothly
          const step = Math.sign(diff) * Math.max(1, Math.min(4, Math.round(Math.abs(diff) * 0.35)));
          this.currentFrameIndex = ((this.currentFrameIndex + step) % TOTAL_FRAMES + TOTAL_FRAMES) % TOTAL_FRAMES;
        }

        this.drawFrame(this.currentFrameIndex);
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private drawFrame(index: number): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    if (canvasW === 0 || canvasH === 0) return;

    let img = this.images[index];
    // Fallback to nearest loaded frame if current frame is still loading
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = ((index - offset) % TOTAL_FRAMES + TOTAL_FRAMES) % TOTAL_FRAMES;
        if (this.images[prev] && this.images[prev]?.complete && this.images[prev]?.naturalWidth !== 0) {
          img = this.images[prev];
          break;
        }
        const next = (index + offset) % TOTAL_FRAMES;
        if (this.images[next] && this.images[next]?.complete && this.images[next]?.naturalWidth !== 0) {
          img = this.images[next];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = '#070d19';
      ctx.fillRect(0, 0, canvasW, canvasH);
      return;
    }

    // Cover algorithm: preserve aspect ratio and center image
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const imgRatio = imgW / imgH;
    const canvasRatio = canvasW / canvasH;

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number;

    if (canvasRatio > imgRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawH = canvasH;
      drawW = canvasH * imgRatio;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.images = [];
  }
}
