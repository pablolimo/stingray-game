import { Entity } from '../../types';
import { CANVAS_WIDTH, SCUBA_KITTEN_MAX_HP, SCUBA_KITTEN_LASER_HIT_INTERVAL } from '../../constants';
import { Level3Enemy } from '../entityRoles';
import { MonkeyBoogerBall } from './monkeyboogerball';

const MONKEY_LIFETIME = 7.5;
const MONKEY_FADE_TIME = 0.8;
const MONKEY_CHASE_SPEED = 60;
const MONKEY_SHOOT_MIN = 1.4;
const MONKEY_SHOOT_MAX = 2.4;

function createSeaMonkeySprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 44;
  c.height = 50;
  const ctx = c.getContext('2d')!;

  // Bioluminescent glow aura
  const grd = ctx.createRadialGradient(22, 25, 5, 22, 25, 24);
  grd.addColorStop(0, 'rgba(50,220,100,0.2)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 44, 50);

  // Diving tank (on back)
  ctx.fillStyle = '#336644';
  ctx.beginPath();
  ctx.roundRect(18, 16, 7, 16, 3);
  ctx.fill();
  ctx.strokeStyle = '#44ff88';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 16, 7, 16);

  // Body
  ctx.fillStyle = '#4a3020';
  ctx.beginPath();
  ctx.ellipse(22, 28, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diving suit highlight
  ctx.fillStyle = '#2a5a40';
  ctx.beginPath();
  ctx.ellipse(22, 26, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#5a3a18';
  ctx.beginPath();
  ctx.ellipse(22, 12, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diving mask
  ctx.fillStyle = '#1a3344';
  ctx.beginPath();
  ctx.ellipse(22, 12, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask lens shine
  ctx.fillStyle = 'rgba(100,200,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(22, 12, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes through mask
  ctx.fillStyle = '#44ffaa';
  ctx.shadowColor = '#44ffaa';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(18, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ears/monkey ears
  ctx.fillStyle = '#5a3a18';
  ctx.beginPath();
  ctx.ellipse(13, 10, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(31, 10, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#4a3020';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  // Left arm (holding gun)
  ctx.beginPath();
  ctx.moveTo(12, 24);
  ctx.lineTo(6, 30);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(32, 24);
  ctx.lineTo(38, 30);
  ctx.stroke();

  // Booger gun (left hand)
  ctx.fillStyle = '#44aa66';
  ctx.beginPath();
  ctx.roundRect(2, 28, 8, 5, 2);
  ctx.fill();
  ctx.fillStyle = '#88ffaa';
  ctx.beginPath();
  ctx.arc(2, 30, 2, 0, Math.PI * 2);
  ctx.fill();

  // Bioluminescent accents on suit
  ctx.strokeStyle = '#22ff88';
  ctx.lineWidth = 1;
  ctx.shadowColor = '#22ff88';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(16, 20);
  ctx.lineTo(28, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, 30);
  ctx.lineTo(29, 30);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Legs / fins
  ctx.fillStyle = '#2a5a40';
  ctx.beginPath();
  ctx.ellipse(17, 44, 5, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(27, 44, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class SeaMonkey extends Level3Enemy {
  x: number;
  y: number;
  width: number = 88;
  height: number = 100;
  expired: boolean = false;
  targetX: number;
  targetY: number;
  hp: number = SCUBA_KITTEN_MAX_HP;
  laserHitCooldown: number = 0;

  private pendingBoogers: MonkeyBoogerBall[] = [];
  get pendingProjectiles(): Entity[] { return this.pendingBoogers; }
  set pendingProjectiles(v: Entity[]) { this.pendingBoogers = v as MonkeyBoogerBall[]; }

  private sprite: HTMLCanvasElement;
  private lifetime: number = 0;
  private shootTimer: number = 0;
  private shootInterval: number;
  private animTimer: number = 0;
  private animFrame: number = 0;
  private hitFlash: number = 0;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.sprite = createSeaMonkeySprite();
    this.shootInterval = MONKEY_SHOOT_MIN + Math.random() * (MONKEY_SHOOT_MAX - MONKEY_SHOOT_MIN);
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= MONKEY_LIFETIME) { this.expired = true; return; }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    const dx = this.targetX - this.x;
    const step = MONKEY_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    this.y += scrollSpeed * 0.22 * dt;
    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));

    this.animTimer += dt;
    if (this.animTimer >= 0.35) { this.animTimer -= 0.35; this.animFrame = (this.animFrame + 1) % 2; }

    this.shootTimer += dt;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shootInterval = MONKEY_SHOOT_MIN + Math.random() * (MONKEY_SHOOT_MAX - MONKEY_SHOOT_MIN);
      this.pendingBoogers.push(new MonkeyBoogerBall(
        this.x - this.width * 0.4,
        this.y + 5,
        this.targetX,
        this.targetY,
      ));
    }
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

    const timeLeft = MONKEY_LIFETIME - this.lifetime;
    if (timeLeft < MONKEY_FADE_TIME) ctx.globalAlpha = Math.max(0, timeLeft / MONKEY_FADE_TIME);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    if (this.hp < SCUBA_KITTEN_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < this.hp; i++) {
        const pipX = -((this.hp - 1) * 5) + i * 10;
        ctx.fillStyle = '#22ff88';
        ctx.beginPath();
        ctx.arc(pipX, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
