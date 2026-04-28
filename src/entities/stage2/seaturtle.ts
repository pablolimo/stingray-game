import { CANVAS_WIDTH } from '../../constants';
import { BigEnemy } from '../entityRoles';

function createSeaTurtleSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 72;
  c.height = 48;
  const ctx = c.getContext('2d')!;

  // --- Shell base (rich gradient) ---
  const shellGrad = ctx.createRadialGradient(36, 22, 4, 36, 20, 26);
  shellGrad.addColorStop(0, '#4a7c5a');   // olive-green highlight
  shellGrad.addColorStop(0.55, '#2d5c3c');
  shellGrad.addColorStop(1, '#1a3a24');
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(36, 22, 27, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Scute (shell plate) pattern ---
  // Central large scute
  ctx.fillStyle = '#3d6b4a';
  ctx.beginPath();
  ctx.ellipse(36, 20, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a9970';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Side scutes (vertebral row)
  const scuteCenters: [number, number, number, number, number][] = [
    // x,  y,  rx, ry, angle
    [24, 18,  8, 5,  0],
    [48, 18,  8, 5,  0],
    [22, 28,  6, 4,  0.3],
    [50, 28,  6, 4, -0.3],
    [36, 31,  9, 5,  0],
  ];
  for (const [sx, sy, rx, ry, angle] of scuteCenters) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.fillStyle = '#3a6647';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a9970';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  // Scute highlight lines
  ctx.strokeStyle = 'rgba(100,180,120,0.35)';
  ctx.lineWidth = 0.8;
  for (const [sx, sy, rx, ry] of scuteCenters) {
    ctx.beginPath();
    ctx.arc(sx - rx * 0.25, sy - ry * 0.3, rx * 0.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // --- Bioluminescent shell rim ---
  ctx.strokeStyle = '#66cc88';
  ctx.lineWidth = 1.8;
  ctx.shadowColor = '#44ee88';
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.ellipse(36, 22, 27, 17, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // --- Plastron (belly visible around edges) ---
  ctx.fillStyle = '#c8d8a0';
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.ellipse(36, 26, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Flippers ---
  const flippers: [number, number, number, number, number][] = [
    // x,   y,  rx,  ry,  angle
    [13, 16,  12, 5,  -0.55],   // front-left
    [59, 16,  12, 5,   0.55],   // front-right
    [15, 32,  10, 4.5,  0.55],  // rear-left
    [57, 32,  10, 4.5, -0.55],  // rear-right
  ];
  for (const [fx, fy, frx, fry, fa] of flippers) {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(fa);
    const flipGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, frx);
    flipGrad.addColorStop(0, '#3a6840');
    flipGrad.addColorStop(1, '#1c3a22');
    ctx.fillStyle = flipGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, frx, fry, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flipper vein lines
    ctx.strokeStyle = 'rgba(80,160,100,0.45)';
    ctx.lineWidth = 0.7;
    for (let v = -1; v <= 1; v++) {
      ctx.beginPath();
      ctx.moveTo(-frx * 0.1, 0);
      ctx.lineTo(frx * 0.9, v * fry * 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Head ---
  const headGrad = ctx.createRadialGradient(58, 16, 2, 56, 17, 10);
  headGrad.addColorStop(0, '#5a8a5e');
  headGrad.addColorStop(1, '#2d5030');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(57, 17, 9, 7, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Head scute plates
  ctx.strokeStyle = 'rgba(100,180,110,0.5)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(52, 13); ctx.lineTo(60, 13);
  ctx.moveTo(52, 17); ctx.lineTo(60, 17);
  ctx.moveTo(56, 13); ctx.lineTo(56, 21);
  ctx.stroke();

  // Nostril
  ctx.fillStyle = '#1a2e1c';
  ctx.beginPath();
  ctx.ellipse(63, 14, 1.2, 0.8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye (bright, alert)
  ctx.fillStyle = '#0a1a0c';
  ctx.beginPath();
  ctx.arc(58, 13, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#99ffbb';
  ctx.shadowColor = '#44ff88';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(57.8, 13, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(57.2, 12.3, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Shell top sheen ---
  ctx.save();
  ctx.globalAlpha = 0.12;
  const sheen = ctx.createLinearGradient(20, 8, 48, 28);
  sheen.addColorStop(0, '#ffffff');
  sheen.addColorStop(1, 'transparent');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(36, 18, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return c;
}

export class SeaTurtle extends BigEnemy {
  x: number;
  y: number;
  width: number = 144;
  height: number = 96;
  targetX: number;

  private sprite: HTMLCanvasElement;
  private level: number;
  private angle: number;

  constructor(x: number, y: number, targetX: number, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.level = level;
    this.sprite = createSeaTurtleSprite();
    const dx = targetX - x;
    this.angle = Math.atan2(1, dx / CANVAS_WIDTH) * 0.3;
  }

  update(dt: number, scrollSpeed: number): void {
    // Slightly slower than sharks
    const speedMult = this.level >= 3 ? 1.6 : 1.35;
    this.y += scrollSpeed * speedMult * dt;
    // Turtles don't actively hunt even at level 3 - just drift
    this.x += Math.sin(this.angle) * scrollSpeed * 0.25 * dt;
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
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
