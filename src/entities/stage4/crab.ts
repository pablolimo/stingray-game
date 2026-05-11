import { CRAB_SCORE } from '../../constants';
import { BonusFoodCollectible } from '../entityRoles';

function createCrabSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 22;
  const ctx = c.getContext('2d')!;

  // Main shell body
  ctx.fillStyle = '#cc4422';
  ctx.beginPath();
  ctx.ellipse(16, 13, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell highlight
  ctx.fillStyle = '#e8603a';
  ctx.beginPath();
  ctx.ellipse(13, 10, 7, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Shell ridge lines
  ctx.strokeStyle = '#aa3315';
  ctx.lineWidth = 0.8;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.ellipse(16, 13, 4 + r * 3, 2 + r * 2, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Left claw (big)
  ctx.fillStyle = '#cc4422';
  ctx.beginPath();
  ctx.ellipse(4, 11, 5, 3.5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Claw pincer
  ctx.fillStyle = '#bb3311';
  ctx.beginPath();
  ctx.moveTo(1, 9); ctx.lineTo(-1, 7); ctx.lineTo(2, 8); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1, 13); ctx.lineTo(-1, 15); ctx.lineTo(2, 12); ctx.closePath(); ctx.fill();

  // Right claw
  ctx.fillStyle = '#cc4422';
  ctx.beginPath();
  ctx.ellipse(28, 11, 5, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#bb3311';
  ctx.beginPath();
  ctx.moveTo(31, 9); ctx.lineTo(33, 7); ctx.lineTo(30, 8); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(31, 13); ctx.lineTo(33, 15); ctx.lineTo(30, 12); ctx.closePath(); ctx.fill();

  // Legs (3 on each side)
  ctx.strokeStyle = '#aa3315';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const leftLegs: [number, number, number, number][] = [
    [8, 10, 4, 5], [8, 13, 3, 13], [8, 16, 4, 20],
  ];
  const rightLegs: [number, number, number, number][] = [
    [24, 10, 28, 5], [24, 13, 29, 13], [24, 16, 28, 20],
  ];
  for (const [x1, y1, x2, y2] of [...leftLegs, ...rightLegs]) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  // Eyes (on stalks)
  ctx.fillStyle = '#441100';
  ctx.beginPath(); ctx.rect(14, 4, 1.5, 3); ctx.fill();
  ctx.beginPath(); ctx.rect(17, 4, 1.5, 3); ctx.fill();
  ctx.fillStyle = '#ff2200';
  ctx.beginPath(); ctx.arc(14.5, 4, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(18, 4, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(14.5, 4, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(18, 4, 1, 0, Math.PI * 2); ctx.fill();

  return c;
}

export class Crab extends BonusFoodCollectible {
  x: number;
  y: number;
  width: number = 32;
  height: number = 22;
  collected: boolean = false;
  score: number = CRAB_SCORE;

  private sprite: HTMLCanvasElement;
  private sideTimer: number = 0;
  private sideDir: number = Math.random() > 0.5 ? 1 : -1;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createCrabSprite();
    this.sideTimer = Math.random() * 1.5;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    // Scuttle sideways periodically
    this.sideTimer -= dt;
    if (this.sideTimer <= 0) {
      this.sideTimer = 0.8 + Math.random() * 1.2;
      this.sideDir *= -1;
    }
    this.x += this.sideDir * 40 * dt;
  }

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
