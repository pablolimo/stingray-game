import { TREASURE_SCORE } from '../constants';
import { TreasureCollectible } from './entityRoles';

function createTreasureChestSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 24;
  const ctx = c.getContext('2d')!;

  // Shadow/buried base
  ctx.fillStyle = 'rgba(80,50,10,0.5)';
  ctx.fillRect(2, 18, 28, 5);

  // Chest body (lower half)
  ctx.fillStyle = '#7B4A1E';
  ctx.fillRect(3, 12, 26, 11);

  // Chest lid (upper half - slightly wider)
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(2, 7, 28, 8);
  // Lid rounded top
  ctx.fillRect(4, 5, 24, 4);
  ctx.fillRect(7, 3, 18, 4);

  // Gold trim - horizontal band on lid
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(2, 11, 28, 2);

  // Gold trim - vertical straps on body
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(3, 12, 3, 11);
  ctx.fillRect(14, 12, 4, 11);
  ctx.fillRect(26, 12, 3, 11);

  // Gold trim - horizontal bottom strap
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(3, 20, 26, 2);

  // Gold lock/clasp in center
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(13, 9, 6, 5);
  ctx.fillStyle = '#B8860B';
  ctx.fillRect(14, 10, 4, 3);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(15, 11, 2, 2);

  // Keyhole
  ctx.fillStyle = '#3D1F00';
  ctx.fillRect(15, 11, 2, 1);

  // Glow effect (golden shimmer)
  ctx.fillStyle = 'rgba(255, 220, 0, 0.18)';
  ctx.fillRect(4, 4, 24, 18);

  return c;
}

export class TreasureChest extends TreasureCollectible {
  x: number;
  y: number;
  width: number = 64;
  height: number = 48;
  collected: boolean = false;
  score: number = TREASURE_SCORE;

  private sprite: HTMLCanvasElement;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createTreasureChestSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 2;
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
    if (this.collected) return;

    // Pulsing golden glow beneath chest
    const glowAlpha = 0.15 + Math.sin(this.glowTimer) * 0.08;
    ctx.save();
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.3, this.width * 0.7, this.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
