import { Entity } from '../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KILLER_WHALE_MAX_HP, KILLER_WHALE_LASER_HIT_INTERVAL } from '../../constants';
import { Level3Enemy, ProjectileEntity } from '../entityRoles';

const WHALE_LIFETIME = 9.0;
const WHALE_FADE_TIME = 1.0;
const WHALE_CHASE_SPEED = 90;
const WHALE_CHARGE_SPEED = 560;
const WHALE_CHARGE_INTERVAL = 2.2;
const WHALE_CHARGE_DURATION = 0.45;

// ── Sonic Pulse projectile ───────────────────────────────────────────────────

export class WhaleSonicPulse extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 18;
  height: number = 18;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private radius: number = 9;
  private animTimer: number = 0;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 320;
    this.vx = (dx / dist) * speed + (Math.random() - 0.5) * 60;
    this.vy = (dy / dist) * speed + (Math.random() - 0.5) * 60;
  }

  update(dt: number, scrollSpeed: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.y += scrollSpeed * dt * 0.3;
    this.animTimer += dt;
    if (this.x < -40 || this.x > CANVAS_WIDTH + 40 || this.y < -100 || this.y > CANVAS_HEIGHT + 100) {
      this.active = false;
    }
  }

  getBounds() {
    return { x: this.x - this.radius, y: this.y - this.radius, width: this.radius * 2, height: this.radius * 2 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    ctx.save();
    const pulse = Math.abs(Math.sin(this.animTimer * 8));
    ctx.globalAlpha = 0.8 + pulse * 0.2;
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 10;
    // Concentric rings for sonic pulse
    for (let r = 0; r < 3; r++) {
      ctx.strokeStyle = r === 0 ? '#88ccff' : r === 1 ? '#4488ff' : '#2244aa';
      ctx.lineWidth = 2 - r * 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, (this.radius - r * 2.5) * (1 + pulse * 0.15), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ── KillerWhale entity ───────────────────────────────────────────────────────

function createKillerWhaleSprite(charge: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 90;
  c.height = 60;
  const ctx = c.getContext('2d')!;

  const bodyColor = charge ? '#1a1a1a' : '#111111';
  const patchColor = '#eeeeee';

  // Body – large oval
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(40, 30, 36, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // White saddle patch behind dorsal fin
  ctx.fillStyle = patchColor;
  ctx.beginPath();
  ctx.ellipse(38, 20, 14, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // White belly patch
  ctx.fillStyle = patchColor;
  ctx.beginPath();
  ctx.ellipse(35, 34, 18, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye patch (white oval around eye)
  ctx.fillStyle = patchColor;
  ctx.beginPath();
  ctx.ellipse(14, 22, 7, 5.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(14, 22, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(12.5, 20.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin (tall and straight for orca)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(42, 10);
  ctx.lineTo(50, charge ? -4 : -8); // taller when charging
  ctx.lineTo(58, 12);
  ctx.lineTo(54, 14);
  ctx.lineTo(46, 12);
  ctx.closePath();
  ctx.fill();

  // Pectoral fins (large rounded paddles)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(22, 40, 14, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(54, 42, 14, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Tail flukes (horizontal)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(70, 30);
  ctx.lineTo(88, 20);
  ctx.lineTo(84, 30);
  ctx.lineTo(88, 40);
  ctx.lineTo(70, 30);
  ctx.closePath();
  ctx.fill();

  // White trailing edge on fluke
  ctx.fillStyle = 'rgba(200,200,200,0.15)';
  ctx.beginPath();
  ctx.moveTo(78, 24);
  ctx.lineTo(88, 20);
  ctx.lineTo(84, 30);
  ctx.lineTo(84, 30);
  ctx.closePath();
  ctx.fill();

  // Charge glow
  if (charge) {
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(40, 30, 37, 23, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  return c;
}

export class KillerWhale extends Level3Enemy {
  x: number;
  y: number;
  width: number = 90;
  height: number = 60;
  expired: boolean = false;
  targetX: number;
  targetY: number;
  hp: number = KILLER_WHALE_MAX_HP;
  laserHitCooldown: number = 0;
  pendingProjectiles: Entity[] = [];

  private normalSprite: HTMLCanvasElement;
  private chargeSprite: HTMLCanvasElement;
  private lifetime: number = 0;
  private hitFlash: number = 0;
  private charging: boolean = false;
  private chargeTimer: number = 0;
  private chargeVx: number = 0;
  private chargeVy: number = 0;
  private shootTimer: number = 0;
  private shootInterval: number;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.normalSprite = createKillerWhaleSprite(false);
    this.chargeSprite = createKillerWhaleSprite(true);
    // Frantic: frequent charges
    this.shootTimer = 0.5 + Math.random() * 0.5;
    this.shootInterval = 1.2 + Math.random() * 0.8;
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= WHALE_LIFETIME) { this.expired = true; return; }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    if (this.charging) {
      // Frantic charge
      this.chargeTimer += dt;
      this.x += this.chargeVx * dt;
      this.y += this.chargeVy * dt;
      if (this.chargeTimer >= WHALE_CHARGE_DURATION) {
        this.charging = false;
        this.chargeTimer = 0;
      }
    } else {
      // Chase player
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const step = WHALE_CHASE_SPEED * dt;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.x += (dx / dist) * Math.min(step, dist);
      this.y += (dy / dist) * Math.min(step, dist);
      this.y += scrollSpeed * 0.4 * dt;

      // Charge timer
      this.chargeTimer += dt;
      if (this.chargeTimer >= WHALE_CHARGE_INTERVAL) {
        this.chargeTimer = 0;
        this.charging = true;
        const cdx = this.targetX - this.x;
        const cdy = this.targetY - this.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
        this.chargeVx = (cdx / cdist) * WHALE_CHARGE_SPEED;
        this.chargeVy = (cdy / cdist) * WHALE_CHARGE_SPEED;
      }
    }

    // Fire sonic pulses at player (frantic pattern – frequent)
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.shootTimer = this.shootInterval;
      // Spray 2 pulses
      for (let i = 0; i < 2; i++) {
        this.pendingProjectiles.push(new WhaleSonicPulse(
          this.x, this.y,
          this.targetX + (Math.random() - 0.5) * 80,
          this.targetY + (Math.random() - 0.5) * 80,
        ));
      }
    }

    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    this.y = Math.max(-this.height, Math.min(CANVAS_HEIGHT + this.height * 0.5, this.y));
  }

  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = KILLER_WHALE_LASER_HIT_INTERVAL;
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  takePearlHit(): boolean {
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  getBounds() {
    return {
      x: this.x - this.width * 0.42,
      y: this.y - this.height * 0.42,
      width: this.width * 0.84,
      height: this.height * 0.84,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const timeLeft = WHALE_LIFETIME - this.lifetime;
    if (timeLeft < WHALE_FADE_TIME) ctx.globalAlpha = Math.max(0, timeLeft / WHALE_FADE_TIME);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    const sprite = this.charging ? this.chargeSprite : this.normalSprite;
    ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    if (this.hp < KILLER_WHALE_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      const dotCount = Math.min(this.hp, 8);
      for (let i = 0; i < dotCount; i++) {
        const px = -((dotCount - 1) * 5) + i * 10;
        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.arc(px, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
