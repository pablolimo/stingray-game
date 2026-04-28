import { STARFISH_SCORE } from '../../constants';
import { BonusFoodCollectible } from '../entityRoles';

function createKrillSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 12;
  c.height = 8;
  const ctx = c.getContext('2d')!;

  // Body - small shrimp shape
  ctx.fillStyle = '#cc6644';
  ctx.beginPath();
  ctx.ellipse(7, 4, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fan
  ctx.fillStyle = '#ff8866';
  ctx.beginPath();
  ctx.moveTo(2, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#ffaaaa';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(11, 3);
  ctx.lineTo(12, 1);
  ctx.moveTo(11, 3);
  ctx.lineTo(12, 5);
  ctx.stroke();

  // Glow
  ctx.fillStyle = 'rgba(255,140,100,0.3)';
  ctx.beginPath();
  ctx.ellipse(7, 4, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#ffddaa';
  ctx.beginPath();
  ctx.arc(10, 3, 1, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Krill extends BonusFoodCollectible {
  x: number;
  y: number;
  width: number = 12;
  height: number = 8;
  collected: boolean = false;
  score: number = STARFISH_SCORE;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createKrillSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.driftAngle += dt * 3;
    this.x += Math.sin(this.driftAngle) * 15 * dt;
    this.glowTimer += dt * 4;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    // Orange glow
    ctx.save();
    const gAlpha = 0.15 + Math.abs(Math.sin(this.glowTimer)) * 0.15;
    ctx.globalAlpha = gAlpha;
    const grd = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.width);
    grd.addColorStop(0, '#ff8866');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
