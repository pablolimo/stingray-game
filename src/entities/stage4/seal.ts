import { SmallEnemy } from '../entityRoles';

function createSealSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 52;
  c.height = 44;
  const ctx = c.getContext('2d')!;

  // Body – dark grey seal
  const bodyGrd = ctx.createRadialGradient(24, 24, 4, 24, 24, 24);
  bodyGrd.addColorStop(0, '#707070');
  bodyGrd.addColorStop(0.7, '#505050');
  bodyGrd.addColorStop(1, '#303030');
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.ellipse(24, 26, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly (lighter)
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.ellipse(24, 28, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hind flippers (forked tail)
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(16, 38);
  ctx.lineTo(8, 44);
  ctx.lineTo(14, 36);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(32, 38);
  ctx.lineTo(40, 44);
  ctx.lineTo(34, 36);
  ctx.closePath();
  ctx.fill();

  // Front flippers
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.ellipse(10, 26, 7, 3.5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(38, 26, 7, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#5a5a5a';
  ctx.beginPath();
  ctx.ellipse(24, 12, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout / muzzle
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.ellipse(24, 16, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.moveTo(24 + side * 6, 15 + w * 2);
      ctx.lineTo(24 + side * 18, 14 + w * 2 - 1);
      ctx.stroke();
    }
  }

  // Eyes (big cute seal eyes)
  ctx.fillStyle = '#111';
  ctx.shadowColor = '#222';
  ctx.shadowBlur = 3;
  ctx.beginPath(); ctx.arc(19, 10, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(29, 10, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(17.5, 8.5, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(27.5, 8.5, 1.4, 0, Math.PI * 2); ctx.fill();

  // Nose
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(24, 17, 2.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Seal extends SmallEnemy {
  x: number;
  y: number;
  width: number = 52;
  height: number = 44;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;
  private speedMult: number;
  private level: number;
  private bobTimer: number;

  constructor(x: number, y: number, speedMult: number = 1.0, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createSealSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.level = level;
    this.speedMult = level >= 3 ? 2.0 : speedMult;
    this.bobTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * this.speedMult * dt;
    this.bobTimer += dt * 2.5;
    this.driftAngle += dt * (this.level >= 3 ? 3.0 : 1.2);
    this.x += Math.sin(this.driftAngle) * 45 * dt;
  }

  getBounds() {
    return { x: this.x - this.width * 0.45, y: this.y - this.height * 0.45, width: this.width * 0.9, height: this.height * 0.9 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.bobTimer) * 3);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
