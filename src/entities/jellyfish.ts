import { createJellyfishSprites } from '../sprites';
import { SmallEnemy } from './entityRoles';

const LIGHTNING_JITTER = 3; // pixels of zigzag jitter per lightning bolt segment

export class Jellyfish extends SmallEnemy {
  x: number;
  y: number;
  width: number = 48;
  height: number = 60;
  private sprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private driftAngle: number;
  private driftAmplitude: number;
  private speedMultiplier: number;
  private level: number;
  private electricTimer: number;

  constructor(x: number, y: number, speedMultiplier: number = 1.0, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.sprites = createJellyfishSprites();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.level = level;
    this.electricTimer = Math.random() * Math.PI * 2;

    if (level >= 3) {
      this.speedMultiplier = 2.2;
      this.driftAmplitude = 60 + Math.random() * 30;
    } else {
      this.speedMultiplier = speedMultiplier;
      this.driftAmplitude = 30 + Math.random() * 30;
    }
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;

    const driftSpeed = this.level >= 3 ? 3.5 : 1.5;
    this.driftAngle += dt * driftSpeed * this.speedMultiplier;
    this.x += Math.sin(this.driftAngle) * this.driftAmplitude * dt;

    this.electricTimer += dt * 6;

    this.animTimer += dt;
    if (this.animTimer >= 0.4) {
      this.animTimer -= 0.4;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width * 0.8, height: this.height * 0.7 };
  }

  private renderElectricAura(ctx: CanvasRenderingContext2D): void {
    const numBolts = 5;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 8;

    for (let b = 0; b < numBolts; b++) {
      const baseAngle = (b / numBolts) * Math.PI * 2 + this.electricTimer * 0.5;
      const boltLen = 10 + Math.sin(this.electricTimer + b * 1.7) * 5;

      ctx.strokeStyle = b % 2 === 0 ? '#88eeff' : '#ffffff';
      ctx.globalAlpha = 0.6 + Math.sin(this.electricTimer + b) * 0.3;
      ctx.beginPath();
      let lx = 0;
      let ly = 0;
      ctx.moveTo(lx, ly);
      const steps = 4;
      for (let s = 0; s < steps; s++) {
        const t = (s + 1) / steps;
        // zigzag lightning path
        const jitter = s % 2 === 0 ? LIGHTNING_JITTER : -LIGHTNING_JITTER;
        lx = Math.cos(baseAngle) * boltLen * t + Math.sin(baseAngle + Math.PI / 2) * jitter;
        ly = Math.sin(baseAngle) * boltLen * t + Math.cos(baseAngle + Math.PI / 2) * jitter;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.level >= 3) {
      ctx.save();
      ctx.translate(this.x, this.y - this.height * 0.1);
      this.renderElectricAura(ctx);
      ctx.restore();

      // Electric glow around the jellyfish bell
      ctx.save();
      const glowAlpha = 0.18 + Math.abs(Math.sin(this.electricTimer * 0.8)) * 0.15;
      ctx.globalAlpha = glowAlpha;
      const glowGrad = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, this.width * 0.7);
      glowGrad.addColorStop(0, 'rgba(80,200,255,1)');
      glowGrad.addColorStop(1, 'rgba(0,100,200,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
