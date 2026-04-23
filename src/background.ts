import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Bubble } from './types';

export class Background {
  private layer1: HTMLCanvasElement;
  private layer2: HTMLCanvasElement;
  private layer3: HTMLCanvasElement;
  private offset1: number = 0;
  private offset2: number = 0;
  private offset3: number = 0;
  private bubbles: Bubble[] = [];
  private time: number = 0;
  private readonly LAYER_HEIGHT = CANVAS_HEIGHT * 2;

  constructor() {
    this.layer1 = this.createLayer1();
    this.layer2 = this.createLayer2();
    this.layer3 = this.createLayer3();
    this.initBubbles();
  }

  private createLayer1(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Sandy base
    ctx.fillStyle = '#d4a76a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, this.LAYER_HEIGHT);

    // Grain texture - random dots
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light ? 'rgba(255,220,160,0.4)' : 'rgba(100,70,30,0.3)';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    // Subtle color variation bands
    for (let y = 0; y < this.LAYER_HEIGHT; y += 40) {
      const alpha = (Math.sin(y * 0.05) + 1) * 0.03;
      ctx.fillStyle = `rgba(180,130,60,${alpha})`;
      ctx.fillRect(0, y, CANVAS_WIDTH, 20);
    }

    return c;
  }

  private createLayer2(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Pebbles
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 2 + Math.random() * 4;
      const gray = Math.floor(100 + Math.random() * 80);
      ctx.fillStyle = `rgb(${gray},${gray - 10},${gray - 20})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sand ripples
    ctx.strokeStyle = 'rgba(150,110,50,0.3)';
    ctx.lineWidth = 1;
    for (let y = 30; y < this.LAYER_HEIGHT; y += 50 + Math.random() * 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < CANVAS_WIDTH; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
      }
      ctx.stroke();
    }

    // Dark sand patches
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.fillStyle = 'rgba(120,80,30,0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 30, 10 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  private createLayer3(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Seaweed
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const baseY = Math.random() * this.LAYER_HEIGHT;
      ctx.strokeStyle = `rgba(${40 + Math.random() * 30},${120 + Math.random() * 60},${30 + Math.random() * 20},0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      const height = 20 + Math.random() * 30;
      for (let seg = 0; seg < 5; seg++) {
        const sy = baseY - (seg / 5) * height;
        ctx.quadraticCurveTo(
          x + (seg % 2 === 0 ? 8 : -8),
          sy - height / 10,
          x + (seg % 2 === 0 ? 4 : -4),
          sy - height / 5
        );
      }
      ctx.stroke();
    }

    // Small rocks
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 3 + Math.random() * 6;
      ctx.fillStyle = `rgba(${80 + Math.random() * 40},${70 + Math.random() * 30},${60 + Math.random() * 20},0.9)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.75, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Coral bits
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.fillStyle = `rgba(${200 + Math.random() * 55},${80 + Math.random() * 60},${60 + Math.random() * 40},0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  private initBubbles(): void {
    for (let i = 0; i < 20; i++) {
      this.bubbles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: 1 + Math.random() * 3,
        speed: 20 + Math.random() * 30,
      });
    }
  }

  update(dt: number, scrollSpeed: number): void {
    this.time += dt;
    this.offset1 = (this.offset1 + scrollSpeed * 0.3 * dt) % CANVAS_HEIGHT;
    this.offset2 = (this.offset2 + scrollSpeed * 0.6 * dt) % CANVAS_HEIGHT;
    this.offset3 = (this.offset3 + scrollSpeed * 1.0 * dt) % CANVAS_HEIGHT;

    for (const b of this.bubbles) {
      b.y -= b.speed * dt;
      if (b.y < -10) {
        b.y = CANVAS_HEIGHT + 10;
        b.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  private drawLayer(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, offset: number): void {
    const y = offset;
    ctx.drawImage(layer, 0, y - CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(layer, 0, y, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.drawLayer(ctx, this.layer1, this.offset1);
    this.drawLayer(ctx, this.layer2, this.offset2);
    this.drawLayer(ctx, this.layer3, this.offset3);

    // Water blue tint
    ctx.fillStyle = 'rgba(30, 100, 180, 0.08)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Caustics
    this.renderCaustics(ctx);

    // Bubbles
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const b of this.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      // Bubble shine
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
    }
  }

  private renderCaustics(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 6; i++) {
      const t = this.time * 0.5 + i * 1.1;
      const x = (Math.sin(t * 1.3) * 0.5 + 0.5) * CANVAS_WIDTH;
      const y = (Math.cos(t * 0.9) * 0.5 + 0.5) * CANVAS_HEIGHT;
      const rx = 30 + Math.sin(t * 2) * 15;
      const ry = 20 + Math.cos(t * 1.7) * 10;
      ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
