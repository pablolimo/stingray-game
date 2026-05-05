import { Entity } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, OTTER_MAX_HP, OTTER_LASER_HIT_INTERVAL } from '../../constants';
import { Level3Enemy, ProjectileEntity } from '../entityRoles';

const OTTER_THROW_INTERVAL_CALM = 2.4;
const OTTER_THROW_INTERVAL_AGGRO = 0.85;
const OTTER_AGGRO_THRESHOLD = 0.25; // 25% HP
const OTTER_SCROLL_FACTOR = 0.28;
const OTTER_ROCK_SPEED = 290;
const OTTER_AGGRO_CHASE_SPEED = 435;
const OTTER_ERRATIC_CHANGE_INTERVAL = 0.22;

// ── Rock projectile ──────────────────────────────────────────────────────────

function createRockSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext('2d')!;

  // Irregular rock polygon (5-sided)
  ctx.fillStyle = '#7a7a7a';
  ctx.beginPath();
  ctx.moveTo(8, 1);
  ctx.lineTo(14, 4);
  ctx.lineTo(15, 11);
  ctx.lineTo(9, 15);
  ctx.lineTo(2, 12);
  ctx.lineTo(1, 5);
  ctx.closePath();
  ctx.fill();

  // Mid-tone layer for depth
  ctx.fillStyle = '#929292';
  ctx.beginPath();
  ctx.moveTo(8, 3);
  ctx.lineTo(12, 5);
  ctx.lineTo(13, 10);
  ctx.lineTo(8, 13);
  ctx.lineTo(4, 10);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(6, 5, 3, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Crack detail
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(8, 6);
  ctx.lineTo(11, 9);
  ctx.lineTo(9, 12);
  ctx.stroke();

  return c;
}

export class OtterRock extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 16;
  height: number = 16;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private spinAngle: number = 0;
  private sprite: HTMLCanvasElement;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // Very sharp aim: ±5 px variation
    const jitterX = (Math.random() - 0.5) * 10;
    const jitterY = (Math.random() - 0.5) * 10;
    this.vx = ((dx + jitterX) / dist) * OTTER_ROCK_SPEED;
    this.vy = ((dy + jitterY) / dist) * OTTER_ROCK_SPEED;
    this.sprite = createRockSprite();
  }

  update(dt: number, scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.y += scrollSpeed * dt;
    this.spinAngle += 6 * dt;
    if (this.x < -40 || this.x > CANVAS_WIDTH + 40 || this.y < -40 || this.y > CANVAS_HEIGHT + 120) {
      this.active = false;
    }
  }

  getBounds() {
    return { x: this.x - 8, y: this.y - 8, width: 16, height: 16 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spinAngle);
    ctx.drawImage(this.sprite, -8, -8, 16, 16);
    ctx.restore();
  }
}

// ── Otter sprites ─────────────────────────────────────────────────────────────

function drawOtterCalm(ctx: CanvasRenderingContext2D, frame: number): void {
  const W = 110, H = 90;
  // Floating-on-back animation: slight paw rock based on frame
  const pawLift = frame === 0 ? 0 : -3;

  // Drop shadow (water depth)
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(62, 72, 38, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Main body (back / underside facing up)
  ctx.fillStyle = '#8b6030';
  ctx.beginPath();
  ctx.ellipse(62, 56, 42, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly / lighter chest
  ctx.fillStyle = '#d4a870';
  ctx.beginPath();
  ctx.ellipse(64, 52, 30, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body texture dots
  ctx.fillStyle = 'rgba(100,60,20,0.25)';
  for (const [bx, by, br] of [[75, 48, 2.5], [85, 54, 2], [90, 60, 2], [52, 58, 2], [60, 64, 1.8]]) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
  }

  // Tail (right end)
  ctx.fillStyle = '#6a4820';
  ctx.beginPath();
  ctx.ellipse(103, 56, 9, 14, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3810';
  ctx.beginPath();
  ctx.ellipse(106, 58, 5, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Head (left end) – round
  ctx.fillStyle = '#8b6030';
  ctx.beginPath();
  ctx.arc(19, 53, 21, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#c49060';
  ctx.beginPath();
  ctx.ellipse(19, 55, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ear flaps
  ctx.fillStyle = '#7a5020';
  ctx.beginPath(); ctx.ellipse(8, 38, 7, 5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(30, 36, 6, 5, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c06060';
  ctx.beginPath(); ctx.ellipse(8, 38, 4, 3, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(30, 36, 3.5, 3, 0.4, 0, Math.PI * 2); ctx.fill();

  // Eyes – looking upward (towards player)
  ctx.fillStyle = '#1a1008';
  ctx.beginPath(); ctx.arc(13, 47, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(26, 46, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2800';
  ctx.beginPath(); ctx.arc(13, 47, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(26, 46, 3.5, 0, Math.PI * 2); ctx.fill();
  // Glint
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(14, 46, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(27, 45, 1.4, 0, Math.PI * 2); ctx.fill();

  // Nose
  ctx.fillStyle = '#2a1800';
  ctx.beginPath(); ctx.ellipse(19, 57, 4.5, 3, 0, 0, Math.PI * 2); ctx.fill();

  // Whiskers
  ctx.strokeStyle = 'rgba(220,200,160,0.85)';
  ctx.lineWidth = 0.9;
  for (let w = -1; w <= 1; w++) {
    ctx.beginPath(); ctx.moveTo(10, 57 + w * 2); ctx.lineTo(-2, 55 + w * 2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(28, 57 + w * 2); ctx.lineTo(42, 55 + w * 2.5); ctx.stroke();
  }

  // Mouth (content smile)
  ctx.strokeStyle = '#2a1808';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(19, 61, 6, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Front paws (raised toward player / upward)
  ctx.fillStyle = '#8b6030';
  ctx.beginPath(); ctx.ellipse(53, 24 + pawLift, 9, 12, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(74, 21 + pawLift, 9, 12, 0.3, 0, Math.PI * 2); ctx.fill();
  // Paw pads
  ctx.fillStyle = '#6a4820';
  ctx.beginPath(); ctx.ellipse(53, 29 + pawLift, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(74, 26 + pawLift, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Rock held in paws
  ctx.fillStyle = '#7a7a7a';
  ctx.beginPath();
  ctx.moveTo(62, 10 + pawLift);
  ctx.lineTo(70, 13 + pawLift);
  ctx.lineTo(71, 20 + pawLift);
  ctx.lineTo(64, 23 + pawLift);
  ctx.lineTo(56, 20 + pawLift);
  ctx.lineTo(55, 13 + pawLift);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9a9a9a';
  ctx.beginPath();
  ctx.moveTo(63, 12 + pawLift);
  ctx.lineTo(68, 14 + pawLift);
  ctx.lineTo(68, 19 + pawLift);
  ctx.lineTo(63, 21 + pawLift);
  ctx.lineTo(58, 18 + pawLift);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(62, 14 + pawLift, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();

  // Back feet (at sides of body, relaxed)
  ctx.fillStyle = '#7a5020';
  ctx.beginPath(); ctx.ellipse(40, 74, 12, 6, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(84, 74, 12, 6, -0.1, 0, Math.PI * 2); ctx.fill();
  // Webbed toes
  ctx.fillStyle = '#6a4010';
  for (let t = 0; t < 4; t++) {
    ctx.beginPath(); ctx.ellipse(32 + t * 4, 77, 2, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(76 + t * 4, 77, 2, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawOtterAggro(ctx: CanvasRenderingContext2D, frame: number): void {
  // Upright angry otter
  const shakeDx = frame === 0 ? 0 : (Math.random() - 0.5) * 3;

  ctx.save();
  ctx.translate(shakeDx, 0);

  // Menacing aura
  const aura = ctx.createRadialGradient(55, 50, 8, 55, 50, 50);
  aura.addColorStop(0, 'rgba(180,0,0,0.18)');
  aura.addColorStop(1, 'rgba(180,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.ellipse(55, 50, 50, 45, 0, 0, Math.PI * 2); ctx.fill();

  // Body – darker, muscular
  ctx.fillStyle = '#5a3c1e';
  ctx.beginPath();
  ctx.ellipse(55, 60, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#a07040';
  ctx.beginPath();
  ctx.ellipse(55, 63, 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muscle definition
  ctx.fillStyle = 'rgba(80,40,10,0.3)';
  ctx.beginPath(); ctx.ellipse(47, 55, 5, 12, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(63, 55, 5, 12, 0.3, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = '#5a3c1e';
  ctx.beginPath();
  ctx.arc(55, 24, 20, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#9a7040';
  ctx.beginPath();
  ctx.ellipse(55, 26, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears (perked up / aggressive)
  ctx.fillStyle = '#4a2c0e';
  ctx.beginPath(); ctx.ellipse(40, 12, 7, 9, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 12, 7, 9, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b04040';
  ctx.beginPath(); ctx.ellipse(40, 12, 4, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 12, 4, 5, 0.4, 0, Math.PI * 2); ctx.fill();

  // Red glowing eyes
  ctx.fillStyle = '#880000';
  ctx.beginPath(); ctx.arc(47, 21, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(63, 21, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff0000';
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(47, 21, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(63, 21, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Pupils
  ctx.fillStyle = '#600000';
  ctx.beginPath(); ctx.ellipse(47, 21, 1.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(63, 21, 1.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();

  // Angry brows
  ctx.strokeStyle = '#2a1000';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(41, 15); ctx.lineTo(52, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(69, 15); ctx.lineTo(58, 18); ctx.stroke();

  // Nose
  ctx.fillStyle = '#1a0c00';
  ctx.beginPath(); ctx.ellipse(55, 29, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

  // Snarling mouth with teeth
  ctx.fillStyle = '#1a0c00';
  ctx.beginPath();
  ctx.arc(55, 35, 9, 0.05 * Math.PI, 0.95 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#eeeecc';
  for (let t = 0; t < 4; t++) {
    const ta = (0.1 + t * 0.2) * Math.PI;
    const tx = 55 + Math.cos(ta) * 8;
    const ty = 35 + Math.sin(ta) * 8;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 2, ty + 5); ctx.lineTo(tx + 2, ty + 5); ctx.closePath(); ctx.fill();
  }

  // Arms (raised outward – muscular)
  ctx.fillStyle = '#5a3c1e';
  ctx.beginPath(); ctx.ellipse(30, 52, 10, 22, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(80, 52, 10, 22, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a5030';
  ctx.beginPath(); ctx.ellipse(28, 44, 7, 12, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(82, 44, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill();
  // Fists
  ctx.fillStyle = '#5a3c1e';
  ctx.beginPath(); ctx.arc(24, 34, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(86, 34, 9, 0, Math.PI * 2); ctx.fill();

  // Legs
  ctx.fillStyle = '#5a3c1e';
  ctx.beginPath(); ctx.ellipse(43, 84, 10, 14, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(67, 84, 10, 14, 0.2, 0, Math.PI * 2); ctx.fill();
  // Feet (webbed)
  ctx.fillStyle = '#3a2410';
  for (let t = 0; t < 4; t++) {
    ctx.beginPath(); ctx.ellipse(36 + t * 4, 88, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(60 + t * 4, 88, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function createOtterCalmSprites(): HTMLCanvasElement[] {
  return [0, 1].map(frame => {
    const c = document.createElement('canvas');
    c.width = 110;
    c.height = 90;
    const ctx = c.getContext('2d')!;
    drawOtterCalm(ctx, frame);
    return c;
  });
}

function createOtterAggroSprites(): HTMLCanvasElement[] {
  return [0, 1, 2, 3].map(frame => {
    const c = document.createElement('canvas');
    c.width = 110;
    c.height = 90;
    const ctx = c.getContext('2d')!;
    drawOtterAggro(ctx, frame);
    return c;
  });
}

// ── RockThrowingOtter entity ──────────────────────────────────────────────────

export class RockThrowingOtter extends Level3Enemy {
  x: number;
  y: number;
  width: number = 110;
  height: number = 90;
  expired: boolean = false;
  targetX: number;
  targetY: number;
  hp: number = OTTER_MAX_HP;
  laserHitCooldown: number = 0;

  private calmSprites: HTMLCanvasElement[];
  private aggroSprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private hitFlash: number = 0;
  private throwTimer: number = 0;
  private isAggressive: boolean = false;
  private floatPhase: number;
  private floatX: number;

  // Aggressive erratic movement
  private erraticVx: number = 0;
  private erraticVy: number = 0;
  private erraticTimer: number = 0;
  private calmDirY: number = 1;

  private _pendingProjectiles: Entity[] = [];
  get pendingProjectiles(): Entity[] { return this._pendingProjectiles; }
  set pendingProjectiles(v: Entity[]) { this._pendingProjectiles = v; }

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.floatPhase = Math.random() * Math.PI * 2;
    this.floatX = x;
    this.calmSprites = createOtterCalmSprites();
    this.aggroSprites = createOtterAggroSprites();
    // Stagger the first throw so all otters don't throw simultaneously
    this.throwTimer = Math.random() * OTTER_THROW_INTERVAL_CALM;
  }

  update(dt: number, scrollSpeed: number): void {
    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this.floatPhase += dt * 0.9;

    // Transition to aggressive when HP drops to 25%
    if (!this.isAggressive && this.hp <= Math.ceil(OTTER_MAX_HP * OTTER_AGGRO_THRESHOLD)) {
      this.isAggressive = true;
      this.animFrame = 0;
      this.animTimer = 0;
    }

    if (this.isAggressive) {
      this.updateAggressive(dt, scrollSpeed);
    } else {
      this.updateCalm(dt, scrollSpeed);
    }

    // Animate
    const interval = this.isAggressive ? 0.12 : 0.35;
    const frameCount = this.isAggressive ? this.aggroSprites.length : this.calmSprites.length;
    this.animTimer += dt;
    if (this.animTimer >= interval) {
      this.animTimer -= interval;
      this.animFrame = (this.animFrame + 1) % frameCount;
    }

    // Rock throwing
    this.throwTimer += dt;
    const throwInterval = this.isAggressive ? OTTER_THROW_INTERVAL_AGGRO : OTTER_THROW_INTERVAL_CALM;
    if (this.throwTimer >= throwInterval) {
      this.throwTimer = 0;
      // Very sharp aim
      this._pendingProjectiles.push(new OtterRock(this.x, this.y - this.height * 0.3, this.targetX, this.targetY));
    }
  }

  private updateCalm(dt: number, scrollSpeed: number): void {
    // Drift gently, slight horizontal float
    this.floatX += Math.sin(this.floatPhase * 0.5) * 18 * dt;
    this.floatX = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.floatX));
    this.x += (this.floatX - this.x) * 1.2 * dt;
    // Vertical movement with direction bounce so the otter never leaves the screen
    this.y += this.calmDirY * scrollSpeed * OTTER_SCROLL_FACTOR * dt;
    this.y += this.calmDirY * Math.sin(this.floatPhase) * 8 * dt;

    // Bounce at bottom: reverse direction upward
    if (this.y > CANVAS_HEIGHT - this.height / 2) {
      this.y = CANVAS_HEIGHT - this.height / 2;
      this.calmDirY = -1;
    }
    // Bounce at top: reverse direction downward
    if (this.y < this.height / 2) {
      this.y = this.height / 2;
      this.calmDirY = 1;
    }
  }

  private updateAggressive(dt: number, scrollSpeed: number): void {
    // Erratic movement: random velocity changes at shorter intervals
    this.erraticTimer += dt;
    if (this.erraticTimer >= OTTER_ERRATIC_CHANGE_INTERVAL) {
      this.erraticTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const speed = OTTER_AGGRO_CHASE_SPEED * (0.8 + Math.random() * 1.4);
      this.erraticVx = Math.cos(angle) * speed;
      this.erraticVy = Math.sin(angle) * speed;
    }

    // Chase player with strong erratic component
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const chaseVx = (dx / dist) * OTTER_AGGRO_CHASE_SPEED * 0.4;
    const chaseVy = (dy / dist) * OTTER_AGGRO_CHASE_SPEED * 0.4;

    this.x += (chaseVx + this.erraticVx) * dt;
    this.y += (chaseVy + this.erraticVy) * dt;
    this.y += scrollSpeed * 0.1 * dt; // minimal scroll influence in aggro

    // Clamp to screen – aggressive otter never leaves until killed
    const margin = this.width * 0.45;
    const marginY = this.height * 0.45;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    this.y = Math.max(marginY, Math.min(CANVAS_HEIGHT - marginY, this.y));
  }

  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = OTTER_LASER_HIT_INTERVAL;
    this.hitFlash = 0.1;
    this.hp -= 1;
    if (this.hp <= 0) { this.expired = true; return true; }
    return false;
  }

  takePearlHit(): boolean {
    this.hitFlash = 0.1;
    this.hp -= 1;
    if (this.hp <= 0) { this.expired = true; return true; }
    return false;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.38,
      y: this.y - this.height * 0.38,
      width: this.width * 0.76,
      height: this.height * 0.76,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    const sprites = this.isAggressive ? this.aggroSprites : this.calmSprites;
    ctx.drawImage(sprites[this.animFrame], -this.width / 2, -this.height / 2, this.width, this.height);

    ctx.filter = 'none';

    // HP bar
    const barW = 70;
    const barH = 7;
    const barX = -barW / 2;
    const barY = -this.height / 2 - 16;

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2);
    ctx.fill();

    const frac = Math.max(0, this.hp / OTTER_MAX_HP);
    const barColor = this.isAggressive
      ? '#ff3300'
      : (frac > 0.5 ? '#44cc44' : frac > 0.25 ? '#aaaa00' : '#ff4400');
    if (this.isAggressive) {
      ctx.shadowColor = '#ff3300';
      ctx.shadowBlur = 6;
    }
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * frac, barH);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = this.isAggressive ? '#ff4400' : '#88aa44';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
