import { CANVAS_WIDTH } from '../../constants';
import { BigEnemy } from '../entityRoles';

function createSwordfishSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 100;
  c.height = 44;
  const ctx = c.getContext('2d')!;

  // Body – dark blue-grey swordfish
  const bodyGrd = ctx.createLinearGradient(0, 22, 100, 22);
  bodyGrd.addColorStop(0, '#1a3a5a');
  bodyGrd.addColorStop(0.5, '#2a5a8a');
  bodyGrd.addColorStop(1, '#3a6a9a');
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.bezierCurveTo(10, 14, 60, 10, 90, 20);
  ctx.bezierCurveTo(95, 22, 90, 24, 90, 24);
  ctx.bezierCurveTo(60, 34, 10, 30, 0, 22);
  ctx.closePath();
  ctx.fill();

  // Lateral line
  ctx.strokeStyle = '#4a8aaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.bezierCurveTo(40, 20, 70, 22, 88, 22);
  ctx.stroke();

  // Underbelly lighter
  ctx.fillStyle = 'rgba(200,220,240,0.3)';
  ctx.beginPath();
  ctx.ellipse(45, 26, 35, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin (tall, swept back)
  ctx.fillStyle = '#1a3a5a';
  ctx.beginPath();
  ctx.moveTo(30, 14);
  ctx.lineTo(50, 2);
  ctx.lineTo(65, 12);
  ctx.lineTo(60, 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2a5a8a';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Pectoral fin
  ctx.fillStyle = '#2a5a8a';
  ctx.beginPath();
  ctx.moveTo(40, 24);
  ctx.lineTo(30, 36);
  ctx.lineTo(50, 28);
  ctx.closePath();
  ctx.fill();

  // Tail fin (forked)
  ctx.fillStyle = '#1a3a5a';
  ctx.beginPath();
  ctx.moveTo(88, 20);
  ctx.lineTo(100, 12);
  ctx.lineTo(96, 22);
  ctx.lineTo(100, 32);
  ctx.lineTo(88, 24);
  ctx.closePath();
  ctx.fill();

  // Bill / sword (the long pointed snout)
  ctx.strokeStyle = '#aaccee';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(-30, 20);
  ctx.stroke();
  // Sword tip
  ctx.strokeStyle = '#ddeeff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-24, 20.5);
  ctx.lineTo(-30, 20);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(6, 19, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aaccee';
  ctx.beginPath();
  ctx.arc(5, 18.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Swordfish extends BigEnemy {
  x: number;
  y: number;
  width: number = 130;  // includes sword
  height: number = 44;
  targetX: number;

  private sprite: HTMLCanvasElement;
  private level: number;
  private speedMultiplier: number;
  private diveAngle: number;

  constructor(x: number, y: number, targetX: number, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprite = createSwordfishSprite();
    this.level = level;
    // Swordfish is notably faster than other big enemies
    this.speedMultiplier = level >= 3 ? 2.6 : 2.1;
    const dx = targetX - x;
    this.diveAngle = Math.atan2(0, dx) * 0.2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;

    if (this.level >= 3) {
      // Level 3: aggressive horizontal tracking
      const dx = this.targetX - this.x;
      const huntSpeed = scrollSpeed * 0.7;
      const step = huntSpeed * dt;
      if (Math.abs(dx) > step) {
        this.x += Math.sign(dx) * step;
      } else {
        this.x += dx;
      }
      this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    } else {
      this.x += Math.sin(this.diveAngle) * scrollSpeed * 0.4 * dt;
    }
  }

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + 30, this.y);  // offset so sword points left
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width - 30, this.height);
    ctx.restore();
  }
}
