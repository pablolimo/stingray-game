import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';
import { ProjectileEntity } from '../entityRoles';

const ROCK_SPEED = 210; // px per second

export class MermaidRock extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 28;
  height: number = 28;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private rotAngle: number = 0;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.vx = (dx / dist) * ROCK_SPEED;
    this.vy = (dy / dist) * ROCK_SPEED;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotAngle += dt * 3;
    if (
      this.y > CANVAS_HEIGHT + 80 ||
      this.y < -80 ||
      this.x < -80 ||
      this.x > CANVAS_WIDTH + 80
    ) {
      this.active = false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - 12,
      y: this.y - 10,
      width: 24,
      height: 20,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotAngle);

    // Shadow / depth
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(2, 3, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main rock body - irregular polygon
    ctx.fillStyle = '#7a7060';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-8, -10);
    ctx.lineTo(0, -12);
    ctx.lineTo(9, -9);
    ctx.lineTo(13, -2);
    ctx.lineTo(11, 7);
    ctx.lineTo(3, 11);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();

    // Mid-tone facet
    ctx.fillStyle = '#9a9080';
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(0, -12);
    ctx.lineTo(9, -9);
    ctx.lineTo(4, -4);
    ctx.lineTo(-5, -6);
    ctx.closePath();
    ctx.fill();

    // Highlight spot
    ctx.fillStyle = '#beb0a0';
    ctx.beginPath();
    ctx.ellipse(-3, -6, 4, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Crack detail
    ctx.strokeStyle = '#554e42';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(2, -3);
    ctx.lineTo(6, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(1, 8);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
