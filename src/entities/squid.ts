import { Entity } from '../types';
import { createSquidSprites } from '../sprites';
import { CANVAS_WIDTH } from '../constants';

const SQUID_LIFETIME = 4.0; // seconds before disappearing
const SQUID_FADE_TIME = 0.5; // seconds to fade out at end
const SQUID_SPIN_SPEED = 3.5; // radians per second
const SQUID_CHASE_SPEED = 140; // horizontal px per second toward player

export class Squid implements Entity {
  x: number;
  y: number;
  width: number = 48;
  height: number = 52;
  expired: boolean = false;
  targetX: number;

  private sprites: HTMLCanvasElement[];
  private spinAngle: number = 0;
  private animFrame: number = 0;
  private animTimer: number = 0;
  private lifetime: number = 0;

  constructor(x: number, y: number, targetX: number) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprites = createSquidSprites();
    this.spinAngle = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= SQUID_LIFETIME) {
      this.expired = true;
      return;
    }

    // Spin
    this.spinAngle += SQUID_SPIN_SPEED * dt;

    // Chase player horizontally
    const dx = this.targetX - this.x;
    const step = SQUID_CHASE_SPEED * dt;
    if (Math.abs(dx) > step) {
      this.x += Math.sign(dx) * step;
    } else {
      this.x += dx;
    }

    // Descend at a slower rate than scroll speed
    this.y += scrollSpeed * 0.55 * dt;

    // Clamp to screen bounds
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));

    // Animate frames
    this.animTimer += dt;
    if (this.animTimer >= 0.25) {
      this.animTimer -= 0.25;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.38,
      y: this.y - this.height * 0.38,
      width: this.width * 0.76,
      height: this.height * 0.76,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spinAngle);

    // Fade out near end of life
    const timeLeft = SQUID_LIFETIME - this.lifetime;
    if (timeLeft < SQUID_FADE_TIME) {
      ctx.globalAlpha = Math.max(0, timeLeft / SQUID_FADE_TIME);
    }

    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
