import { OYSTER_SCORE } from '../../constants';
import { FoodCollectible } from '../entityRoles';

function createOysterSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 24;
  c.height = 20;
  const ctx = c.getContext('2d')!;

  // Shell bottom half
  ctx.fillStyle = '#8a7a6a';
  ctx.beginPath();
  ctx.ellipse(12, 13, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell ridges
  ctx.strokeStyle = '#6a5a4a';
  ctx.lineWidth = 0.8;
  for (let r = 0; r < 4; r++) {
    ctx.beginPath();
    ctx.ellipse(12, 13, 3 + r * 2, 2 + r * 1.5, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Shell top half (slightly open)
  ctx.fillStyle = '#9a8a78';
  ctx.beginPath();
  ctx.ellipse(12, 8, 10, 6, 0, 0, -Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#7a6a58';
  ctx.lineWidth = 0.7;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.ellipse(12, 8, 3 + r * 2.5, 1.5 + r, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Pearl inside
  ctx.fillStyle = 'rgba(220,215,230,0.9)';
  ctx.beginPath();
  ctx.arc(12, 11, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(10.5, 9.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Hinge
  ctx.fillStyle = '#6a5a4a';
  ctx.beginPath();
  ctx.arc(12, 10, 2, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Oyster extends FoodCollectible {
  x: number;
  y: number;
  width: number = 24;
  height: number = 20;
  collected: boolean = false;
  score: number = OYSTER_SCORE;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createOysterSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.driftAngle += dt * 0.8;
    this.x += Math.sin(this.driftAngle) * 12 * dt;
  }

  getBounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
