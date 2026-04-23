import { Entity } from '../types';
import { createFishSprites } from '../sprites';
import { FISH_SCORE } from '../constants';

export class Fish implements Entity {
  x: number;
  y: number;
  width: number = 12;
  height: number = 8;
  colorVariant: 0 | 1 | 2;
  animFrame: number = 0;
  animTimer: number = 0;
  collected: boolean = false;
  score: number = FISH_SCORE;

  private sprites: HTMLCanvasElement[][];
  private driftAngle: number;
  private driftSpeed: number;

  constructor(x: number, y: number, colorVariant: 0 | 1 | 2 = 0) {
    this.x = x;
    this.y = y;
    this.colorVariant = colorVariant;
    this.sprites = createFishSprites();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = 20 + Math.random() * 20;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y -= scrollSpeed * dt;
    this.driftAngle += dt * 2;
    this.x += Math.sin(this.driftAngle) * this.driftSpeed * dt;

    this.animTimer += dt;
    if (this.animTimer >= 0.2) {
      this.animTimer -= 0.2;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    const sprite = this.sprites[this.colorVariant][this.animFrame];
    ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
