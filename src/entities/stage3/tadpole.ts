import { ProjectileEntity } from '../entityRoles';

function createTadpoleSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext('2d')!;

  // Body – dark greenish blob
  ctx.fillStyle = '#1a3a0a';
  ctx.beginPath();
  ctx.ellipse(7, 7, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Slimy sheen
  ctx.fillStyle = 'rgba(100,200,50,0.3)';
  ctx.beginPath();
  ctx.ellipse(6, 6, 3, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = '#1a3a0a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(12, 8);
  ctx.quadraticCurveTo(16, 6, 15, 12);
  ctx.stroke();

  // Evil eyes
  ctx.fillStyle = '#ff4400';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 3;
  ctx.beginPath(); ctx.arc(5, 6, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, 6, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  return c;
}

export class Tadpole extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 16;
  height: number = 16;
  active: boolean = true;

  private sprite: HTMLCanvasElement;
  private vx: number;
  private vy: number;
  private wobblePhase: number;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 220 + Math.random() * 60;
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
    this.sprite = createTadpoleSprite();
    this.wobblePhase = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.wobblePhase += dt * 8;
    // Slight wobble perpendicular to direction
    const perp = { x: -this.vy, y: this.vx };
    const pLen = Math.sqrt(perp.x * perp.x + perp.y * perp.y) || 1;
    this.x += (perp.x / pLen) * Math.sin(this.wobblePhase) * 18 * dt;
    this.y += (perp.y / pLen) * Math.sin(this.wobblePhase) * 18 * dt;

    if (this.x < -30 || this.x > 510 || this.y < -30 || this.y > 820) this.active = false;
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
    const angle = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
