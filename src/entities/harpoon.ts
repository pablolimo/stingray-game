import { Entity } from '../types';
import { createHarpoonSprite } from '../sprites';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const HARPOON_SPEED = 380; // px per second

export class HarpoonProjectile implements Entity {
  x: number;
  y: number;
  width: number = 10;
  height: number = 30;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private angle: number;
  private sprite: HTMLCanvasElement;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    this.sprite = createHarpoonSprite();

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.vx = (dx / dist) * HARPOON_SPEED;
    this.vy = (dy / dist) * HARPOON_SPEED;
    this.angle = Math.atan2(dy, dx) - Math.PI / 2;
  }

  update(dt: number, _scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y > CANVAS_HEIGHT + 40 || this.y < -40 || this.x < -40 || this.x > CANVAS_WIDTH + 40) {
      this.active = false;
    }
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
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
