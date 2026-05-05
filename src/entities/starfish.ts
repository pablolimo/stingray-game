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
  private glowPhase: number = 0;
  private glow: boolean;

  constructor(x: number, y: number, glow: boolean = true) {
    super();
    this.x = x;
    this.y = y;
    this.glow = glow;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.rotation += dt * 1.5;
    if (this.glow) {
      this.glowPhase = (this.glowPhase + dt * 2.0) % (Math.PI * 2);
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const outerR = this.width / 2;
    const innerR = this.width / 5;

    if (this.glow) {
      // Animate gradient phase between yellow (t=0) and green (t=1)
      const t = Math.sin(this.glowPhase) * 0.5 + 0.5;
      const centerHue = 60 - t * 30; // 60 (yellow) → 30 (yellow-green)
      const outerHue = 120 - t * 40; // 120 (green) → 80 (yellow-green)

      // Outer glow halo
      const haloR = outerR * 1.6;
      const halo = ctx.createRadialGradient(0, 0, outerR * 0.4, 0, 0, haloR);
      halo.addColorStop(0, `hsla(${centerHue}, 100%, 65%, 0.55)`);
      halo.addColorStop(1, 'hsla(100, 100%, 50%, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.fill();

      // Star fill gradient (yellow center → green outer)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR);
      grad.addColorStop(0, `hsl(${centerHue}, 100%, 70%)`);
      grad.addColorStop(0.55, `hsl(${centerHue - 10}, 100%, 55%)`);
      grad.addColorStop(1, `hsl(${outerHue}, 100%, 40%)`);

      // Glow shadow
      ctx.shadowColor = `hsl(${(centerHue + outerHue) / 2}, 100%, 60%)`;
      ctx.shadowBlur = 14 + t * 6;
      ctx.fillStyle = grad;

      // Draw 5-pointed star path
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Bright inner highlight star (smaller)
      ctx.shadowBlur = 0;
      const hiGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR * 0.45);
      hiGrad.addColorStop(0, `hsla(${centerHue + 15}, 100%, 95%, 0.7)`);
      hiGrad.addColorStop(1, 'hsla(60, 100%, 80%, 0)');
      ctx.fillStyle = hiGrad;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR * 0.45 : innerR * 0.45;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Non-glowing: plain orange-red starfish
      ctx.fillStyle = '#e05020';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Subtle highlight
      ctx.fillStyle = 'rgba(255,180,120,0.4)';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR * 0.5 : innerR * 0.5;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
