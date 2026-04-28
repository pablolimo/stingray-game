import { createSharkSprite } from '../sprites';
import { CANVAS_WIDTH } from '../constants';
import { BigEnemy } from './entityRoles';

export class Shark extends BigEnemy {
  x: number;
  y: number;
  width: number = 120;
  height: number = 72;
  targetX: number;
  private sprite: HTMLCanvasElement;
  private speedMultiplier: number;
  private angle: number;
  private level: number;

  constructor(x: number, y: number, targetX: number, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprite = createSharkSprite();
    this.level = level;
    this.speedMultiplier = level >= 3 ? 1.8 : 1.5;
    // Slight angle toward target
    const dx = targetX - x;
    this.angle = Math.atan2(1, dx / CANVAS_WIDTH) * 0.3;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;

    if (this.level >= 3) {
      // Level 3: actively track the player horizontally
      const dx = this.targetX - this.x;
      const huntSpeed = scrollSpeed * 0.5;
      const step = huntSpeed * dt;
      if (Math.abs(dx) > step) {
        this.x += Math.sign(dx) * step;
      } else {
        this.x += dx;
      }
      // Clamp
      this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    } else {
      this.x += Math.sin(this.angle) * scrollSpeed * 0.3 * dt;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
