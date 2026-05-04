import { CANVAS_WIDTH, SQUID_MAX_HP, SQUID_LASER_HIT_INTERVAL } from '../../constants';
import { MediumEnemy } from '../entityRoles';

// Black squid – faster spin and chase than the regular Squid
const BLACK_SQUID_LIFETIME = 4.5;
const BLACK_SQUID_FADE_TIME = 0.5;
const BLACK_SQUID_SPIN_SPEED = 6.0; // faster than normal (3.5)
const BLACK_SQUID_CHASE_SPEED = 220; // faster than normal (140)

function createBlackSquidSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 52;
  const ctx = c.getContext('2d')!;

  // Glow aura (dark purple-red)
  const aura = ctx.createRadialGradient(24, 26, 5, 24, 26, 26);
  aura.addColorStop(0, 'rgba(120,0,0,0.35)');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 48, 52);

  // Mantle body – jet black
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.ellipse(24, 18, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red-tinged highlight
  ctx.fillStyle = 'rgba(180,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(20, 14, 7, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Tentacles (8, black)
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const startX = 24 + Math.cos(angle) * 10;
    const startY = 32 + Math.sin(angle * 0.5) * 6;
    const endX = 24 + Math.cos(angle) * 24;
    const endY = 32 + Math.sin(angle * 0.5) * 6 + 14;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + (Math.random() - 0.5) * 8,
      (startY + endY) / 2,
      endX, endY,
    );
    ctx.stroke();
  }

  // Glowing red eyes
  ctx.fillStyle = '#cc0000';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.arc(19, 15, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(29, 15, 3, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  return c;
}

export class BlackSquid extends MediumEnemy {
  x: number;
  y: number;
  width: number = 48;
  height: number = 52;
  expired: boolean = false;
  targetX: number;
  hp: number = SQUID_MAX_HP;

  private sprite: HTMLCanvasElement;
  private spinAngle: number = 0;
  private lifetime: number = 0;
  laserHitCooldown: number = 0;
  private hitFlash: number = 0;

  constructor(x: number, y: number, targetX: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprite = createBlackSquidSprite();
    this.spinAngle = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= BLACK_SQUID_LIFETIME) { this.expired = true; return; }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this.spinAngle += BLACK_SQUID_SPIN_SPEED * dt;

    const dx = this.targetX - this.x;
    const step = BLACK_SQUID_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;

    this.y += scrollSpeed * 0.55 * dt;
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
  }

  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = SQUID_LASER_HIT_INTERVAL;
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
  }

  takePearlHit(): boolean {
    this.hitFlash = 0.1;
    this.hp -= 1;
    return this.hp <= 0;
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
    ctx.rotate(this.spinAngle);

    const timeLeft = BLACK_SQUID_LIFETIME - this.lifetime;
    if (timeLeft < BLACK_SQUID_FADE_TIME) ctx.globalAlpha = Math.max(0, timeLeft / BLACK_SQUID_FADE_TIME);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    if (this.hp < SQUID_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < this.hp; i++) {
        const px = -((this.hp - 1) * 5) + i * 10;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(px, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
