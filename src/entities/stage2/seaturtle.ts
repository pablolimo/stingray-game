import { CANVAS_WIDTH } from '../../constants';
import { BigEnemy } from '../entityRoles';

function createSeaTurtleSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 60;
  c.height = 36;
  const ctx = c.getContext('2d')!;

  // Shell shadow
  ctx.fillStyle = 'rgba(0,40,20,0.4)';
  ctx.beginPath();
  ctx.ellipse(30, 22, 24, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell body
  ctx.fillStyle = '#1e3a28';
  ctx.beginPath();
  ctx.ellipse(30, 19, 22, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell hex pattern
  ctx.strokeStyle = '#2a5a3a';
  ctx.lineWidth = 1.2;
  const hexCenters = [
    [30, 16], [22, 14], [38, 14], [26, 22], [34, 22],
  ];
  for (const [hx, hy] of hexCenters) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const px = hx + Math.cos(a) * 4;
      const py = hy + Math.sin(a) * 3.5;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Bioluminescent rim glow on shell
  ctx.strokeStyle = '#44aa66';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#44aa66';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.ellipse(30, 19, 22, 13, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Head
  ctx.fillStyle = '#2a4a30';
  ctx.beginPath();
  ctx.ellipse(46, 16, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#88ffaa';
  ctx.shadowColor = '#44ff88';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(50, 14, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flippers
  ctx.fillStyle = '#1e3a28';
  // Front left flipper
  ctx.beginPath();
  ctx.ellipse(12, 14, 8, 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Front right flipper (already head side)
  ctx.beginPath();
  ctx.ellipse(42, 8, 7, 3, -0.6, 0, Math.PI * 2);
  ctx.fill();
  // Rear left flipper
  ctx.beginPath();
  ctx.ellipse(12, 25, 7, 3.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Rear right flipper
  ctx.beginPath();
  ctx.ellipse(42, 28, 6, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class SeaTurtle extends BigEnemy {
  x: number;
  y: number;
  width: number = 120;
  height: number = 72;
  targetX: number;

  private sprite: HTMLCanvasElement;
  private level: number;
  private angle: number;

  constructor(x: number, y: number, targetX: number, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.level = level;
    this.sprite = createSeaTurtleSprite();
    const dx = targetX - x;
    this.angle = Math.atan2(1, dx / CANVAS_WIDTH) * 0.3;
  }

  update(dt: number, scrollSpeed: number): void {
    // Slightly slower than sharks
    const speedMult = this.level >= 3 ? 1.6 : 1.35;
    this.y += scrollSpeed * speedMult * dt;
    // Turtles don't actively hunt even at level 3 - just drift
    this.x += Math.sin(this.angle) * scrollSpeed * 0.25 * dt;
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
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
