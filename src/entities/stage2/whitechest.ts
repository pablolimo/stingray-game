import { SHINY_CHEST_SCORE } from '../../constants';
import { PowerupCollectible } from '../entityRoles';

function createWhiteChestSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 24;
  const ctx = c.getContext('2d')!;

  // Shadow base
  ctx.fillStyle = 'rgba(200,200,220,0.3)';
  ctx.fillRect(2, 18, 28, 5);

  // Chest body – white/silver
  ctx.fillStyle = '#d0d8e8';
  ctx.fillRect(3, 12, 26, 11);

  // Chest lid
  ctx.fillStyle = '#e0e8f8';
  ctx.fillRect(2, 7, 28, 8);
  ctx.fillRect(4, 5, 24, 4);
  ctx.fillRect(7, 3, 18, 4);

  // Silver/white trim
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 11, 28, 2);

  ctx.fillStyle = '#c0ccdd';
  ctx.fillRect(3, 12, 3, 11);
  ctx.fillRect(14, 12, 4, 11);
  ctx.fillRect(26, 12, 3, 11);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3, 20, 26, 2);

  // Silver lock
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(13, 9, 6, 5);
  ctx.fillStyle = '#8090a0';
  ctx.fillRect(14, 10, 4, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(15, 11, 2, 2);

  // Keyhole
  ctx.fillStyle = '#334455';
  ctx.fillRect(15, 11, 2, 1);

  // Star emblem
  ctx.fillStyle = '#aabbcc';
  ctx.fillRect(7, 8, 1, 3);
  ctx.fillRect(6, 9, 3, 1);

  // White glow overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(4, 4, 24, 18);

  return c;
}

export class WhiteChest extends PowerupCollectible {
  x: number;
  y: number;
  width: number = 64;
  height: number = 48;
  collected: boolean = false;
  score: number = SHINY_CHEST_SCORE;

  override get powerupStyle(): 'laser' | 'arc' { return 'arc'; }

  private sprite: HTMLCanvasElement;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createWhiteChestSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 3;
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

    ctx.save();
    // Pulsing white/silver glow
    const glowAlpha = 0.2 + Math.sin(this.glowTimer) * 0.12;
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.3, this.width * 0.85, this.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rotating starburst rays (silver/white)
    ctx.save();
    ctx.translate(this.x, this.y);
    const rayAlpha = 0.3 + Math.sin(this.glowTimer * 1.5) * 0.15;
    ctx.globalAlpha = rayAlpha;
    ctx.strokeStyle = '#e0e8ff';
    ctx.lineWidth = 1.5;
    const rayCount = 8;
    const outerR = this.width * 0.75;
    const innerR = this.width * 0.35;
    const rot = this.glowTimer * 0.4;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + rot;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Sparkle dots (white)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    const sparkles = [
      { ox: -14, oy: -12 }, { ox: 14, oy: -10 }, { ox: 0, oy: -16 },
      { ox: -10, oy: 2 }, { ox: 12, oy: 4 },
    ];
    for (let i = 0; i < sparkles.length; i++) {
      const phase = this.glowTimer * 3 + i * 1.2;
      ctx.globalAlpha = ((Math.sin(phase) + 1) / 2) * 0.9;
      ctx.beginPath();
      ctx.arc(this.x + sparkles[i].ox, this.y + sparkles[i].oy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
