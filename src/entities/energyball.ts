import { Entity } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const ENERGY_BALL_SPEED = 220; // px per second

export class EnergyBall implements Entity {
  x: number;
  y: number;
  width: number = 22;
  height: number = 22;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private glowTimer: number = 0;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * ENERGY_BALL_SPEED;
    this.vy = Math.sin(angle) * ENERGY_BALL_SPEED;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.glowTimer += dt * 7;
    if (
      this.y > CANVAS_HEIGHT + 60 ||
      this.y < -60 ||
      this.x < -60 ||
      this.x > CANVAS_WIDTH + 60
    ) {
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
    const r = this.width / 2;
    const pulse = 1 + Math.sin(this.glowTimer) * 0.25;
    const glowR = r * pulse * 2;

    ctx.save();

    // Outer glow
    const grad = ctx.createRadialGradient(this.x, this.y, r * 0.15, this.x, this.y, glowR);
    grad.addColorStop(0, 'rgba(255,255,80,0.95)');
    grad.addColorStop(0.35, 'rgba(255,180,0,0.7)');
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
