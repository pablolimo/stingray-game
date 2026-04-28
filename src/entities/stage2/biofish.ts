import { FISH_SCORE } from '../../constants';
import { FoodCollectible } from '../entityRoles';

function createBioFishSprite(variant: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 12;
  c.height = 8;
  const ctx = c.getContext('2d')!;

  const colors = [
    { body: '#1a3a5a', fin: '#44ddcc', glow: '#44ddcc' },
    { body: '#1a2a4a', fin: '#4488ff', glow: '#4488ff' },
    { body: '#1a3a3a', fin: '#22ccaa', glow: '#22ccaa' },
  ];
  const c2 = colors[variant % 3];

  // Bioluminescent glow
  const grd = ctx.createRadialGradient(6, 4, 1, 6, 4, 6);
  grd.addColorStop(0, `${c2.glow}44`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 12, 8);

  // Body
  ctx.fillStyle = c2.body;
  ctx.beginPath();
  ctx.ellipse(6, 4, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing fin
  ctx.fillStyle = c2.fin;
  ctx.shadowColor = c2.glow;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(1, 4);
  ctx.lineTo(-1, 1);
  ctx.lineTo(-1, 7);
  ctx.closePath();
  ctx.fill();

  // Glowing stripe
  ctx.strokeStyle = c2.glow;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(3, 4);
  ctx.lineTo(9, 4);
  ctx.stroke();

  // Eye
  ctx.shadowBlur = 0;
  ctx.fillStyle = c2.glow;
  ctx.beginPath();
  ctx.arc(9, 3.5, 1, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class BioFish extends FoodCollectible {
  x: number;
  y: number;
  width: number = 24;
  height: number = 16;
  collected: boolean = false;
  score: number = FISH_SCORE;

  private sprites: HTMLCanvasElement[];
  private colorVariant: number;
  private animFrame: number = 0;
  private animTimer: number = 0;
  private driftAngle: number;
  private driftSpeed: number;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.colorVariant = Math.floor(Math.random() * 3);
    this.sprites = [createBioFishSprite(this.colorVariant), createBioFishSprite(this.colorVariant)];
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 20 + Math.random() * 20;
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.driftAngle += dt * 2;
    this.x += Math.sin(this.driftAngle) * this.driftSpeed * dt;
    this.animTimer += dt;
    if (this.animTimer >= 0.2) { this.animTimer -= 0.2; this.animFrame = (this.animFrame + 1) % 2; }
    this.glowTimer += dt * 3;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    // Bioluminescent glow
    ctx.save();
    const glowColors = ['#44ddcc', '#4488ff', '#22ccaa'];
    const gAlpha = 0.2 + Math.abs(Math.sin(this.glowTimer)) * 0.2;
    ctx.globalAlpha = gAlpha;
    const grd = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.width * 0.8);
    grd.addColorStop(0, glowColors[this.colorVariant]);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
