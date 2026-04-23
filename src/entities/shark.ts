import { Entity } from '../types';
import { createSharkSprite } from '../sprites';
import { CANVAS_WIDTH } from '../constants';

export class Shark implements Entity {
  x: number;
  y: number;
  width: number = 120;
  height: number = 72;
  private sprite: HTMLCanvasElement;
  private speedMultiplier: number;
  private angle: number;

  constructor(x: number, y: number, targetX: number) {
    this.x = x;
    this.y = y;
    this.sprite = createSharkSprite();
    this.speedMultiplier = 1.5;
    // Slight angle toward target
    const dx = targetX - x;
    this.angle = Math.atan2(1, dx / CANVAS_WIDTH) * 0.3;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;
    this.x += Math.sin(this.angle) * scrollSpeed * 0.3 * dt;
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
