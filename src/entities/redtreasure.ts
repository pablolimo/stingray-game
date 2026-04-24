import { Entity } from '../types';
import { RED_TREASURE_SCORE } from '../constants';

function createRedTreasureSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 24;
  const ctx = c.getContext('2d')!;

  // Shadow base
  ctx.fillStyle = 'rgba(120,0,0,0.4)';
  ctx.fillRect(2, 18, 28, 5);

  // Chest body – deep red
  ctx.fillStyle = '#5a1010';
  ctx.fillRect(3, 12, 26, 11);

  // Chest lid
  ctx.fillStyle = '#6e1515';
  ctx.fillRect(2, 7, 28, 8);
  ctx.fillRect(4, 5, 24, 4);
  ctx.fillRect(7, 3, 18, 4);

  // Red trim – horizontal band on lid
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(2, 11, 28, 2);

  // Red trim – vertical straps on body
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(3, 12, 3, 11);
  ctx.fillRect(14, 12, 4, 11);
  ctx.fillRect(26, 12, 3, 11);

  // Red trim – horizontal bottom strap
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(3, 20, 26, 2);

  // Gold lock/clasp
  ctx.fillStyle = '#ffdddd';
  ctx.fillRect(13, 9, 6, 5);
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(14, 10, 4, 3);
  ctx.fillStyle = '#ffdddd';
  ctx.fillRect(15, 11, 2, 2);

  // Keyhole
  ctx.fillStyle = '#330000';
  ctx.fillRect(15, 11, 2, 1);

  // Heart emblem on lid
  ctx.fillStyle = '#ff6666';
  ctx.fillRect(8, 7, 1, 3);
  ctx.fillRect(7, 8, 3, 1);

  // Bright glow overlay
  ctx.fillStyle = 'rgba(255, 60, 60, 0.15)';
  ctx.fillRect(4, 4, 24, 18);

  return c;
}

export class RedTreasure implements Entity {
  x: number;
  y: number;
  width: number = 64;
  height: number = 48;
  collected: boolean = false;
  score: number = RED_TREASURE_SCORE;

  private sprite: HTMLCanvasElement;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = createRedTreasureSprite();
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

    // Pulsing red glow ring
    const glowAlpha = 0.2 + Math.sin(this.glowTimer) * 0.12;
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = '#ff2222';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.3, this.width * 0.85, this.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rotating star-burst rays
    ctx.save();
    ctx.translate(this.x, this.y);
    const rayAlpha = 0.35 + Math.sin(this.glowTimer * 1.5) * 0.15;
    ctx.globalAlpha = rayAlpha;
    ctx.strokeStyle = '#ff4444';
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

    // Draw the chest sprite
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Sparkle dots
    ctx.save();
    ctx.fillStyle = '#ffaaaa';
    const sparkles = [
      { ox: -14, oy: -12 },
      { ox: 14, oy: -10 },
      { ox: 0, oy: -16 },
      { ox: -10, oy: 2 },
      { ox: 12, oy: 4 },
    ];
    for (let i = 0; i < sparkles.length; i++) {
      const phase = this.glowTimer * 3 + i * 1.2;
      const alpha = (Math.sin(phase) + 1) / 2;
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.arc(this.x + sparkles[i].ox, this.y + sparkles[i].oy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
