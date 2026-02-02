interface Particle {
  x: number;
  y: number;
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  char: "0" | "1";
  toggleInterval?: number;
  toggleCounter?: number;
}

interface RainColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  charIndex: number;
}

export class ImageParticle {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private pointer = { x: null as number | null, y: null as number | null, radius: 20 };

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private image: HTMLImageElement;

  private width = 0;
  private height = 0;
  private dpr = window.devicePixelRatio || 1;

  private drawW = 0;
  private drawH = 0;
  private offX = 0;
  private offY = 0;

  private frame = 0;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver;

  private readonly gap = 6;

  private rainColumns: RainColumn[] = [];
  private rainFontSize = 10;
  private rainColsCount = 0;

  private rainText = "FRANKLYN BENSI";
  private baseRainSpeed = 2;
  private glitchChars = "@#$%&*+=-:/\\[]{}<>!";

  private defaultRainColor = { r: 0, g: 255, b: 70 };
  private rainCurrentColor = { r: 0, g: 255, b: 70 };
  private pointerColorTarget: { r: number; g: number; b: number } | null = null;

  private rainAlpha = 0;
  private readonly fadeSpeed = 0.04;
  private readonly detectionRadius = 45;

  private audio: HTMLAudioElement | null = null;
  private audioStarted = false;

  private isGlitchEnabled: boolean = true;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    audioSrc: string,
  ) {
    this.container = container;
    this.canvas = canvas;
    this.image = image;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;

    this.initAudio(audioSrc);
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.init();
  }

  public setGlitch(state: boolean): void {
    this.isGlitchEnabled = state;
  }

  private initAudio(src: string): void {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = 0;
  }

  private async init(): Promise<void> {
    if (!this.image.complete || this.image.naturalWidth === 0) {
      await this.image.decode();
    }
    this.resizeObserver.observe(this.container);
    this.bindPointer();
  }

  private onResize(): void {
    const r = this.container.getBoundingClientRect();
    if (!r.width || !r.height) return;

    this.width = r.width;
    this.height = r.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fitImage();

    if (!this.particles.length) {
      this.createParticles();
    } else {
      this.scatterParticles();
    }
    this.createRain();
  }

  private fitImage(): void {
    const iw = this.image.naturalWidth;
    const ih = this.image.naturalHeight;
    const s = Math.min(this.width / iw, this.height / ih);
    this.drawW = iw * s;
    this.drawH = ih * s;
    this.offX = (this.width - this.drawW) / 2;
    this.offY = (this.height - this.drawH) / 2;
  }

  private createParticles(): void {
    const off = document.createElement("canvas");
    off.width = this.image.naturalWidth;
    off.height = this.image.naturalHeight;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    offCtx.drawImage(this.image, 0, 0);
    const data = offCtx.getImageData(0, 0, off.width, off.height).data;

    const triangleHeight = off.height;
    const triangleMidX = off.width / 2;
    const sunCenter = { x: triangleMidX, y: triangleHeight / 1.2 };
    const sunRadius = off.width * 0.06;
    const rayLength = sunRadius * 1.4;
    const starOuterRadius = sunRadius * 0.7;
    const starInnerRadius = starOuterRadius * 0.45;
    const starOffset = sunRadius * 3.4;
    const stars = [
      { x: sunCenter.x, y: sunCenter.y - starOffset },
      { x: sunCenter.x - starOffset, y: sunCenter.y },
      { x: sunCenter.x + starOffset, y: sunCenter.y },
    ];

    const isInsideStar = (px: number, py: number, cx: number, cy: number, outerR: number, innerR: number) => {
      const dx = px - cx, dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > outerR) return false;
      const angle = Math.atan2(dy, dx);
      const sector = ((angle + Math.PI) / (2 * Math.PI)) * 10;
      return dist < (Math.floor(sector) % 2 === 0 ? outerR : innerR);
    };

    for (let y = 0; y < off.height; y += this.gap) {
      for (let x = 0; x < off.width; x += this.gap) {
        const i = (y * off.width + x) * 4;
        if (data[i + 3] / 255 <= 0.5) continue;

        let r = data[i], g = data[i + 1], b = data[i + 2];
        let pAlpha = 0.2;

        if (y < triangleHeight) {
          const triHalf = ((triangleHeight - y) / triangleHeight) * triangleMidX;
          if (x < triangleMidX - triHalf) { r = 0; g = 56; b = 168; pAlpha = 0.35; }
          else if (x > triangleMidX + triHalf) { r = 206; g = 17; b = 38; pAlpha = 0.35; }
          else { r = 255; g = 255; b = 255; pAlpha = 0.2; }

          const dxS = x - sunCenter.x, dyS = y - sunCenter.y;
          const dS = Math.sqrt(dxS * dxS + dyS * dyS);
          if (dS < sunRadius) { r = 255; g = 215; b = 0; pAlpha = 1; }
          else if (dS < sunRadius + rayLength) {
            const angle = Math.atan2(dyS, dxS);
            const step = (Math.PI * 2) / 8;
            const snap = Math.round(angle / step) * step;
            if (Math.abs(angle - snap) < step / 10) { r = 255; g = 215; b = 0; pAlpha = 0.8; }
          }
          for (const s of stars) if (isInsideStar(x, y, s.x, s.y, starOuterRadius, starInnerRadius)) { r = 255; g = 215; b = 0; pAlpha = 1; }
        } else {
          if (x < triangleMidX) { r = 0; g = 56; b = 168; pAlpha = 0.35; }
          else { r = 206; g = 17; b = 38; pAlpha = 0.35; }
        }

        const blend = (c1: number, c2: number, a: number) => Math.round(c1 * (1 - a) + c2 * a);
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          nx: x / off.width, ny: y / off.height,
          vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
          r: Math.min(255, blend(data[i], r, pAlpha) * 1.5),
          g: Math.min(255, blend(data[i + 1], g, pAlpha) * 1.5),
          b: Math.min(255, blend(data[i + 2], b, pAlpha) * 1.5),
          char: Math.random() > 0.5 ? "1" : "0",
          toggleInterval: 3 + Math.random() * 10,
          toggleCounter: Math.random() * 10
        });
      }
    }
    this.animate();
  }

  private scatterParticles(): void {
    for (const p of this.particles) {
      p.x = Math.random() * this.width; p.y = Math.random() * this.height;
    }
  }

  private bindPointer(): void {
    const startAudio = () => {
      if (this.audio && !this.audioStarted) {
        this.audio.play().then(() => { this.audioStarted = true; }).catch(() => { });
      }
    };
    this.canvas.addEventListener("pointermove", (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointer.x = e.clientX - r.left; this.pointer.y = e.clientY - r.top;
      startAudio();
    });
    this.canvas.addEventListener("pointerleave", () => {
      this.pointer.x = null; this.pointer.y = null;
    });
  }

  private createRain(): void {
    this.rainColumns = [];
    this.rainColsCount = Math.floor(this.width / this.rainFontSize);
    for (let i = 0; i < this.rainColsCount; i++) {
      this.rainColumns.push({
        x: i * this.rainFontSize,
        y: Math.random() * this.height,
        speed: this.baseRainSpeed * (0.5 + Math.random() * 0.5),
        length: 6 + Math.floor(Math.random() * 12),
        charIndex: Math.floor(Math.random() * this.rainText.length),
      });
    }
  }

  private animate = (): void => {
    this.frame++;

    this.ctx.fillStyle = getComputedStyle(this.container).getPropertyValue("--bg") || "rgba(2,6,23,0.3)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    const px = this.pointer.x, py = this.pointer.y;
    let isOverParticle = false;
    this.pointerColorTarget = null;

    const radSq = this.pointer.radius ** 2;
    const detSq = this.detectionRadius ** 2;

    for (const p of this.particles) {
      const tx = this.offX + p.nx * this.drawW;
      const ty = this.offY + p.ny * this.drawH;

      p.vx += (tx - p.x) * 0.06;
      p.vy += (ty - p.y) * 0.06;

      if (px !== null && py !== null) {
        const dx = p.x - px, dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < detSq) isOverParticle = true;
        if (d2 < radSq) {
          const dist = Math.sqrt(d2);
          const f = (this.pointer.radius - dist) / this.pointer.radius;
          p.vx += (dx / dist) * f * 6;
          p.vy += (dy / dist) * f * 6;
          this.pointerColorTarget = { r: p.r, g: p.g, b: p.b };
        }
      }

      p.vx *= 0.85; p.vy *= 0.85;
      p.x += p.vx; p.y += p.vy;

      if (++p.toggleCounter! >= p.toggleInterval!) {
        p.char = p.char === "0" ? "1" : "0";
        p.toggleCounter = 0;
      }

      this.ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      this.ctx.fillText(p.char, p.x, p.y);
    }

    this.rainAlpha += (isOverParticle ? this.fadeSpeed : -this.fadeSpeed);
    this.rainAlpha = Math.max(0, Math.min(1, this.rainAlpha));

    if (this.audio && this.audioStarted) {
      this.audio.volume = this.rainAlpha * 0.5;
    }

    if (this.rainAlpha > 0) {
      this.ctx.textBaseline = "top";
      const tCol = this.pointerColorTarget || this.defaultRainColor;
      this.rainCurrentColor.r += (tCol.r - this.rainCurrentColor.r) * 0.05;
      this.rainCurrentColor.g += (tCol.g - this.rainCurrentColor.g) * 0.05;
      this.rainCurrentColor.b += (tCol.b - this.rainCurrentColor.b) * 0.05;

      for (const col of this.rainColumns) {
        col.y += col.speed;
        if (col.y > this.height) col.y = -col.length * this.rainFontSize;

        const headIndex = Math.floor(col.y / this.rainFontSize) % col.length;

        for (let i = 0; i < col.length; i++) {
          const yPos = col.y - i * this.rainFontSize;
          if (yPos < -this.rainFontSize || yPos > this.height) continue;

          const isGlitching = this.isGlitchEnabled && Math.random() < 0.12;
          const char = isGlitching
            ? this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)]
            : this.rainText[(col.charIndex + i) % this.rainText.length];

          if (i === headIndex) {
            this.ctx.font = `bold ${this.rainFontSize}px monospace`;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.rainAlpha})`;
            this.ctx.fillText(char, col.x, yPos);
          } else {
            const trailAlpha = Math.pow((col.length - i) / col.length, 1.8) * this.rainAlpha;
            if (isGlitching) {
              this.ctx.fillStyle = `rgba(255, 255, 255, ${this.rainAlpha * 0.9})`;
              this.ctx.font = `bold ${this.rainFontSize}px monospace`;
            } else {
              this.ctx.fillStyle = `rgba(${Math.round(this.rainCurrentColor.r)},${Math.round(this.rainCurrentColor.g)},${Math.round(this.rainCurrentColor.b)},${trailAlpha})`;
              this.ctx.font = `${this.rainFontSize}px monospace`;
            }
            this.ctx.fillText(char, col.x, yPos);
          }
        }
      }
    }

    this.rafId = requestAnimationFrame(this.animate);
  };

  public destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
  }
}