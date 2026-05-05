import { CANVAS_WIDTH, CANVAS_HEIGHT, TOXIC_CLOUD_DURATION } from '../../constants';
import { ProjectileEntity } from '../entityRoles';

export class ToxicCloud extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 90;
  height: number = 80;
  active: boolean = true;
  targetX: number;
  targetY: number;

  private age: number = 0;
  private wobble: number = 0;
  private chaseSpeed: number = 90;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.age += dt;
    this.wobble += dt * 2.5;
    if (this.age >= TOXIC_CLOUD_DURATION) {
      this.active = false;
      return;
    }

    // Chase the player position
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.x += (dx / dist) * this.chaseSpeed * dt;
    this.y += (dy / dist) * this.chaseSpeed * dt;

    // Keep within canvas
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(CANVAS_HEIGHT - this.height / 2, this.y));
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.4,
      y: this.y - this.height * 0.4,
      width: this.width * 0.8,
      height: this.height * 0.8,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const lifeRatio = 1 - this.age / TOXIC_CLOUD_DURATION;
    const alpha = Math.min(1, lifeRatio * 3) * 0.82;

    ctx.save();
    ctx.globalAlpha = alpha;

    const wobbleX = Math.sin(this.wobble * 1.3) * 8;
    const wobbleY = Math.cos(this.wobble * 0.9) * 6;

    // Outer cloud puffs
    const puffs = [
      { ox: wobbleX,      oy: wobbleY,       r: 36, a: 0.55 },
      { ox: -22 + wobbleX, oy: -10 + wobbleY, r: 28, a: 0.45 },
      { ox: 20 + wobbleX,  oy: -8 + wobbleY,  r: 28, a: 0.45 },
      { ox: -10 + wobbleX, oy: 20 + wobbleY,  r: 22, a: 0.40 },
      { ox: 14 + wobbleX,  oy: 16 + wobbleY,  r: 22, a: 0.40 },
    ];

    for (const p of puffs) {
      const g = ctx.createRadialGradient(
        this.x + p.ox, this.y + p.oy, 2,
        this.x + p.ox, this.y + p.oy, p.r,
      );
      g.addColorStop(0, `rgba(100,255,60,${p.a})`);
      g.addColorStop(0.5, `rgba(40,200,0,${p.a * 0.6})`);
      g.addColorStop(1, 'rgba(0,150,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x + p.ox, this.y + p.oy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bubbling toxic droplets
    ctx.fillStyle = 'rgba(80,255,40,0.7)';
    ctx.shadowColor = '#44ff00';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 5; i++) {
      const phase = this.wobble * (1.4 + i * 0.3) + i * 1.2;
      const bx = this.x + Math.sin(phase) * 20;
      const by = this.y + Math.cos(phase * 0.8) * 16;
      const br = 3 + Math.abs(Math.sin(phase * 2)) * 3;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Warning skull icon (small, centered)
    const pulse = 0.6 + Math.abs(Math.sin(this.wobble * 2)) * 0.4;
    ctx.globalAlpha = alpha * pulse;
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☠', this.x + wobbleX * 0.3, this.y + wobbleY * 0.3);
    ctx.textBaseline = 'alphabetic';

    ctx.restore();
  }
}
