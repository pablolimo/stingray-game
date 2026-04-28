import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { ProjectileEntity } from '../entityRoles';

const BOOGER_SPEED = 210;

function createMonkeyBoogerSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 20;
  c.height = 20;
  const ctx = c.getContext('2d')!;

  const grd = ctx.createRadialGradient(10, 10, 1, 10, 10, 10);
  grd.addColorStop(0, 'rgba(100,255,120,0.95)');
  grd.addColorStop(0.4, 'rgba(50,220,80,0.7)');
  grd.addColorStop(1, 'rgba(0,180,40,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(10, 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // Electric crackle marks
  ctx.strokeStyle = '#ccffaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(8, 8);
  ctx.lineTo(12, 10);
  ctx.lineTo(9, 16);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00ff44';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(10, 10, 3, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class MonkeyBoogerBall extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 20;
  height: number = 20;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private glowTimer: number = 0;
  private sprite: HTMLCanvasElement;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createMonkeyBoogerSprite();
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.vx = (dx / dist) * BOOGER_SPEED;
    this.vy = (dy / dist) * BOOGER_SPEED;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.glowTimer += dt * 8;
    if (this.y > CANVAS_HEIGHT + 60 || this.y < -60 || this.x < -60 || this.x > CANVAS_WIDTH + 60) {
      this.active = false;
    }
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
    const pulse = 1 + Math.sin(this.glowTimer) * 0.3;
    const r = this.width / 2 * pulse;

    ctx.save();
    const grd = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, r * 1.8);
    grd.addColorStop(0, 'rgba(100,255,120,0.9)');
    grd.addColorStop(0.5, 'rgba(30,200,60,0.5)');
    grd.addColorStop(1, 'rgba(0,180,40,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
