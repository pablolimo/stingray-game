import { createHeartSprite } from './sprites';
import { CANVAS_WIDTH } from './constants';

export class HUD {
  private heartSprite: HTMLCanvasElement;

  constructor() {
    this.heartSprite = createHeartSprite();
  }

  render(ctx: CanvasRenderingContext2D, score: number, hp: number): void {
    // Score
    ctx.save();
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`SCORE: ${score}`, 10, 24);

    // Hearts top right
    for (let i = 0; i < hp; i++) {
      ctx.drawImage(this.heartSprite, CANVAS_WIDTH - 12 - (hp - i) * 14, 8, 12, 12);
    }
    ctx.restore();
  }
}
