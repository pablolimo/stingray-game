import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_MAX_SPEED, PLAYER_ACCELERATION, PLAYER_DAMPING, INVINCIBILITY_DURATION, PLAYER_MAX_HP, SHIELD_DURATION, GREEN_GLOW_DURATION } from './constants';
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
  private glowTimer: number = 0;
  width: number = 96;
  height: number = 96;
  // Stage 3 states
  greenGlowTimer: number = 0;  // radioactive barrel effect
  hookedTimer: number = 0;     // frog tongue hook
  hookVx: number = 0;
  hookVy: number = 0;

  private sprites: HTMLCanvasElement[];

  constructor() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT * 0.65;
    this.sprites = createStingraySprites();
  }

  update(dt: number, input: InputHandler): void {
    // Green glow timer
    if (this.greenGlowTimer > 0) this.greenGlowTimer -= dt;

    // Hooked state – override movement
    if (this.hookedTimer > 0) {
      this.hookedTimer -= dt;
      this.vx = this.hookVx;
      this.vy = this.hookVy;
    } else {
      // Apply acceleration
      if (input.left) this.vx -= PLAYER_ACCELERATION * dt;
      if (input.right) this.vx += PLAYER_ACCELERATION * dt;
      if (input.up) this.vy -= PLAYER_ACCELERATION * dt;
      if (input.down) this.vy += PLAYER_ACCELERATION * dt;
    }

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
    this.glowTimer += dt;

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

  takeDamage(amount: number = 1): boolean {
    if (this.invincibleTimer > 0) return false;
    if (this.shieldActive) {
      // Shield absorbs the hit without consuming it immediately
      return false;
    }
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = INVINCIBILITY_DURATION;
    return true;
  }

  activateShield(): void {
    this.shieldActive = true;
    this.shieldTimer = SHIELD_DURATION;
  }

  activateGreenGlow(): void {
    this.greenGlowTimer = GREEN_GLOW_DURATION;
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

  render(ctx: CanvasRenderingContext2D, nuclearActive: boolean = false): void {
    if (this.invincibleTimer > 0 && Math.sin(this.invincibleTimer * 20) > 0) {
      return;
    }

    // Natural bioluminescent glow aura
    ctx.save();
    const glowAlpha = 0.10 + Math.abs(Math.sin(this.glowTimer * 1.4)) * 0.07;
    ctx.globalAlpha = glowAlpha;
    const grd = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, this.width * 0.65);
    grd.addColorStop(0, 'rgba(160, 210, 255, 0.9)');
    grd.addColorStop(1, 'rgba(80, 150, 220, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (nuclearActive) {
      // Draw player 2× size with red tint
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(2, 2);
      ctx.translate(-this.x, -this.y);
      const sprite = this.sprites[this.animFrame];
      // Red tint overlay
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.restore();
    } else {
      const sprite = this.sprites[this.animFrame];
      ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
  }
}
