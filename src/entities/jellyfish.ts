import { Entity } from '../types';
import { createJellyfishSprites } from '../sprites';

export class Jellyfish implements Entity {
  x: number;
  y: number;
  width: number = 16;
  height: number = 20;
  private sprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private driftAngle: number;
  private driftAmplitude: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprites = createJellyfishSprites();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftAmplitude = 30 + Math.random() * 30;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y -= scrollSpeed * dt;
    this.driftAngle += dt * 1.5;
    this.x += Math.sin(this.driftAngle) * this.driftAmplitude * dt;

    this.animTimer += dt;
    if (this.animTimer >= 0.4) {
      this.animTimer -= 0.4;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width * 0.8, height: this.height * 0.7 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
