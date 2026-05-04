import { Entity } from '../../types';
import { CANVAS_WIDTH, SCUBA_KITTEN_MAX_HP, SCUBA_KITTEN_LASER_HIT_INTERVAL, NUCLEAR_EEL_FIELD_RADIUS } from '../../constants';
import { Level3Enemy } from '../entityRoles';

const EEL_LIFETIME = 8.0;
const EEL_FADE_TIME = 0.9;
const EEL_HORIZONTAL_SPEED = 55;
const EEL_ZAG_AMPLITUDE = 70;
const EEL_ZAG_FREQUENCY = 2.2;

function createEelSprites(): HTMLCanvasElement[] {
  return [0, 1].map(frame => {
    const c = document.createElement('canvas');
    c.width = 52;
    c.height = 90;
    const ctx = c.getContext('2d')!;

    const offset = frame === 0 ? 0 : 6;

    // Electric field glow (faint)
    const fieldGrd = ctx.createRadialGradient(26, 45, 10, 26, 45, 46);
    fieldGrd.addColorStop(0, 'rgba(0,200,255,0.06)');
    fieldGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = fieldGrd;
    ctx.fillRect(0, 0, 52, 90);

    // Eel body segments – wriggling
    const segments = 8;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2a5a1a';
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const sy = 10 + t * 72;
      const sx = 26 + Math.sin(t * Math.PI * 2.5 + offset * 0.5) * (8 + t * 4);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Body lighter stripe
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#4a8a2a';
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const sy = 10 + t * 72;
      const sx = 26 + Math.sin(t * Math.PI * 2.5 + offset * 0.5) * (8 + t * 4);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Electric stripes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0,200,255,0.6)';
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 4;
    for (let stripe = 0; stripe < 6; stripe++) {
      const t = (stripe + 1) / 8;
      const sy = 10 + t * 72;
      const sx = 26 + Math.sin(t * Math.PI * 2.5 + offset * 0.5) * (8 + t * 4);
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy);
      ctx.lineTo(sx + 6, sy);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Head
    const headX = 26 + Math.sin(offset * 0.5) * 5;
    ctx.fillStyle = '#1a4a10';
    ctx.beginPath();
    ctx.ellipse(headX, 10, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffee00';
    ctx.shadowColor = '#ffee00';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(headX - 4, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 4, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(headX - 4, 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 4, 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX, 14, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    return c;
  });
}

export class ElectricEel extends Level3Enemy {
  x: number;
  y: number;
  width: number = 52;
  height: number = 90;
  expired: boolean = false;
  targetX: number;
  targetY: number;
  hp: number = SCUBA_KITTEN_MAX_HP;
  laserHitCooldown: number = 0;
  readonly fieldRadius: number = NUCLEAR_EEL_FIELD_RADIUS;

  private sprites: HTMLCanvasElement[];
  private lifetime: number = 0;
  private zigzagPhase: number;
  private animTimer: number = 0;
  private animFrame: number = 0;
  private hitFlash: number = 0;

  private _pendingProjectiles: Entity[] = [];
  get pendingProjectiles(): Entity[] { return this._pendingProjectiles; }
  set pendingProjectiles(v: Entity[]) { this._pendingProjectiles = v; }

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.sprites = createEelSprites();
    this.zigzagPhase = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= EEL_LIFETIME) { this.expired = true; return; }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    // Zigzag movement
    this.zigzagPhase += EEL_ZAG_FREQUENCY * dt;
    const zagX = Math.sin(this.zigzagPhase) * EEL_ZAG_AMPLITUDE;
    const dx = (this.targetX + zagX) - this.x;
    const step = EEL_HORIZONTAL_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;

    this.y += scrollSpeed * 0.25 * dt;
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));

    this.animTimer += dt;
    if (this.animTimer >= 0.18) { this.animTimer -= 0.18; this.animFrame = (this.animFrame + 1) % 2; }
  }

  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = SCUBA_KITTEN_LASER_HIT_INTERVAL;
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  takePearlHit(): boolean {
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  /** Body bounding box (2-damage zone). */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.35,
      y: this.y - this.height * 0.35,
      width: this.width * 0.7,
      height: this.height * 0.7,
    };
  }

  /** Larger electric field bounding box (1-damage zone). */
  getFieldBounds(): { x: number; y: number; width: number; height: number } {
    const r = this.fieldRadius;
    return {
      x: this.x - r,
      y: this.y - r,
      width: r * 2,
      height: r * 2,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const timeLeft = EEL_LIFETIME - this.lifetime;
    if (timeLeft < EEL_FADE_TIME) ctx.globalAlpha = Math.max(0, timeLeft / EEL_FADE_TIME);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    ctx.drawImage(this.sprites[this.animFrame], -this.width / 2, -this.height / 2, this.width, this.height);

    // Electric field ring
    if (this.hitFlash <= 0) {
      ctx.filter = 'none';
      ctx.save();
      const fieldAlpha = 0.12 + Math.abs(Math.sin(this.lifetime * 4)) * 0.1;
      ctx.globalAlpha = fieldAlpha;
      const fGrd = ctx.createRadialGradient(0, 0, this.width * 0.3, 0, 0, this.fieldRadius);
      fGrd.addColorStop(0, 'rgba(0,200,255,0)');
      fGrd.addColorStop(0.6, 'rgba(0,200,255,0.4)');
      fGrd.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.fillStyle = fGrd;
      ctx.beginPath();
      ctx.arc(0, 0, this.fieldRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.hp < SCUBA_KITTEN_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < this.hp; i++) {
        const pipX = -((this.hp - 1) * 5) + i * 10;
        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.arc(pipX, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
