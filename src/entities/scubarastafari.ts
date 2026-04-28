import { Entity } from '../types';
import { createScubaRastafariBossSprites } from '../sprites';
import {
  CANVAS_WIDTH,
  BOSS_MAX_HP,
  BOSS_RAGE_DURATION,
  BOSS_LASER_HIT_INTERVAL,
} from '../constants';
import { HarpoonProjectile } from './harpoon';
import { EnergyBall } from './energyball';

// Boss width/height = 2.0× the ScubaKitten (88×100) – 20% smaller than original 2.5×
const BOSS_WIDTH = 176;
const BOSS_HEIGHT = 200;

const BOSS_TARGET_Y = 210; // resting vertical position
const BOSS_CHASE_SPEED = 75; // horizontal pixels per second
const BOSS_SHOOT_INTERVAL_MIN = 1.6;
const BOSS_SHOOT_INTERVAL_MAX = 2.6;

export class ScubaRastafariBoss implements Entity {
  x: number;
  y: number;
  width: number = BOSS_WIDTH;
  height: number = BOSS_HEIGHT;

  hp: number;
  maxHp: number;
  defeated: boolean = false;

  /** Set each frame by game.ts to track the stingray */
  targetX: number = CANVAS_WIDTH / 2;
  targetY: number = 500;

  isRaging: boolean = false;
  rageSpin: number = 0; // angle for spinning extra arms (updated in render)

  pendingHarpoons: HarpoonProjectile[] = [];
  pendingEnergyBalls: EnergyBall[] = [];

  laserHitCooldown: number = 0;
  hitFlash: number = 0;

  private normalSprites: HTMLCanvasElement[];
  private rageSprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;

  private shootTimer: number = 0;
  private shootInterval: number;
  private rageShootTimer: number = 0;
  private rageTimer: number = 0;
  private floatTime: number = 0;

  // rage triggers at 75%, 50%, 25% HP remaining
  private rageThresholds: number[];
  private nextRageIdx: number = 0;

  constructor(x: number, startY: number) {
    this.x = x;
    this.y = startY;
    this.hp = BOSS_MAX_HP;
    this.maxHp = BOSS_MAX_HP;
    this.rageThresholds = [
      Math.floor(BOSS_MAX_HP * 0.75),
      Math.floor(BOSS_MAX_HP * 0.50),
      Math.floor(BOSS_MAX_HP * 0.25),
    ];
    this.shootInterval =
      BOSS_SHOOT_INTERVAL_MIN +
      Math.random() * (BOSS_SHOOT_INTERVAL_MAX - BOSS_SHOOT_INTERVAL_MIN);
    this.normalSprites = createScubaRastafariBossSprites(false);
    this.rageSprites = createScubaRastafariBossSprites(true);
  }

  update(dt: number, _scrollSpeed: number): void {
    if (this.defeated) return;

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this.floatTime += dt;

    // Slide into screen from top
    if (this.y < BOSS_TARGET_Y) {
      this.y = Math.min(BOSS_TARGET_Y, this.y + 110 * dt);
    }

    // Gentle vertical float
    const floatTarget = BOSS_TARGET_Y + Math.sin(this.floatTime * 0.75) * 18;
    this.y += (floatTarget - this.y) * 1.8 * dt;

    // Horizontal chase (clamped to screen)
    const dx = this.targetX - this.x;
    const step = BOSS_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    const margin = this.width * 0.38;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

    // Sprite animation
    this.animTimer += dt;
    if (this.animTimer >= 0.4) {
      this.animTimer -= 0.4;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    if (this.isRaging) {
      this.rageSpin += dt * 3.2;
      this.rageTimer += dt;

      // Rapid energy ball bursts during rage
      this.rageShootTimer += dt;
      if (this.rageShootTimer >= 0.55) {
        this.rageShootTimer = 0;
        this.fireEnergyBurst();
      }

      if (this.rageTimer >= BOSS_RAGE_DURATION) {
        this.isRaging = false;
        this.rageTimer = 0;
        this.nextRageIdx++;
      }
    } else {
      // Regular harpoon fire
      this.shootTimer += dt;
      if (this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shootInterval =
          BOSS_SHOOT_INTERVAL_MIN +
          Math.random() * (BOSS_SHOOT_INTERVAL_MAX - BOSS_SHOOT_INTERVAL_MIN);
        this.pendingHarpoons.push(
          new HarpoonProjectile(
            this.x - this.width * 0.44, // left arm gun barrel in sprite coords
            this.y + 10,
            this.targetX,
            this.targetY,
          ),
        );
      }
    }
  }

  private fireEnergyBurst(): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.pendingEnergyBalls.push(new EnergyBall(this.x, this.y + 20, angle));
    }
  }

  /** Returns true when the boss is destroyed by the laser. */
  takeLaserHit(): boolean {
    if (this.isRaging || this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = BOSS_LASER_HIT_INTERVAL;
    this.hitFlash = 0.12;
    this.hp -= 1;
    this.checkRageTrigger();
    return this.hp <= 0;
  }

  /** Returns true when the boss is destroyed by a pearl. */
  takePearlHit(): boolean {
    if (this.isRaging) return false;
    this.hitFlash = 0.12;
    this.hp -= 1;
    this.checkRageTrigger();
    return this.hp <= 0;
  }

  private checkRageTrigger(): void {
    if (
      this.nextRageIdx < this.rageThresholds.length &&
      this.hp <= this.rageThresholds[this.nextRageIdx]
    ) {
      this.isRaging = true;
      this.rageTimer = 0;
      this.rageShootTimer = 0;
      this.rageSpin = 0;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.34,
      y: this.y - this.height * 0.34,
      width: this.width * 0.68,
      height: this.height * 0.68,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.defeated) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlash > 0) {
      ctx.filter = 'brightness(3)';
    }

    // Draw base boss sprite
    const sprite = (this.isRaging ? this.rageSprites : this.normalSprites)[this.animFrame];
    ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    ctx.filter = 'none';

    // Rage: extra 2 spinning arms + energy aura
    if (this.isRaging) {
      this.renderRageArms(ctx);
    }

    ctx.restore();

    // Boss HP bar (top of screen, full-width style)
    this.renderHPBar(ctx);
  }

  private renderRageArms(ctx: CanvasRenderingContext2D): void {
    const armLen = this.width * 0.62;
    const handR = 14;

    // Rage glow aura
    ctx.save();
    const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, armLen + handR);
    aura.addColorStop(0, 'rgba(255,255,0,0.18)');
    aura.addColorStop(1, 'rgba(255,200,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, armLen + handR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Two spinning arms (opposite each other)
    for (let i = 0; i < 2; i++) {
      const angle = this.rageSpin + (i / 2) * Math.PI;
      ctx.save();
      ctx.rotate(angle);
      ctx.lineCap = 'round';

      // Glowing arm shaft
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 13;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(-armLen, 0);
      ctx.lineTo(armLen, 0);
      ctx.stroke();

      // Inner bright stripe
      ctx.strokeStyle = '#fffaaa';
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(-armLen, 0);
      ctx.lineTo(armLen, 0);
      ctx.stroke();

      // Fists at both ends
      for (const ex of [-armLen, armLen]) {
        ctx.fillStyle = '#ffdd00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 14;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(ex, 0, handR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffaaa';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(ex, 0, handR * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderHPBar(ctx: CanvasRenderingContext2D): void {
    const barW = CANVAS_WIDTH - 60;
    const barH = 10;
    const barX = 30;
    const barY = 8;

    ctx.save();

    // Background track
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);
    ctx.fill();

    // HP fill
    const frac = Math.max(0, this.hp / this.maxHp);
    const fillColor = this.isRaging ? '#ffff00' : (frac > 0.5 ? '#ff4444' : frac > 0.25 ? '#ff8800' : '#ff2200');
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * frac, barH);

    // Border
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = this.isRaging ? '#ffff00' : '#ff4444';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = this.isRaging ? '#ffff00' : '#ff4444';
    ctx.shadowBlur = 6;
    ctx.strokeRect(barX, barY, barW, barH);

    // "BOSS" label (left of bar)
    ctx.shadowBlur = 0;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.isRaging ? '#ffff00' : '#ff8888';
    ctx.globalAlpha = 1;
    ctx.fillText('BOSS', barX, barY - 2);

    // Rage flash label
    if (this.isRaging) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.fillText('UNTOUCHABLE RAGE!', barX + barW, barY - 2);
    }

    ctx.restore();
  }
}
