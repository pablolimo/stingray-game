import { SpeedBoostCollectible } from '../entityRoles';

const ARROW_COLORS = ['#ffee00', '#ff8800', '#ff2200', '#ff00cc', '#8800ff', '#00ccff'];

function createSpeedBoostSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 56;
  c.height = 46;
  const ctx = c.getContext('2d')!;

  // Draw 3 stacked caret-up arrows, each with a full rainbow gradient
  const offsets = [30, 20, 10];
  const gradientPairs: [string, string][] = [
    [ARROW_COLORS[0], ARROW_COLORS[2]], // yellow → red
    [ARROW_COLORS[3], ARROW_COLORS[4]], // pink → purple
    [ARROW_COLORS[5], ARROW_COLORS[0]], // cyan → yellow
  ];
  for (let i = 0; i < 3; i++) {
    const y = offsets[i];
    const grd = ctx.createLinearGradient(4, y, 52, y);
    grd.addColorStop(0, gradientPairs[i][0]);
    grd.addColorStop(1, gradientPairs[i][1]);
    ctx.fillStyle = grd;
    ctx.shadowColor = gradientPairs[i][0];
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(28, y - 10);     // top point
    ctx.lineTo(4, y + 2);       // bottom-left
    ctx.lineTo(11, y + 2);      // inner left
    ctx.lineTo(28, y - 3);      // center
    ctx.lineTo(45, y + 2);      // inner right
    ctx.lineTo(52, y + 2);      // bottom-right
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  return c;
}

export class SpeedBoostPowerup extends SpeedBoostCollectible {
  x: number;
  y: number;
  width: number = 200;
  height: number = 46;
  collected: boolean = false;

  private sprite: HTMLCanvasElement;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createSpeedBoostSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 4;
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

    // Shiny rainbow glow halo
    ctx.save();
    const haloAlpha = 0.35 + Math.abs(Math.sin(this.glowTimer)) * 0.3;
    ctx.globalAlpha = haloAlpha;
    const hue = (this.glowTimer * 60) % 360;
    const grd = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, 60);
    grd.addColorStop(0, `hsla(${hue},100%,75%,0.9)`);
    grd.addColorStop(0.5, `hsla(${(hue + 120) % 360},100%,65%,0.5)`);
    grd.addColorStop(1, `hsla(${(hue + 240) % 360},100%,50%,0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
