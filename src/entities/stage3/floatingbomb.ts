import { CANVAS_WIDTH } from '../../constants';
import { SmallEnemy } from '../entityRoles';

function createBombSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 28;
  c.height = 28;
  const ctx = c.getContext('2d')!;

  // Bomb body – dark iron ball
  const bGrd = ctx.createRadialGradient(10, 10, 2, 14, 14, 12);
  bGrd.addColorStop(0, '#555');
  bGrd.addColorStop(1, '#111');
  ctx.fillStyle = bGrd;
  ctx.beginPath();
  ctx.arc(14, 16, 11, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(10, 12, 4, 0, Math.PI * 2);
  ctx.fill();

  // Fuse base
  ctx.strokeStyle = '#5a3a00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 5);
  ctx.quadraticCurveTo(18, 3, 22, 6);
  ctx.stroke();

  // Fuse spark
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(22, 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  return c;
}

export class FloatingBomb extends SmallEnemy {
  x: number;
  y: number;
  width: number = 28;
  height: number = 28;

  private sprite: HTMLCanvasElement;
  private vx: number;
  private sparkTimer: number = 0;
  private bobPhase: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createBombSprite();
    // Random horizontal direction
    this.vx = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 30);
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.x += this.vx * dt;
    this.bobPhase += dt * 1.5;
    this.y += Math.sin(this.bobPhase) * 15 * dt;
    this.sparkTimer += dt;

    // Bounce off screen edges
    if (this.x < this.width / 2) { this.x = this.width / 2; this.vx = Math.abs(this.vx); }
    if (this.x > CANVAS_WIDTH - this.width / 2) { this.x = CANVAS_WIDTH - this.width / 2; this.vx = -Math.abs(this.vx); }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.45,
      y: this.y - this.height * 0.45,
      width: this.width * 0.9,
      height: this.height * 0.9,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Animated spark flicker
    ctx.save();
    const sparkAlpha = 0.6 + Math.sin(this.sparkTimer * 18) * 0.4;
    ctx.globalAlpha = Math.max(0, sparkAlpha);
    ctx.fillStyle = '#ffee44';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y - this.height / 2 + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
