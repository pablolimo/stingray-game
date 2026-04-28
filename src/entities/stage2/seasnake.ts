import { SmallEnemy } from '../entityRoles';

function createSeaSnakeSprite(level: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 24;
  c.height = 30;
  const ctx = c.getContext('2d')!;

  const glowColor = level >= 3 ? '#44ffdd' : '#44ddcc';

  // Bioluminescent glow
  const grd = ctx.createRadialGradient(12, 15, 2, 12, 15, 14);
  grd.addColorStop(0, `${glowColor}66`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 24, 30);

  // Snake body segments (wavy)
  const segments = [
    { x: 12, y: 4, r: 4 },
    { x: 9, y: 10, r: 3.5 },
    { x: 13, y: 16, r: 3 },
    { x: 9, y: 22, r: 2.5 },
    { x: 12, y: 28, r: 2 },
  ];
  ctx.fillStyle = '#1a3a32';
  for (const s of segments) {
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.r, s.r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bioluminescent stripe along body
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(12, 4);
  ctx.bezierCurveTo(9, 10, 13, 16, 9, 22);
  ctx.stroke();

  // Head (larger segment at top)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#224440';
  ctx.beginPath();
  ctx.ellipse(12, 4, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(10, 3, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, 3, 1.2, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class SeaSnake extends SmallEnemy {
  x: number;
  y: number;
  width: number = 24;
  height: number = 30;

  private sprite: HTMLCanvasElement;
  private zigzagAngle: number;
  private zigzagAmplitude: number;
  private speedMultiplier: number;
  private level: number;
  private glowTimer: number;

  constructor(x: number, y: number, speedMultiplier: number = 1.0, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.level = level;
    this.glowTimer = Math.random() * Math.PI * 2;
    this.zigzagAngle = Math.random() * Math.PI * 2;
    if (level >= 3) {
      this.speedMultiplier = 2.0;
      this.zigzagAmplitude = 70 + Math.random() * 30;
    } else {
      this.speedMultiplier = speedMultiplier;
      this.zigzagAmplitude = 45 + Math.random() * 25;
    }
    this.sprite = createSeaSnakeSprite(level);
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMultiplier * dt;
    const zigSpeed = this.level >= 3 ? 4.0 : 2.5;
    this.zigzagAngle += dt * zigSpeed * this.speedMultiplier;
    this.x += Math.sin(this.zigzagAngle) * this.zigzagAmplitude * dt;
    this.glowTimer += dt * 5;
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
    // Bioluminescent glow aura
    if (this.level >= 3) {
      ctx.save();
      const glowAlpha = 0.15 + Math.abs(Math.sin(this.glowTimer * 0.8)) * 0.15;
      ctx.globalAlpha = glowAlpha;
      const grd = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.width);
      grd.addColorStop(0, 'rgba(68,255,221,1)');
      grd.addColorStop(1, 'rgba(0,150,120,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
