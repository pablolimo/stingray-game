import { ProjectileEntity } from '../entityRoles';

export class FrogTongue extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 14;
  height: number = 14;
  active: boolean = true;
  hitPlayer: boolean = false; // set by game.ts when it connects

  private startX: number;
  private startY: number;
  private vx: number;
  private vy: number;
  private age: number = 0;
  private readonly MAX_AGE = 1.2;

  constructor(startX: number, startY: number, targetX: number, targetY: number) {
    super();
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 350;
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
  }

  update(dt: number, scrollSpeed: number): void {
    if (!this.active) return;
    this.age += dt;
    this.y += scrollSpeed * dt;
    this.startY += scrollSpeed * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.age >= this.MAX_AGE) this.active = false;
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

    // Tongue line from start to current pos
    ctx.save();
    ctx.strokeStyle = '#cc2244';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Sticky tip
    ctx.fillStyle = '#ff6688';
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
