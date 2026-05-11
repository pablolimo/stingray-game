import { SALMON_SCORE } from '../../constants';
import { FoodCollectible } from '../entityRoles';

function createSalmonSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 28;
  c.height = 14;
  const ctx = c.getContext('2d')!;

  // Body – pinkish-orange salmon
  const bodyGrd = ctx.createLinearGradient(0, 7, 28, 7);
  bodyGrd.addColorStop(0, '#cc5533');
  bodyGrd.addColorStop(0.5, '#e8784a');
  bodyGrd.addColorStop(1, '#f0a070');
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.ellipse(12, 7, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly lighter highlight
  ctx.fillStyle = 'rgba(255,210,180,0.55)';
  ctx.beginPath();
  ctx.ellipse(11, 6, 8, 2.5, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Tail fin
  ctx.fillStyle = '#b84428';
  ctx.beginPath();
  ctx.moveTo(22, 7);
  ctx.lineTo(28, 3);
  ctx.lineTo(28, 11);
  ctx.closePath();
  ctx.fill();

  // Dorsal fin
  ctx.fillStyle = '#c85535';
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(16, 2);
  ctx.lineTo(14, 5);
  ctx.closePath();
  ctx.fill();

  // Scales row
  ctx.strokeStyle = 'rgba(160,60,30,0.35)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 4; i++) {
    const sx = 6 + i * 4;
    ctx.beginPath();
    ctx.arc(sx, 7, 2.5, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();
  }

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(4, 6, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(3.5, 5.5, 0.55, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Salmon extends FoodCollectible {
  x: number;
  y: number;
  width: number = 28;
  height: number = 14;
  collected: boolean = false;
  score: number = SALMON_SCORE;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;
  private facing: number; // 1 = right, -1 = left

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createSalmonSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.facing = Math.random() > 0.5 ? 1 : -1;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.driftAngle += dt * 1.4;
    this.x += Math.sin(this.driftAngle) * 25 * dt;
  }

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.facing, 1);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

export function createSalmonSchool(cx: number, cy: number): Salmon[] {
  const school: Salmon[] = [];
  for (let i = 0; i < 8; i++) {
    const ox = (Math.random() - 0.5) * 70;
    const oy = (Math.random() - 0.5) * 50;
    school.push(new Salmon(cx + ox, cy + oy));
  }
  return school;
}
