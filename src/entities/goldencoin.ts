import { createGoldenCoinSprite } from '../sprites';
import { CoinCollectible } from './entityRoles';

const COIN_SIZE = 20;
const COIN_SPIN_SPEED = 3.5; // radians per second (visual spin)
const COIN_MIN_SCALE = 0.05; // minimum scaleX when coin is edge-on during spin
const COIN_GLOW_SPEED = 4.0;

export class GoldenCoin extends CoinCollectible {
  x: number;
  y: number;
  width: number = COIN_SIZE;
  height: number = COIN_SIZE;
  collected: boolean = false;

  private sprite: HTMLCanvasElement;
  private spinAngle: number;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createGoldenCoinSprite();
    this.spinAngle = Math.random() * Math.PI * 2;
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.spinAngle += COIN_SPIN_SPEED * dt;
    this.glowTimer += COIN_GLOW_SPEED * dt;
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

    // Shimmering glow
    const glowStrength = 0.25 + Math.abs(Math.sin(this.glowTimer)) * 0.35;
    ctx.globalAlpha = glowStrength;
    const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.width * 0.9);
    glowGrad.addColorStop(0, 'rgba(255,230,50,1)');
    glowGrad.addColorStop(1, 'rgba(255,160,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Coin body — simulate 3D spin by squishing scaleX
    ctx.globalAlpha = 1;
    const scaleX = Math.abs(Math.cos(this.spinAngle));
    ctx.scale(Math.max(COIN_MIN_SCALE, scaleX), 1);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    ctx.restore();

    // Sparkle particles (2 small twinkles around coin)
    const sparkAlpha = Math.max(0, Math.sin(this.glowTimer * 1.5)) * 0.8;
    if (sparkAlpha > 0.1) {
      ctx.save();
      ctx.globalAlpha = sparkAlpha;
      ctx.fillStyle = '#fffacc';
      for (let i = 0; i < 4; i++) {
        const sa = (i / 4) * Math.PI * 2 + this.spinAngle;
        const sr = 12 + Math.sin(this.glowTimer + i) * 3;
        const sx = this.x + Math.cos(sa) * sr;
        const sy = this.y + Math.sin(sa) * sr;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
