import { CANVAS_WIDTH, CANVAS_HEIGHT, SKELETON_FISH_MAX_HP, SKELETON_FISH_LASER_HIT_INTERVAL } from '../../constants';
import { MediumEnemy } from '../entityRoles';

const SKELETON_FISH_LIFETIME = 6.0;
const SKELETON_FISH_FADE_TIME = 0.6;
const SKELETON_FISH_CHASE_SPEED = 180;

function createSkeletonFishSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 52;
  c.height = 34;
  const ctx = c.getContext('2d')!;

  // Glow aura (pale blue-green for the glowing eyes)
  const aura = ctx.createRadialGradient(14, 14, 2, 14, 14, 24);
  aura.addColorStop(0, 'rgba(0,255,200,0.15)');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 52, 34);

  // Spine/backbone
  ctx.strokeStyle = '#ccccaa';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, 17);
  ctx.bezierCurveTo(20, 14, 36, 20, 46, 17);
  ctx.stroke();

  // Ribs (5 pairs – thin curved lines from spine)
  ctx.strokeStyle = '#bbbb99';
  ctx.lineWidth = 1;
  const ribPositions = [12, 18, 24, 30, 36];
  for (const rx of ribPositions) {
    // Upper rib
    ctx.beginPath();
    ctx.moveTo(rx, 17 - 1);
    ctx.quadraticCurveTo(rx - 2, 9, rx + 2, 5);
    ctx.stroke();
    // Lower rib
    ctx.beginPath();
    ctx.moveTo(rx, 17 + 1);
    ctx.quadraticCurveTo(rx - 2, 25, rx + 2, 29);
    ctx.stroke();
  }

  // Tail bone structure
  ctx.strokeStyle = '#ccccaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, 17);
  ctx.lineTo(50, 10);
  ctx.moveTo(44, 17);
  ctx.lineTo(50, 17);
  ctx.moveTo(44, 17);
  ctx.lineTo(50, 24);
  ctx.stroke();

  // Skull (head)
  ctx.fillStyle = '#d4d0b0';
  ctx.beginPath();
  ctx.ellipse(9, 17, 9, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#aaa880';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Jaw (separate lower jaw, slightly open)
  ctx.fillStyle = '#c8c4a0';
  ctx.beginPath();
  ctx.ellipse(9, 22, 7, 5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Teeth on jaw
  ctx.fillStyle = '#eeeedd';
  const teethX = [4, 7, 10, 13];
  for (const tx of teethX) {
    ctx.beginPath();
    ctx.moveTo(tx, 18);
    ctx.lineTo(tx - 1, 22);
    ctx.lineTo(tx + 1, 22);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing eyes (the signature feature)
  // Eye socket
  ctx.fillStyle = '#111100';
  ctx.beginPath(); ctx.ellipse(6, 14, 4, 4.5, -0.2, 0, Math.PI * 2); ctx.fill();

  // Glowing eye glow
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#00ffcc';
  ctx.beginPath(); ctx.arc(6, 14, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Eye inner bright core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(5.5, 13.5, 1, 0, Math.PI * 2); ctx.fill();

  // Dorsal fin (skeletal)
  ctx.strokeStyle = '#ccccaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(20, 2);
  ctx.lineTo(26, 8);
  ctx.stroke();
  // Fin membrane
  ctx.fillStyle = 'rgba(180,180,140,0.2)';
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(20, 2);
  ctx.lineTo(26, 8);
  ctx.closePath();
  ctx.fill();

  return c;
}

export class SkeletonFish extends MediumEnemy {
  x: number;
  y: number;
  width: number = 52;
  height: number = 34;
  expired: boolean = false;
  targetX: number;
  hp: number = SKELETON_FISH_MAX_HP;
  laserHitCooldown: number = 0;

  private sprite: HTMLCanvasElement;
  private lifetime: number = 0;
  private hitFlash: number = 0;
  private glowTimer: number = 0;
  private swimAngle: number;
  private erraticTimer: number = 0;
  private erraticVx: number = 0;

  constructor(x: number, y: number, targetX: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprite = createSkeletonFishSprite();
    this.swimAngle = Math.random() * Math.PI * 2;
    this.erraticTimer = Math.random() * 0.4;
  }

  update(dt: number, scrollSpeed: number): void {
    this.lifetime += dt;
    if (this.lifetime >= SKELETON_FISH_LIFETIME) { this.expired = true; return; }

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.glowTimer += dt * 4;

    // Erratic lateral darts
    this.erraticTimer -= dt;
    if (this.erraticTimer <= 0) {
      this.erraticTimer = 0.2 + Math.random() * 0.35;
      this.erraticVx = (Math.random() - 0.5) * 2 * 380;
    }
    this.x += this.erraticVx * dt;
    this.erraticVx *= (1 - 6 * dt);

    // Chase player horizontally
    const dx = this.targetX - this.x;
    const step = SKELETON_FISH_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;

    // Swim with undulation
    this.swimAngle += dt * 3;
    this.y += scrollSpeed * 0.5 * dt + Math.sin(this.swimAngle) * 20 * dt;

    this.x = Math.max(this.width / 2, Math.min(CANVAS_WIDTH - this.width / 2, this.x));
    this.y = Math.max(-this.height, Math.min(CANVAS_HEIGHT + this.height, this.y));
  }

  takeLaserHit(): boolean {
    if (this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = SKELETON_FISH_LASER_HIT_INTERVAL;
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
      x: this.x - this.width * 0.38,
      y: this.y - this.height * 0.38,
      width: this.width * 0.76,
      height: this.height * 0.76,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    const timeLeft = SKELETON_FISH_LIFETIME - this.lifetime;
    if (timeLeft < SKELETON_FISH_FADE_TIME) ctx.globalAlpha = Math.max(0, timeLeft / SKELETON_FISH_FADE_TIME);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    // Eye glow pulse
    const glowScale = 1 + Math.abs(Math.sin(this.glowTimer)) * 0.3;
    ctx.save();
    ctx.globalAlpha = (ctx.globalAlpha * 0.6) * glowScale;
    const grd = ctx.createRadialGradient(-this.width * 0.27 + this.x, -this.height * 0.18 + this.y, 1,
      -this.width * 0.27 + this.x, -this.height * 0.18 + this.y, 18);
    grd.addColorStop(0, 'rgba(0,255,200,0.7)');
    grd.addColorStop(1, 'transparent');
    ctx.restore();

    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);

    if (this.hp < SKELETON_FISH_MAX_HP && this.hp > 0) {
      ctx.filter = 'none';
      ctx.globalAlpha = 0.9;
      const dotCount = Math.min(this.hp, 6);
      for (let i = 0; i < dotCount; i++) {
        const px = -((dotCount - 1) * 5) + i * 10;
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, -this.height / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }
}
