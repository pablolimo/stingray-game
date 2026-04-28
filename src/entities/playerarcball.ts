import { CANVAS_HEIGHT } from '../constants';
import { ProjectileEntity } from './entityRoles';

const ARC_BALL_SPEED = 480; // px per second, faster than enemy balls
const ARC_BALL_RADIUS = 18;

/** A glowing energy ball fired upward by the player's arc weapon. */
export class PlayerArcBall extends ProjectileEntity {
  x: number;
  y: number;
  width: number = ARC_BALL_RADIUS * 2;
  height: number = ARC_BALL_RADIUS * 2;
  active: boolean = true;

  /** Identifies this as a player-owned projectile so it won't hurt the player. */
  readonly isPlayerProjectile: boolean = true;

  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.y -= ARC_BALL_SPEED * dt;
    this.glowTimer += dt * 7;
    if (this.y < -ARC_BALL_RADIUS * 2) {
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
    if (!this.active) return;

    const r = ARC_BALL_RADIUS;
    const pulse = 1 + Math.sin(this.glowTimer) * 0.22;
    const glowR = r * pulse * 2.4;

    ctx.save();

    // Outer glow halo
    const grad = ctx.createRadialGradient(this.x, this.y, r * 0.1, this.x, this.y, glowR);
    grad.addColorStop(0, 'rgba(255,255,255,0.98)');
    grad.addColorStop(0.25, 'rgba(220,190,255,0.75)');
    grad.addColorStop(0.55, 'rgba(140,80,255,0.40)');
    grad.addColorStop(1, 'rgba(80,30,200,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ddbbff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring accent
    ctx.strokeStyle = 'rgba(200,160,255,0.7)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
