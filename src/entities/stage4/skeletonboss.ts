import { Entity } from '../../types';
import { CANVAS_WIDTH, SKELETON_BOSS_MAX_HP, BOSS_LASER_HIT_INTERVAL, BOSS_RAGE_DURATION } from '../../constants';
import { BossEnemy, ProjectileEntity } from '../entityRoles';

const SKEL_WIDTH = 160;
const SKEL_HEIGHT = 200;
const SKEL_TARGET_Y = 210;
const SKEL_CHASE_SPEED = 70;
const SKEL_ARM_SWING_SPEED = 2.0;
const SKEL_ARM_SWING_SPEED_RAGE = 7.0;

// ── Cannonball projectile ────────────────────────────────────────────────────

export class PirateCannonball extends ProjectileEntity {
  x: number;
  y: number;
  width: number = 20;
  height: number = 20;
  active: boolean = true;

  private vx: number;
  private vy: number;
  private spinAngle: number = 0;
  private trailPositions: { x: number; y: number }[] = [];

  constructor(x: number, y: number, targetX: number, targetY: number) {
    super();
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 280 + Math.random() * 80;
    this.vx = (dx / dist) * speed + (Math.random() - 0.5) * 100;
    this.vy = (dy / dist) * speed + (Math.random() - 0.5) * 60;
    this.spinAngle = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > 8) this.trailPositions.shift();

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.y += scrollSpeed * dt * 0.25;
    this.spinAngle += 5 * dt;

    if (this.x < -60 || this.x > CANVAS_WIDTH + 60 || this.y < -100 || this.y > 900) {
      this.active = false;
    }
  }

  getBounds() {
    return { x: this.x - 10, y: this.y - 10, width: 20, height: 20 };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Smoke trail
    for (let i = 0; i < this.trailPositions.length; i++) {
      const t = i / this.trailPositions.length;
      const tp = this.trailPositions[i];
      ctx.save();
      ctx.globalAlpha = t * 0.25;
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, (1 - t) * 7 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spinAngle);

    // Iron cannonball
    const grd = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
    grd.addColorStop(0, '#888888');
    grd.addColorStop(0.6, '#444444');
    grd.addColorStop(1, '#222222');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(-3, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ── Skeleton Boss drawing helpers ────────────────────────────────────────────

function drawSkullAndJaw(
  ctx: CanvasRenderingContext2D,
  jawOpen: number,   // 0 = closed, 1 = fully open
  rage: boolean,
): void {
  const boneColor = rage ? '#ffffff' : '#e8e0c8';
  const shadowColor = rage ? '#ff4444' : 'rgba(100,80,60,0.6)';
  const eyeGlow = rage ? '#ff0000' : '#00ffcc';

  // ── Skull cap ──────────────────────────────────────────────────────────────
  ctx.fillStyle = boneColor;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = rage ? 12 : 4;
  // Large dome skull
  ctx.beginPath();
  ctx.ellipse(0, -14, 44, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skull surface markings
  ctx.strokeStyle = rage ? '#cc8888' : '#b8b098';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -14, 32, Math.PI * 0.9, Math.PI * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -22, 22, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // ── Jaw (separate sprite) – drops down by jawOpen*20 ─────────────────────
  const jawY = 16 + jawOpen * 24;
  ctx.fillStyle = rage ? '#eeeeee' : '#d8d0b0';
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = rage ? 8 : 3;
  ctx.beginPath();
  // Jaw bone – wide U shape
  ctx.moveTo(-32, jawY - 8);
  ctx.bezierCurveTo(-38, jawY + 14, -30, jawY + 22, 0, jawY + 22);
  ctx.bezierCurveTo(30, jawY + 22, 38, jawY + 14, 32, jawY - 8);
  ctx.lineTo(32, jawY - 8);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Teeth on upper skull (bottom edge)
  ctx.fillStyle = boneColor;
  for (let t = -3; t <= 3; t++) {
    const tx = t * 11;
    ctx.beginPath();
    ctx.moveTo(tx - 5, 12);
    ctx.lineTo(tx - 3, jawY - 6);
    ctx.lineTo(tx + 3, jawY - 6);
    ctx.lineTo(tx + 5, 12);
    ctx.closePath();
    ctx.fill();
  }

  // Teeth on jaw (upper edge)
  ctx.fillStyle = rage ? '#ffdddd' : '#e8e0c8';
  for (let t = -3; t <= 3; t++) {
    const tx = t * 11;
    ctx.beginPath();
    ctx.moveTo(tx - 4, jawY - 4);
    ctx.lineTo(tx - 2, jawY - 16);
    ctx.lineTo(tx + 2, jawY - 16);
    ctx.lineTo(tx + 4, jawY - 4);
    ctx.closePath();
    ctx.fill();
  }

  // ── Eye sockets ───────────────────────────────────────────────────────────
  ctx.fillStyle = '#111100';
  ctx.beginPath(); ctx.ellipse(-16, -18, 12, 14, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -18, 12, 14, 0.15, 0, Math.PI * 2); ctx.fill();

  // Glowing eyes
  ctx.shadowColor = eyeGlow;
  ctx.shadowBlur = 18;
  ctx.fillStyle = eyeGlow;
  ctx.beginPath(); ctx.arc(-16, -18, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(16, -18, 6, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Eye pupil/iris
  ctx.fillStyle = rage ? '#ff8888' : '#88ffee';
  ctx.beginPath(); ctx.arc(-16, -18, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(16, -18, 3, 0, Math.PI * 2); ctx.fill();

  // Nose cavity (inverted triangle)
  ctx.fillStyle = '#2a2020';
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(-5, 4);
  ctx.lineTo(5, 4);
  ctx.closePath();
  ctx.fill();
}

function drawRibcage(ctx: CanvasRenderingContext2D, rage: boolean): void {
  const boneColor = rage ? '#ffffff' : '#ddd8c0';

  // Sternum
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 72);
  ctx.stroke();

  // Spine continuation
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 72);
  ctx.lineTo(0, 100);
  ctx.stroke();

  // Ribs (5 pairs)
  const ribData = [8, 20, 32, 44, 56];
  for (const ry of ribData) {
    const rw = 42 - ry * 0.3;
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 2;
    // Left rib
    ctx.beginPath();
    ctx.moveTo(-2, ry);
    ctx.bezierCurveTo(-rw * 0.5, ry - 6, -rw, ry + 4, -rw * 0.85, ry + 14);
    ctx.stroke();
    // Right rib
    ctx.beginPath();
    ctx.moveTo(2, ry);
    ctx.bezierCurveTo(rw * 0.5, ry - 6, rw, ry + 4, rw * 0.85, ry + 14);
    ctx.stroke();
  }

  // Pelvis
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 96, 28, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  side: number,       // -1 = left, 1 = right
  swingAngle: number,
  rage: boolean,
): void {
  const boneColor = rage ? '#ffffff' : '#ddd8c0';
  const shoulderX = side * 46;
  const shoulderY = 8;

  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(swingAngle);

  ctx.strokeStyle = boneColor;
  ctx.lineCap = 'round';

  // Shoulder socket
  ctx.fillStyle = boneColor;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Upper arm (humerus)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 42);
  ctx.stroke();

  // Elbow knob
  ctx.fillStyle = boneColor;
  ctx.beginPath();
  ctx.arc(0, 42, 5, 0, Math.PI * 2);
  ctx.fill();

  // Forearm (radius/ulna, slight angle outward)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.lineTo(side * 8, 74);
  ctx.stroke();

  // Wrist
  ctx.fillStyle = boneColor;
  ctx.beginPath();
  ctx.arc(side * 8, 74, 4, 0, Math.PI * 2);
  ctx.fill();

  // Finger claws (4 bony fingers)
  ctx.lineWidth = 2;
  for (let f = 0; f < 4; f++) {
    const fx = side * 8 + (f - 1.5) * 6;
    const fy = 74;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + side * 3, fy + 16);
    ctx.stroke();
    // Claw tip
    ctx.fillStyle = boneColor;
    ctx.beginPath();
    ctx.arc(fx + side * 3, fy + 16, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── GiantSkeletonBoss class ──────────────────────────────────────────────────

type SkelState = 'idle' | 'swinging' | 'retreating';

export class GiantSkeletonBoss extends BossEnemy {
  x: number;
  y: number;
  width: number = SKEL_WIDTH;
  height: number = SKEL_HEIGHT;
  hp: number = SKELETON_BOSS_MAX_HP;
  maxHp: number = SKELETON_BOSS_MAX_HP;
  defeated: boolean = false;
  targetX: number;
  targetY: number;
  isRaging: boolean = false;
  pendingProjectiles: Entity[] = [];
  laserHitCooldown: number = 0;

  private _pendingProjectiles: Entity[] = [];
  private floatTime: number = 0;
  private hitFlash: number = 0;
  private armAngle: number = 0;
  private armSwingDir: number = 1;
  private jawOpen: number = 0;
  private jawOpenTarget: number = 0;
  private jawTimer: number = 0;

  private attackState: SkelState = 'idle';
  private attackTimer: number = 0;
  private idleWait: number = 1.5;
  private swingTimer: number = 0;

  private rageTimer: number = 0;
  private rageShootTimer: number = 0;
  private rageThresholds: number[];
  private nextRageIdx: number = 0;
  private cannonCount: number = 0;  // cannons fired in current rage phase

  constructor(x: number, startY: number) {
    super();
    this.x = x;
    this.y = startY;
    this.targetX = x;
    this.targetY = SKEL_TARGET_Y;
    this.rageThresholds = [
      Math.floor(SKELETON_BOSS_MAX_HP * 0.75),
      Math.floor(SKELETON_BOSS_MAX_HP * 0.50),
      Math.floor(SKELETON_BOSS_MAX_HP * 0.25),
    ];
  }

  get pendingProjectilesList(): Entity[] { return this._pendingProjectiles; }

  update(dt: number, _scrollSpeed: number): void {
    if (this.defeated) return;
    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.floatTime += dt;

    // Jaw animation
    this.jawTimer += dt;
    if (this.jawTimer > 1.4) {
      this.jawTimer = 0;
      this.jawOpenTarget = this.jawOpenTarget > 0.5 ? 0 : 0.8;
    }
    this.jawOpen += (this.jawOpenTarget - this.jawOpen) * 6 * dt;

    // Slide in from top
    if (this.y < SKEL_TARGET_Y) {
      this.y = Math.min(SKEL_TARGET_Y, this.y + 100 * dt);
      return;
    }

    if (this.isRaging) {
      this.updateRage(dt);
    } else {
      this.updateNormal(dt);
    }

    // Propagate projectiles
    this.pendingProjectiles = this._pendingProjectiles;
    this._pendingProjectiles = [];
  }

  private updateRage(dt: number): void {
    const margin = this.width * 0.42;
    // Frantic wobble
    const floatTarget = SKEL_TARGET_Y + Math.sin(this.floatTime * 1.5) * 28;
    this.y += (floatTarget - this.y) * 2.5 * dt;
    const dx = this.targetX - this.x;
    const step = SKEL_CHASE_SPEED * 1.8 * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

    // Arms spin fast during rage
    this.armAngle += SKEL_ARM_SWING_SPEED_RAGE * dt;

    // Fire pirate cannonballs during rage
    this.rageTimer += dt;
    this.rageShootTimer += dt;
    const CANNON_INTERVAL = 0.3;
    if (this.rageShootTimer >= CANNON_INTERVAL) {
      this.rageShootTimer = 0;
      this.cannonCount++;
      // Spawn from sides (simulating pirate cannons off-screen)
      const side = this.cannonCount % 2 === 0 ? -20 : CANVAS_WIDTH + 20;
      const cannonY = 80 + Math.random() * 500;
      this._pendingProjectiles.push(new PirateCannonball(
        side, cannonY,
        this.targetX + (Math.random() - 0.5) * 120,
        this.targetY + (Math.random() - 0.5) * 80,
      ));
    }

    if (this.rageTimer >= BOSS_RAGE_DURATION) {
      this.isRaging = false;
      this.rageTimer = 0;
      this.rageShootTimer = 0;
      this.cannonCount = 0;
      this.nextRageIdx++;
      this.attackState = 'idle';
      this.attackTimer = 0;
      this.idleWait = 1.2;
    }
  }

  private updateNormal(dt: number): void {
    const margin = this.width * 0.42;
    // Float gently
    const floatTarget = SKEL_TARGET_Y + Math.sin(this.floatTime * 0.7) * 14;
    this.y += (floatTarget - this.y) * 1.2 * dt;
    const dx = this.targetX - this.x;
    const step = SKEL_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

    // Arm swing attack
    this.attackTimer += dt;
    if (this.attackState === 'idle' && this.attackTimer >= this.idleWait) {
      this.attackTimer = 0;
      this.attackState = 'swinging';
      this.swingTimer = 0;
    }

    if (this.attackState === 'swinging') {
      this.swingTimer += dt;
      // Full swing rotation
      this.armAngle += SKEL_ARM_SWING_SPEED * this.armSwingDir * dt;
      if (this.swingTimer >= 1.8) {
        this.attackState = 'idle';
        this.idleWait = 1.0 + Math.random() * 0.8;
        this.armSwingDir *= -1;
      }
    } else {
      // Slow idle arm sway
      this.armAngle += 0.4 * Math.sin(this.floatTime) * dt;
    }
  }

  takeLaserHit(): boolean {
    if (this.isRaging || this.laserHitCooldown > 0) return false;
    this.laserHitCooldown = BOSS_LASER_HIT_INTERVAL;
    this.hitFlash = 0.12;
    this.hp -= 1;
    this.checkRage();
    return this.hp <= 0;
  }

  takePearlHit(): boolean {
    if (this.isRaging) return false;
    this.hitFlash = 0.12;
    this.hp -= 1;
    this.checkRage();
    return this.hp <= 0;
  }

  private checkRage(): void {
    if (
      this.nextRageIdx < this.rageThresholds.length &&
      this.hp <= this.rageThresholds[this.nextRageIdx]
    ) {
      this.isRaging = true;
      this.rageTimer = 0;
      this.rageShootTimer = 0;
      this.cannonCount = 0;
      // Jaw snaps wide open during rage
      this.jawOpenTarget = 1;
    }
    if (this.hp <= 0) {
      this.defeated = true;
    }
  }

  getBounds() {
    // Bounding box around the skull + ribcage area
    return {
      x: this.x - this.width * 0.4,
      y: this.y - this.height * 0.35,
      width: this.width * 0.8,
      height: this.height * 0.7,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.defeated) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    // ── Arms (drawn behind skull/ribcage) ─────────────────────────────────────
    ctx.save();
    ctx.translate(0, -this.height * 0.05);
    // Left arm
    drawArm(ctx, -1, -this.armAngle - 0.4, this.isRaging);
    // Right arm (offset phase)
    drawArm(ctx, 1, this.armAngle + 0.4, this.isRaging);
    ctx.restore();

    // ── Ribcage ───────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, 20);
    drawRibcage(ctx, this.isRaging);
    ctx.restore();

    // ── Skull + Jaw ───────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, -this.height * 0.22);
    drawSkullAndJaw(ctx, this.jawOpen, this.isRaging);
    ctx.restore();

    ctx.restore();

    // HP bar
    const hpBarW = 120;
    const hpBarH = 7;
    const hpBarX = this.x - hpBarW / 2;
    const hpBarY = this.y - this.height * 0.5 - 18;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(hpBarX - 1, hpBarY - 1, hpBarW + 2, hpBarH + 2);
    const hpFrac = Math.max(0, this.hp / this.maxHp);
    const hpColor = hpFrac > 0.5 ? '#44ff88' : hpFrac > 0.25 ? '#ffaa00' : '#ff2222';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpFrac, hpBarH);
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

    // Rage flash overlay
    if (this.isRaging) {
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.abs(Math.sin(this.floatTime * 4)) * 0.08;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x - this.width / 2 - 10, this.y - this.height / 2, this.width + 20, this.height);
      ctx.restore();
    }
  }
}
