import { FISH_SCORE } from '../../constants';
import { FoodCollectible } from '../entityRoles';

function createShrimpSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 24;
  c.height = 20;
  const ctx = c.getContext('2d')!;

  // ── Body – filled curved crescent shape ──────────────────────────────────
  // The shrimp curves in a C-shape: tail at bottom-left, head at right.
  // Back (dorsal) outer curve goes high; belly inner curve stays lower.
  const bodyGrad = ctx.createLinearGradient(3, 10, 22, 6);
  bodyGrad.addColorStop(0, '#ff5599');
  bodyGrad.addColorStop(0.5, '#ff88cc');
  bodyGrad.addColorStop(1, '#ffaad8');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Back / dorsal side (outer, upper arc)
  ctx.moveTo(4, 15);                                  // tail base – lower-left
  ctx.bezierCurveTo(2, 8, 10, 1, 20, 7);             // outer curve sweeping up
  // Head (small rounded tip on the right)
  ctx.quadraticCurveTo(23, 9, 21, 12);
  // Belly / ventral side (inner, lower arc)
  ctx.bezierCurveTo(14, 15, 5, 17, 4, 15);           // belly arc back to tail
  ctx.closePath();
  ctx.fill();

  // ── Shiny highlight on back ──────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.55;
  const shine = ctx.createLinearGradient(5, 4, 14, 10);
  shine.addColorStop(0, '#ffffff');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.moveTo(6, 12);
  ctx.bezierCurveTo(5, 7, 11, 3, 18, 8);
  ctx.bezierCurveTo(14, 6, 7, 9, 6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Abdominal segments (curved stripes across the body) ──────────────────
  ctx.save();
  ctx.strokeStyle = 'rgba(200,30,100,0.55)';
  ctx.lineWidth = 0.7;
  // Five segment lines, evenly spaced along the C-curve
  const segments: [number, number, number, number][] = [
    [7,  14,  6,  9],
    [10, 14,  9,  7],
    [13, 14, 12,  5],
    [16, 13, 15,  5],
    [19, 11, 18,  6],
  ];
  for (const [x1, y1, x2, y2] of segments) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // ── Tail fan (3 small petal shapes at bottom-left) ───────────────────────
  const tailColors = ['#ff44aa', '#ff66bb', '#ff88cc'];
  const tailPetals: [number, number, number][] = [
    [4, 16, -0.5],
    [4, 16,  0.1],
    [4, 16,  0.7],
  ];
  for (let i = 0; i < tailPetals.length; i++) {
    const [tx, ty, angle] = tailPetals[i];
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(angle + Math.PI / 2 + 0.3);
    ctx.fillStyle = tailColors[i];
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, 3, 2.2, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Eye (right side – the head) ──────────────────────────────────────────
  ctx.fillStyle = '#220011';
  ctx.beginPath();
  ctx.arc(20, 9, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffaadd';
  ctx.beginPath();
  ctx.arc(19.7, 8.7, 0.55, 0, Math.PI * 2);
  ctx.fill();

  // ── Antennae (two long thin lines from the head) ─────────────────────────
  ctx.strokeStyle = '#ffbbdd';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(22, 7);
  ctx.lineTo(24, 2);   // upper antenna
  ctx.moveTo(22, 8);
  ctx.lineTo(24, 6);   // lower antenna
  ctx.stroke();

  // ── Walking legs / pleopods (small lines from the belly) ─────────────────
  ctx.strokeStyle = 'rgba(255,100,180,0.65)';
  ctx.lineWidth = 0.55;
  const legs: [number, number, number, number][] = [
    [13, 15, 12, 18],
    [15, 14, 14, 17],
    [17, 13, 16, 16],
    [19, 12, 18, 15],
  ];
  for (const [x1, y1, x2, y2] of legs) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  return c;
}

export class Shrimp extends FoodCollectible {
  x: number;
  y: number;
  width: number = 40;
  height: number = 34;
  collected: boolean = false;
  score: number = FISH_SCORE;

  private sprite: HTMLCanvasElement;
  private driftAngle: number;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createShrimpSprite();
    this.driftAngle = Math.random() * Math.PI * 2;
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.driftAngle += dt * 1.8;
    this.x += Math.sin(this.driftAngle) * 18 * dt;
    this.glowTimer += dt * 3.5;
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

    // Pink shimmer glow
    ctx.save();
    const gAlpha = 0.12 + Math.abs(Math.sin(this.glowTimer)) * 0.18;
    ctx.globalAlpha = gAlpha;
    const grd = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.width * 0.85);
    grd.addColorStop(0, '#ff88cc');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(
      this.sprite,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
  }
}
