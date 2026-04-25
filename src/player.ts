import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_MAX_SPEED, PLAYER_ACCELERATION, PLAYER_DAMPING, INVINCIBILITY_DURATION, PLAYER_MAX_HP, SHIELD_DURATION } from './constants';
import { InputHandler } from './input';
import { createStingraySprites } from './sprites';

export class Player {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  hp: number = PLAYER_MAX_HP;
  invincibleTimer: number = 0;
  shieldActive: boolean = false;
  shieldTimer: number = 0;
  animFrame: number = 0;
  animTimer: number = 0;
  width: number = 96;
  height: number = 96;

  private sprites: HTMLCanvasElement[];

  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT * 0.65;
    this.sprites = createStingraySprites();
  }

  update(dt: number, input: InputHandler): void {
    // Apply acceleration
    if (input.left) this.vx -= PLAYER_ACCELERATION * dt;
    if (input.right) this.vx += PLAYER_ACCELERATION * dt;
    if (input.up) this.vy -= PLAYER_ACCELERATION * dt;
    if (input.down) this.vy += PLAYER_ACCELERATION * dt;

    // Damping
    const dampFactor = Math.pow(PLAYER_DAMPING, dt * 10);
    this.vx *= dampFactor;
    this.vy *= dampFactor;

    // Clamp speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > PLAYER_MAX_SPEED) {
      this.vx = (this.vx / speed) * PLAYER_MAX_SPEED;
      this.vy = (this.vy / speed) * PLAYER_MAX_SPEED;
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp to canvas
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(CANVAS_HEIGHT - this.height / 2, this.y));

    // Animation
    this.animTimer += dt;
    if (this.animTimer >= 0.15) {
      this.animTimer -= 0.15;
      this.animFrame = (this.animFrame + 1) % this.sprites.length;
    }

    // Invincibility
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }

    // Shield timer
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
        this.shieldTimer = 0;
      }
    }
  }

  takeDamage(): boolean {
    if (this.invincibleTimer > 0) return false;
    if (this.shieldActive) {
      // Shield absorbs the hit without consuming it immediately
      return false;
    }
    this.hp -= 1;
    this.invincibleTimer = INVINCIBILITY_DURATION;
    return true;
  }

  activateShield(): void {
    this.shieldActive = true;
    this.shieldTimer = SHIELD_DURATION;
  }

  healHp(): void {
    this.hp = Math.min(this.hp + 1, PLAYER_MAX_HP);
  }

  isInvincible(): boolean {
    return this.invincibleTimer > 0;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width * 0.7,
      height: this.height * 0.7,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.invincibleTimer > 0 && Math.sin(this.invincibleTimer * 20) > 0) {
      return;
    }
    const sprite = this.sprites[this.animFrame];
    ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
