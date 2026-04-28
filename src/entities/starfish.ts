import { createStarfishSprite } from '../sprites';
import { STARFISH_SCORE } from '../constants';
import { BonusFoodCollectible } from './entityRoles';

export class Starfish extends BonusFoodCollectible {
  x: number;
  y: number;
  width: number = 48;
  height: number = 48;
  collected: boolean = false;
  score: number = STARFISH_SCORE;
  private rotation: number = 0;
  private sprite: HTMLCanvasElement;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createStarfishSprite();
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.rotation += dt * 1.5;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
