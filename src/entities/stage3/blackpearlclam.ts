import { OrbitalCollectible } from '../entityRoles';

function createBlackPearlClamSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 40;
  const ctx = c.getContext('2d')!;

  // Lower shell (ivory-white)
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath();
  ctx.ellipse(24, 30, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lower shell ridges
  ctx.strokeStyle = '#c8c0a0';
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

  // Upper shell (open lid, slightly warm-white)
  ctx.fillStyle = '#f4f0e0';
  ctx.beginPath();
  ctx.ellipse(24, 22, 20, 10, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Upper shell ridges
  ctx.strokeStyle = '#dcd4b8';
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

  // Black pearl – dark sphere with subtle highlights
  const pearlGrad = ctx.createRadialGradient(21, 23, 1, 24, 26, 8);
  pearlGrad.addColorStop(0, '#444444');
  pearlGrad.addColorStop(0.35, '#1a1a1a');
  pearlGrad.addColorStop(1, '#000000');
  ctx.fillStyle = pearlGrad;
  ctx.beginPath();
  ctx.arc(24, 26, 8, 0, Math.PI * 2);
  ctx.fill();

  // White glow ring around pearl
  ctx.save();
  ctx.globalAlpha = 0.55;
  const glowRing = ctx.createRadialGradient(24, 26, 6, 24, 26, 12);
  glowRing.addColorStop(0, 'rgba(255,255,255,0.5)');
  glowRing.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glowRing;
  ctx.beginPath();
  ctx.arc(24, 26, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pearl highlight
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(21, 23, 2.5, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class BlackPearlClam extends OrbitalCollectible {
  x: number;
  y: number;
  width: number = 72;
  height: number = 60;
  collected: boolean = false;

  get pearlStyle(): 'green' | 'black' { return 'black'; }

  private sprite: HTMLCanvasElement;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createBlackPearlClamSprite();
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

    // White glow halo (pulsing)
    ctx.save();
    const glowAlpha = 0.18 + Math.sin(this.glowTimer) * 0.1;
    ctx.globalAlpha = glowAlpha;
    const grad = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.width * 0.85);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.5, 'rgba(220,220,255,0.4)');
    grad.addColorStop(1, 'rgba(200,200,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.width * 0.85, this.height * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rotating white starburst rays
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = 0.25 + Math.sin(this.glowTimer * 1.3) * 0.08;
    ctx.strokeStyle = '#ffffff';
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

    // White sparkles around the black pearl
    ctx.save();
    ctx.fillStyle = '#ffffff';
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
