import { FoodCollectible } from '../entityRoles';

const MOON_JELLYFISH_SCORE = 30;

function createMoonJellyfishSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 40;
  const ctx = c.getContext('2d')!;

  // Bell (transparent/translucent)
  const bellGrd = ctx.createRadialGradient(16, 16, 4, 16, 16, 16);
  bellGrd.addColorStop(0, 'rgba(180,160,255,0.6)');
  bellGrd.addColorStop(0.6, 'rgba(120,100,220,0.35)');
  bellGrd.addColorStop(1, 'rgba(80,60,180,0.1)');
  ctx.fillStyle = bellGrd;
  ctx.beginPath();
  ctx.ellipse(16, 14, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bell rim glow
  ctx.strokeStyle = '#cc99ff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#aa66ff';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.ellipse(16, 14, 14, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner cross pattern (characteristic of moon jellyfish)
  ctx.fillStyle = 'rgba(200,150,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(16, 14, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4 horseshoe-shaped gonads
  ctx.strokeStyle = 'rgba(255,180,255,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const gx = 16 + Math.cos(a) * 6;
    const gy = 14 + Math.sin(a) * 5;
    ctx.beginPath();
    ctx.arc(gx, gy, 2.5, 0, Math.PI);
    ctx.stroke();
  }

  return c;
}

export class MoonJellyfish extends FoodCollectible {
  x: number;
  y: number;
  width: number = 48;
  height: number = 60;
  collected: boolean = false;
  score: number = MOON_JELLYFISH_SCORE;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;
  private glowTimer: number;
  private pulseTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createMoonJellyfishSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.glowTimer = Math.random() * Math.PI * 2;
    this.pulseTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * 0.9 * dt;
    this.driftAngle += dt * 0.8;
    this.x += Math.sin(this.driftAngle) * 20 * dt;
    this.glowTimer += dt * 2;
    this.pulseTimer += dt * 3;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width * 0.85,
      height: this.height * 0.75,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;

    // Pulsing purple glow
    ctx.save();
    const pulse = 0.15 + Math.abs(Math.sin(this.pulseTimer)) * 0.15;
    ctx.globalAlpha = pulse;
    const grd = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, this.width * 0.9);
    grd.addColorStop(0, 'rgba(180,100,255,0.9)');
    grd.addColorStop(1, 'rgba(80,0,180,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
