import { CANVAS_WIDTH } from '../../constants';
import { BigEnemy } from '../entityRoles';

// Draws the sea turtle directly on `ctx`.
// The logical drawing area is 80×48 units, centred at (40, 24).
// flipAngle: oscillating angle (radians) for flipper flapping animation.
function drawSeaTurtle(ctx: CanvasRenderingContext2D, flipAngle: number): void {
  // ── Colour palette ────────────────────────────────────────────────────────
  const SHELL_DARK   = '#1a3a24';
  const SHELL_MID    = '#2d5c3c';
  const SHELL_LIGHT  = '#4a7c5a';
  const SCUTE_COLOR  = '#3d6b4a';
  const SCUTE_LINE   = '#5a9970';
  const FLIPPER_DARK = '#1c3a22';
  const FLIPPER_MID  = '#3a6840';
  const HEAD_DARK    = '#2d5030';
  const HEAD_LIGHT   = '#5a8a5e';
  const NECK_COLOR   = '#3a6647';
  const GLOW_COLOR   = '#44ee88';

  // Shell centred at (38, 24), rx=22, ry=14
  const SX = 38, SY = 24, SRX = 22, SRY = 14;

  // ── Helper: draw one flipper ──────────────────────────────────────────────
  // pivotX/Y: attachment point on the shell edge.
  // baseAngle: rest angle (radians) for the flipper pointing outward.
  // len: length of the flipper from pivot.
  // flip: +1 or -1 to control which way the flap goes.
  function drawFlipper(
    px: number, py: number,
    baseAngle: number,
    len: number, wid: number,
    flip: number,
  ): void {
    const angle = baseAngle + flip * flipAngle;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    const fg = ctx.createLinearGradient(0, 0, len, 0);
    fg.addColorStop(0, FLIPPER_MID);
    fg.addColorStop(1, FLIPPER_DARK);
    ctx.fillStyle = fg;
    ctx.beginPath();
    // Pointed-blade shape: wide at base, tapering to a rounded tip
    ctx.moveTo(0, -wid * 0.6);
    ctx.bezierCurveTo(len * 0.4, -wid * 0.8, len * 0.85, -wid * 0.45, len, 0);
    ctx.bezierCurveTo(len * 0.85,  wid * 0.45, len * 0.4,  wid * 0.8, 0,  wid * 0.6);
    ctx.closePath();
    ctx.fill();
    // Vein lines
    ctx.strokeStyle = 'rgba(80,160,100,0.4)';
    ctx.lineWidth = 0.6;
    for (let v = -1; v <= 1; v++) {
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(len * 0.88, v * wid * 0.38);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 1. Rear flippers (drawn first, fully behind the shell) ───────────────
  // Rear flippers pivot at the back-left edge of the shell, flap gently
  drawFlipper(SX - SRX * 0.6, SY - SRY * 0.7,  -Math.PI * 0.65, 14, 4.5, -1);  // rear-upper
  drawFlipper(SX - SRX * 0.6, SY + SRY * 0.7,   Math.PI * 0.65, 14, 4.5,  1);  // rear-lower

  // ── 2. Front flippers (drawn before shell; base hidden under shell) ───────
  // Front flippers pivot near the front-side of the shell, flap more strongly
  drawFlipper(SX + SRX * 0.35, SY - SRY * 0.8, -Math.PI * 0.38, 18, 5.5, -1); // front-upper
  drawFlipper(SX + SRX * 0.35, SY + SRY * 0.8,  Math.PI * 0.38, 18, 5.5,  1); // front-lower

  // ── 3. Shell ──────────────────────────────────────────────────────────────
  const shellGrad = ctx.createRadialGradient(SX, SY - 2, 4, SX, SY, 26);
  shellGrad.addColorStop(0,    SHELL_LIGHT);
  shellGrad.addColorStop(0.55, SHELL_MID);
  shellGrad.addColorStop(1,    SHELL_DARK);
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(SX, SY, SRX, SRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scute pattern
  const scutes: [number, number, number, number, number][] = [
    [SX,      SY - 2,  9,  6,   0],
    [SX - 10, SY - 4,  7, 4.5,  0],
    [SX + 10, SY - 4,  7, 4.5,  0],
    [SX - 11, SY + 5,  5,  3.5, 0.3],
    [SX + 11, SY + 5,  5,  3.5,-0.3],
    [SX,      SY + 7,  8,  4.5, 0],
  ];
  for (const [sx, sy, rx, ry, angle] of scutes) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.fillStyle = SCUTE_COLOR;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = SCUTE_LINE;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }

  // Scute highlight lines
  ctx.strokeStyle = 'rgba(100,180,120,0.35)';
  ctx.lineWidth = 0.8;
  for (const [sx, sy, rx, ry] of scutes) {
    ctx.beginPath();
    ctx.arc(sx - rx * 0.25, sy - ry * 0.3, rx * 0.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Bioluminescent shell rim
  ctx.strokeStyle = '#66cc88';
  ctx.lineWidth = 1.8;
  ctx.shadowColor = GLOW_COLOR;
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.ellipse(SX, SY, SRX, SRY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Plastron sheen
  ctx.fillStyle = '#c8d8a0';
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.ellipse(SX, SY + 4, 14, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Shell top sheen
  ctx.save();
  ctx.globalAlpha = 0.12;
  const sheen = ctx.createLinearGradient(SX - 14, SY - 10, SX + 6, SY + 4);
  sheen.addColorStop(0, '#ffffff');
  sheen.addColorStop(1, 'transparent');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(SX - 4, SY - 4, 14, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── 4. Neck ───────────────────────────────────────────────────────────────
  // Short neck connecting the right shell edge to the head
  ctx.fillStyle = NECK_COLOR;
  ctx.beginPath();
  ctx.ellipse(SX + SRX + 2, SY, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── 5. Head (outside the shell, to the right) ─────────────────────────────
  const HX = SX + SRX + 11, HY = SY - 1;   // centre of head, clearly outside shell
  const headGrad = ctx.createRadialGradient(HX - 2, HY - 2, 1, HX, HY, 9);
  headGrad.addColorStop(0, HEAD_LIGHT);
  headGrad.addColorStop(1, HEAD_DARK);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(HX, HY, 9, 7, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Head scute plates
  ctx.strokeStyle = 'rgba(100,180,110,0.5)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(HX - 5, HY - 4); ctx.lineTo(HX + 4, HY - 4);
  ctx.moveTo(HX - 5, HY);     ctx.lineTo(HX + 4, HY);
  ctx.moveTo(HX,     HY - 4); ctx.lineTo(HX,     HY + 4);
  ctx.stroke();

  // Nostril
  ctx.fillStyle = '#1a2e1c';
  ctx.beginPath();
  ctx.ellipse(HX + 7, HY - 2, 1.1, 0.8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0a1a0c';
  ctx.beginPath();
  ctx.arc(HX + 1, HY - 3, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#99ffbb';
  ctx.shadowColor = '#44ff88';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(HX + 0.8, HY - 3, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(HX + 0.2, HY - 3.6, 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export class SeaTurtle extends BigEnemy {
  x: number;
  y: number;
  // Slightly wider than before to give the head room on the right
  width: number = 160;
  height: number = 96;
  targetX: number;

  private level: number;
  private angle: number;
  private flipperTimer: number = 0;
  private flipAngle: number = 0;

  constructor(x: number, y: number, targetX: number, level: number = 1) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.level = level;
    const dx = targetX - x;
    this.angle = Math.atan2(1, dx / CANVAS_WIDTH) * 0.3;
  }

  update(dt: number, scrollSpeed: number): void {
    const speedMult = this.level >= 3 ? 1.6 : 1.35;
    this.y += scrollSpeed * speedMult * dt;
    this.x += Math.sin(this.angle) * scrollSpeed * 0.25 * dt;
    this.flipperTimer += dt * 2.5;
    this.flipAngle = Math.sin(this.flipperTimer) * 0.32;
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
    // Scale from the logical 80×48 drawing space to the display size (160×96)
    ctx.scale(this.width / 80, this.height / 48);
    // Centre the logical drawing area on the origin
    ctx.translate(-40, -24);
    drawSeaTurtle(ctx, this.flipAngle);
    ctx.restore();
  }
}

