import { Entity } from '../types';

function createGlowingClamSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 40;
  const ctx = c.getContext('2d')!;

  // Lower shell (bottom half of clam)
  ctx.fillStyle = '#1a7a3a';
  ctx.beginPath();
  ctx.ellipse(24, 30, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lower shell highlight ridges
  ctx.strokeStyle = '#2db356';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const rx = 20 - i * 3;
    const ry = 10 - i * 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(24, 30, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Upper shell (open lid)
  ctx.fillStyle = '#22994a';
  ctx.beginPath();
  ctx.ellipse(24, 22, 20, 10, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Upper shell highlight ridges
  ctx.strokeStyle = '#44cc6e';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const rx = 20 - i * 3;
    const ry = 10 - i * 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(24, 22, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Pearl – creamy white circle in the centre of the opening
  const pearlGrad = ctx.createRadialGradient(22, 24, 1, 24, 26, 8);
  pearlGrad.addColorStop(0, '#ffffff');
  pearlGrad.addColorStop(0.4, '#e8f8e0');
  pearlGrad.addColorStop(1, '#b0d8b0');
  ctx.fillStyle = pearlGrad;
  ctx.beginPath();
  ctx.arc(24, 26, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pearl shine spot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(21, 23, 2.5, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class GlowingClam implements Entity {
  x: number;
  y: number;
  width: number = 72;
  height: number = 60;
  collected: boolean = false;

  private sprite: HTMLCanvasElement;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = createGlowingClamSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 2.5;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;

    // Green glow halo
    ctx.save();
    const glowAlpha = 0.18 + Math.sin(this.glowTimer) * 0.1;
    ctx.globalAlpha = glowAlpha;
    const grad = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.width * 0.8);
    grad.addColorStop(0, 'rgba(0,255,80,0.9)');
    grad.addColorStop(1, 'rgba(0,200,60,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width * 0.8, this.height * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rotating green starburst rays
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = 0.3 + Math.sin(this.glowTimer * 1.3) * 0.1;
    ctx.strokeStyle = '#44ff88';
    ctx.lineWidth = 1.5;
    const rayCount = 8;
    const outerR = this.width * 0.7;
    const innerR = this.width * 0.3;
    const rot = this.glowTimer * 0.35;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + rot;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();

    // Draw sprite
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Pearl shine sparkles
    ctx.save();
    ctx.fillStyle = '#ccffcc';
    const sparkles = [
      { ox: -8, oy: -14 },
      { ox: 10, oy: -18 },
      { ox: 0, oy: -22 },
      { ox: -14, oy: 0 },
      { ox: 14, oy: 2 },
    ];
    for (let i = 0; i < sparkles.length; i++) {
      const phase = this.glowTimer * 3 + i * 1.2;
      ctx.globalAlpha = ((Math.sin(phase) + 1) / 2) * 0.9;
      ctx.beginPath();
      ctx.arc(this.x + sparkles[i].ox, this.y + sparkles[i].oy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
