import { Entity } from '../types';
import { createScubaKittenSprites } from '../sprites';
import { CANVAS_WIDTH, SCUBA_KITTEN_MAX_HP, SCUBA_KITTEN_LASER_HIT_INTERVAL } from '../constants';
import { HarpoonProjectile } from './harpoon';
import { Level3Enemy } from './entityRoles';

const SCUBA_KITTEN_LIFETIME = 7.0; // seconds before disappearing
const SCUBA_KITTEN_FADE_TIME = 0.8; // seconds to fade out at end
const SCUBA_KITTEN_CHASE_SPEED = 65; // reduced horizontal chase speed
const SCUBA_KITTEN_SHOOT_INTERVAL_MIN = 1.25; // seconds between harpoon shots (2× more frequent)
const SCUBA_KITTEN_SHOOT_INTERVAL_MAX = 2.25;

export class ScubaKitten extends Level3Enemy {
  x: number;
  y: number;
  width: number = 88;
  height: number = 100;
  expired: boolean = false;
  targetX: number;
  targetY: number;
  hp: number = SCUBA_KITTEN_MAX_HP;

  /** Harpoons queued for the game loop to collect */
  pendingHarpoons: HarpoonProjectile[] = [];

  get pendingProjectiles(): Entity[] { return this.pendingHarpoons; }
  set pendingProjectiles(v: Entity[]) { this.pendingHarpoons = v as HarpoonProjectile[]; }

  private sprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private lifetime: number = 0;
  private shootTimer: number = 0;
  private shootInterval: number;
  laserHitCooldown: number = 0;
  hitFlash: number = 0;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.sprites = createScubaKittenSprites();
    this.shootInterval = SCUBA_KITTEN_SHOOT_INTERVAL_MIN +
      Math.random() * (SCUBA_KITTEN_SHOOT_INTERVAL_MAX - SCUBA_KITTEN_SHOOT_INTERVAL_MIN);
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= SCUBA_KITTEN_LIFETIME) {
      this.expired = true;
      return;
    }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    // Chase player horizontally
    const dx = this.targetX - this.x;
    const step = SCUBA_KITTEN_CHASE_SPEED * dt;
    if (Math.abs(dx) > step) {
      this.x += Math.sign(dx) * step;
    } else {
      this.x += dx;
    }

    // Descend at a slower rate than scroll speed
    this.y += scrollSpeed * 0.22 * dt;

    // Clamp to screen bounds
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));

    // Animate frames
    this.animTimer += dt;
    if (this.animTimer >= 0.35) {
      this.animTimer -= 0.35;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Shoot harpoon
    this.shootTimer += dt;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shootInterval = SCUBA_KITTEN_SHOOT_INTERVAL_MIN +
        Math.random() * (SCUBA_KITTEN_SHOOT_INTERVAL_MAX - SCUBA_KITTEN_SHOOT_INTERVAL_MIN);
      // Spawn harpoon from the gun barrel (right side of kitten)
      const harpoon = new HarpoonProjectile(
        this.x + this.width * 0.4,
        this.y + 5,
        this.targetX,
        this.targetY,
      );
      this.pendingHarpoons.push(harpoon);
    }
  }

  /** Returns true when the kitten is destroyed by the laser. */
  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = SCUBA_KITTEN_LASER_HIT_INTERVAL;
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  /** Returns true when the kitten is destroyed by a pearl. */
  takePearlHit(): boolean {
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.4,
      y: this.y - this.height * 0.4,
      width: this.width * 0.8,
      height: this.height * 0.8,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Fade out near end of life
    const timeLeft = SCUBA_KITTEN_LIFETIME - this.lifetime;
    if (timeLeft < SCUBA_KITTEN_FADE_TIME) {
      ctx.globalAlpha = Math.max(0, timeLeft / SCUBA_KITTEN_FADE_TIME);
    }

    // Flash white when hit
    if (this.hitFlash > 0) {
      ctx.filter = 'brightness(3)';
    }

    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    // HP pips above the kitten
    if (this.hp < SCUBA_KITTEN_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < this.hp; i++) {
        const pipX = -((this.hp - 1) * 5) + i * 10;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(pipX, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
