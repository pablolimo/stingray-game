import { SmallEnemy } from '../entityRoles';

const NUM_SEGMENTS = 14;

export class SeaSnake extends SmallEnemy {
  x: number;
  y: number;
  width: number = 30;
  height: number = 70;

  private zigzagAngle: number;
  private zigzagAmplitude: number;
  private speedMultiplier: number;
  private level: number;
  private glowTimer: number;
  private wigglePhase: number;

  constructor(x: number, y: number, speedMultiplier: number = 1.0, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.level = level;
    this.glowTimer = Math.random() * Math.PI * 2;
    this.zigzagAngle = Math.random() * Math.PI * 2;
    this.wigglePhase = Math.random() * Math.PI * 2;
    if (level >= 3) {
      this.speedMultiplier = 2.0;
      this.zigzagAmplitude = 70 + Math.random() * 30;
    } else {
      this.speedMultiplier = speedMultiplier;
      this.zigzagAmplitude = 45 + Math.random() * 25;
    }
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;
    const zigSpeed = this.level >= 3 ? 4.0 : 2.5;
    this.zigzagAngle += dt * zigSpeed * this.speedMultiplier;
    this.x += Math.sin(this.zigzagAngle) * this.zigzagAmplitude * dt;
    this.glowTimer += dt * 5;
    this.wigglePhase += dt * (this.level >= 3 ? 9 : 6);
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width * 0.8,
      height: this.height * 0.85,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const glowColor = this.level >= 3 ? '#ffee44' : '#ffdd44';
    const wiggleAmp = this.level >= 3 ? 10 : 7;
    const segSpacing = this.height / NUM_SEGMENTS;

    ctx.save();

    // Outer aura for level 3
    if (this.level >= 3) {
      const glowAlpha = 0.12 + Math.abs(Math.sin(this.glowTimer * 0.8)) * 0.12;
      ctx.globalAlpha = glowAlpha;
      const grd = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, this.width * 1.2);
      grd.addColorStop(0, 'rgba(255,230,50,1)');
      grd.addColorStop(1, 'rgba(180,140,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw each segment from tail (bottom) up to head (top)
    for (let i = NUM_SEGMENTS - 1; i >= 0; i--) {
      const t = i / (NUM_SEGMENTS - 1); // 0 = head, 1 = tail
      const segY = this.y - this.height / 2 + t * this.height;
      const segX = this.x + Math.sin(this.wigglePhase - i * 0.55) * wiggleAmp;
      const segR = 5 - t * 3.5; // head ~5px, tail ~1.5px

      // Segment glow halo
      const haloAlpha = 0.18 + Math.abs(Math.sin(this.glowTimer * 0.4 + i * 0.3)) * 0.12;
      ctx.globalAlpha = haloAlpha;
      const haloGrd = ctx.createRadialGradient(segX, segY, 0, segX, segY, segR * 3);
      haloGrd.addColorStop(0, glowColor);
      haloGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrd;
      ctx.beginPath();
      ctx.arc(segX, segY, segR * 3, 0, Math.PI * 2);
      ctx.fill();

      // Body segment
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a3a32';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.ellipse(segX, segY, segR, segR * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bioluminescent spine connecting segments
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const t = i / (NUM_SEGMENTS - 1);
      const segY = this.y - this.height / 2 + t * this.height;
      const segX = this.x + Math.sin(this.wigglePhase - i * 0.55) * wiggleAmp;
      if (i === 0) ctx.moveTo(segX, segY);
      else ctx.lineTo(segX, segY);
    }
    ctx.stroke();

    // Head
    ctx.shadowBlur = 0;
    const headX = this.x + Math.sin(this.wigglePhase) * wiggleAmp;
    const headY = this.y - this.height / 2;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#224440';
    ctx.beginPath();
    ctx.ellipse(headX, headY, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(headX - 2.5, headY - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 2.5, headY - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
