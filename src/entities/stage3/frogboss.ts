import { Entity } from '../../types';
import { CANVAS_WIDTH, FROG_BOSS_MAX_HP, BOSS_LASER_HIT_INTERVAL, BOSS_RAGE_DURATION } from '../../constants';
import { BossEnemy } from '../entityRoles';
import { Tadpole } from './tadpole';
import { FrogTongue } from './frogtongue';
import { ToxicCloud } from './toxiccloud';

const FROG_WIDTH = 168;
const FROG_HEIGHT = 180;
const FROG_TARGET_Y = 200;
const FROG_CHASE_SPEED = 80;
const FROG_JUMP_SPEED = 400;
const FROG_JUMP_DURATION = 0.5;
const FROG_RETREAT_SPEED = 350;

type FrogState = 'idle' | 'jumping' | 'retreating' | 'shooting' | 'tongue';

function drawFrogBody(ctx: CanvasRenderingContext2D, rage: boolean): void {
  const baseColor = rage ? '#88cc00' : '#5a9a00';
  const skinColor = rage ? '#aaee22' : '#7acc22';
  const bellColor = rage ? '#ddffa0' : '#c8f580';
  const darkColor = rage ? '#4a7a00' : '#2a5800';

  // ── V-shaped muscular torso ──────────────────────────────────────────────────
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.fillStyle = baseColor;
  // Wide at chest (y≈36), narrows toward hip (y≈76) – crisp V silhouette
  ctx.beginPath();
  ctx.moveTo(9, 36);
  ctx.bezierCurveTo(3, 52, 17, 68, 20, 76);
  ctx.lineTo(68, 76);
  ctx.bezierCurveTo(71, 68, 85, 52, 79, 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pectoral muscles
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.ellipse(30, 47, 15, 11, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(58, 47, 15, 11,  0.15, 0, Math.PI * 2); ctx.fill();

  // Centre chest / sternum line
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(44, 37); ctx.lineTo(44, 64); ctx.stroke();

  // Abs (two columns, three rows – tapering with body)
  ctx.fillStyle = darkColor;
  ctx.globalAlpha = 0.28;
  for (let row = 0; row < 3; row++) {
    const ay = 55 + row * 7;
    const ar = 4.5 - row * 0.5;
    ctx.beginPath(); ctx.ellipse(37, ay, ar, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(51, ay, ar, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Belly highlight
  ctx.fillStyle = bellColor;
  ctx.beginPath(); ctx.ellipse(44, 60, 15, 19, 0, 0, Math.PI * 2); ctx.fill();

  // Belly inner shine
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.ellipse(40, 52, 9, 10, -0.2, 0, Math.PI * 2); ctx.fill();

  // Texture bumps on the back
  ctx.fillStyle = skinColor;
  const bumps: [number, number, number][] = [[28, 44, 3.5], [60, 40, 3], [20, 56, 2.5], [67, 58, 3], [44, 38, 2.5]];
  for (const [bx, by, br] of bumps) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
  }

  // Hip joint sockets (where animated legs attach)
  ctx.fillStyle = darkColor;
  ctx.beginPath(); ctx.arc(16, 73, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath(); ctx.arc(16, 73, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = darkColor;
  ctx.beginPath(); ctx.arc(72, 73, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath(); ctx.arc(72, 73, 4.5, 0, Math.PI * 2); ctx.fill();

  // Shoulder sockets (arm pivots – non-rage keeps them baked in)
  if (!rage) {
    ctx.fillStyle = darkColor;
    ctx.beginPath(); ctx.arc(10, 56, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = baseColor;
    ctx.beginPath(); ctx.arc(10, 56, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = darkColor;
    ctx.beginPath(); ctx.arc(78, 56, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = baseColor;
    ctx.beginPath(); ctx.arc(78, 56, 5, 0, Math.PI * 2); ctx.fill();
  }

  // ── Head ────────────────────────────────────────────────────────────────────
  // Trapezoid-ish muscular neck / traps bridge
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(22, 36);
  ctx.lineTo(66, 36);
  ctx.bezierCurveTo(66, 28, 56, 22, 44, 22);
  ctx.bezierCurveTo(32, 22, 22, 28, 22, 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(44, 22, 34, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head texture
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(32, 18, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(56, 16, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(44, 12, 2, 0, Math.PI * 2); ctx.fill();

  // 8 eyes
  const eyeData: [number, number, number, string][] = [
    [30, 10, 7, '#dddd00'],
    [58, 10, 7, '#dddd00'],
    [18, 22, 4.5, '#ffcc00'],
    [70, 22, 4.5, '#ffcc00'],
    [24, 33, 3.5, '#ff8800'],
    [64, 33, 3.5, '#ff8800'],
    [36, 6, 2.5, '#ffee44'],
    [52, 6, 2.5, '#ffee44'],
  ];

  const eyeGlow = rage ? 12 : 6;
  for (const [ex, ey, er, ecolor] of eyeData) {
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex, ey, er + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ecolor;
    ctx.shadowColor = ecolor;
    ctx.shadowBlur = eyeGlow;
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(ex, ey, er * 0.25, er * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Wide evil mouth
  ctx.strokeStyle = '#1a1a00';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (rage) {
    ctx.arc(44, 35, 18, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#eeeedd';
    for (let i = 0; i < 6; i++) {
      const ta = (0.1 + i * 0.15) * Math.PI;
      const tx = 44 + Math.cos(ta) * 16;
      const ty = 35 + Math.sin(ta) * 16;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 3, ty + 5);
      ctx.lineTo(tx + 3, ty + 5);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.arc(44, 35, 13, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

/** Draws one animated muscular frog leg in world-space coordinates.
 *  @param hipX/hipY  – hip joint position (relative to the already-translated frog centre)
 *  @param phase      – animation phase in [0, 2π]; legs from opposite sides are offset by π
 *  @param sideSign   – −1 for left leg, +1 for right leg
 *  @param rage       – use rage colour palette
 */
function drawFrogLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number, hipY: number,
  phase: number,
  sideSign: number,
  rage: boolean,
): void {
  const baseColor = rage ? '#88cc00' : '#5a9a00';
  const skinColor = rage ? '#aaee22' : '#7acc22';
  const darkColor = rage ? '#4a7a00' : '#2a5800';

  // kick progress: 0 = fully folded (foot tucked near body), 1 = fully extended (kick)
  const t = (Math.sin(phase) + 1) * 0.5;

  // Knee position – moves from up-and-in (folded) to out-and-down (extended)
  const kneeX = hipX + sideSign * 62;
  const kneeY = hipY + (-18 + t * 60);

  // Foot direction from knee: folded→points back toward body; extended→pushes far down-out
  const fdx = sideSign * (0.25 + t * 0.45);
  const fdy = -0.55 + t * 1.3;
  const fdMag = Math.sqrt(fdx * fdx + fdy * fdy);
  const shinLen = 72;
  const footX = kneeX + (fdx / fdMag) * shinLen;
  const footY = kneeY + (fdy / fdMag) * shinLen;

  ctx.save();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;

  // ── Thigh (upper leg) – very thick rotated ellipse ──────────────────────────
  {
    const mx = (hipX + kneeX) * 0.5;
    const my = (hipY + kneeY) * 0.5;
    const angle = Math.atan2(kneeY - hipY, kneeX - hipX);
    const half = Math.hypot(kneeX - hipX, kneeY - hipY) * 0.5;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(angle);
    ctx.fillStyle = baseColor;
    ctx.beginPath(); ctx.ellipse(0, 0, half, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-half * 0.15, -9, half * 0.4, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Shin (lower leg) ─────────────────────────────────────────────────────────
  {
    const mx = (kneeX + footX) * 0.5;
    const my = (kneeY + footY) * 0.5;
    const angle = Math.atan2(footY - kneeY, footX - kneeX);
    const half = Math.hypot(footX - kneeX, footY - kneeY) * 0.5;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(angle);
    ctx.fillStyle = baseColor;
    ctx.beginPath(); ctx.ellipse(0, 0, half, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-half * 0.1, -6, half * 0.3, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Knee joint ───────────────────────────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.beginPath(); ctx.arc(kneeX, kneeY, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath(); ctx.arc(kneeX, kneeY, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinColor;
  ctx.beginPath(); ctx.arc(kneeX - sideSign * 3, kneeY - 3, 5, 0, Math.PI * 2); ctx.fill();

  // ── Hip joint ────────────────────────────────────────────────────────────────
  ctx.fillStyle = darkColor;
  ctx.beginPath(); ctx.arc(hipX, hipY, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = baseColor;
  ctx.beginPath(); ctx.arc(hipX, hipY, 7, 0, Math.PI * 2); ctx.fill();

  // ── Webbed foot ──────────────────────────────────────────────────────────────
  {
    const footAngle = Math.atan2(footY - kneeY, footX - kneeX);
    ctx.save();
    ctx.translate(footX, footY);
    ctx.rotate(footAngle);
    // Webbing fill
    const toeData = [
      { a: -0.55, len: 24 },
      { a: -0.18, len: 30 },
      { a:  0.18, len: 30 },
      { a:  0.55, len: 24 },
    ];
    ctx.fillStyle = rage ? 'rgba(60,140,0,0.72)' : 'rgba(40,100,0,0.65)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (const toe of toeData) {
      ctx.lineTo(Math.cos(toe.a) * toe.len, Math.sin(toe.a) * toe.len);
    }
    ctx.closePath();
    ctx.fill();
    // Toes
    for (const toe of toeData) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(toe.a) * toe.len, Math.sin(toe.a) * toe.len);
      ctx.stroke();
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.arc(Math.cos(toe.a) * toe.len, Math.sin(toe.a) * toe.len, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function createFrogNormalSprites(): HTMLCanvasElement[] {
  // Two frames with a subtle belly-breathe: frame 0 = rest, frame 1 = slight inhale
  return [0, 1].map(frame => {
    const c = document.createElement('canvas');
    c.width = 88;
    c.height = 90;
    const ctx = c.getContext('2d')!;
    drawFrogBody(ctx, false);
    if (frame === 1) {
      // Subtle inhale: slightly brighter belly highlight
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.ellipse(44, 62, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
    }
    return c;
  });
}

function createFrogRageSprites(): HTMLCanvasElement[] {
  // 8 frames with a pulsing toxic glow intensity (body animation; arms are drawn
  // separately in render() so they don't need to be baked in here)
  const FRAMES = 8;
  return Array.from({ length: FRAMES }, (_, frame) => {
    const c = document.createElement('canvas');
    c.width = 88;
    c.height = 90;
    const ctx = c.getContext('2d')!;

    // Pulsing toxic aura – intensity varies per frame
    const pulse = Math.sin((frame / FRAMES) * Math.PI * 2) * 0.5 + 0.5;
    const aura = ctx.createRadialGradient(44, 45, 10, 44, 45, 46);
    aura.addColorStop(0, `rgba(150,255,0,${0.18 + pulse * 0.22})`);
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, 88, 90);

    drawFrogBody(ctx, true);

    // Additional per-frame brightness pulse on the belly
    ctx.fillStyle = `rgba(200,255,100,${0.04 + pulse * 0.08})`;
    ctx.beginPath(); ctx.ellipse(44, 62, 22, 26, 0, 0, Math.PI * 2); ctx.fill();

    return c;
  });
}

export class MutantFrogBoss extends BossEnemy {
  x: number;
  y: number;
  width: number = FROG_WIDTH;
  height: number = FROG_HEIGHT;
  hp: number;
  maxHp: number;
  defeated: boolean = false;
  targetX: number = CANVAS_WIDTH / 2;
  targetY: number = 500;
  isRaging: boolean = false;
  laserHitCooldown: number = 0;

  private _pendingProjectiles: Entity[] = [];
  get pendingProjectiles(): Entity[] { return this._pendingProjectiles; }
  set pendingProjectiles(v: Entity[]) { this._pendingProjectiles = v; }

  private normalSprites: HTMLCanvasElement[];
  private rageSprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private floatTime: number = 0;
  private hitFlash: number = 0;
  private rageTimer: number = 0;
  private rageShootTimer: number = 0;
  private spinAngle: number = 0;

  private attackState: FrogState = 'idle';
  private attackTimer: number = 0;
  private jumpTargetX: number = 0;
  private jumpTargetY: number = 0;
  private idleWait: number = 1.2;
  private sequenceStep: number = 0;
  private armAngle: number = 0;

  private rageThresholds: number[];
  private nextRageIdx: number = 0;
  private tadpoleToggle: boolean = false; // alternates between tadpoles and toxic cloud

  // ── Animated leg state ────────────────────────────────────────────────────────
  private legPhaseLeft: number = 0;
  private legPhaseRight: number = Math.PI; // opposite phase → alternating kicks

  constructor(x: number, startY: number) {
    super();
    this.x = x;
    this.y = startY;
    this.hp = FROG_BOSS_MAX_HP;
    this.maxHp = FROG_BOSS_MAX_HP;
    this.rageThresholds = [
      Math.floor(FROG_BOSS_MAX_HP * 0.75),
      Math.floor(FROG_BOSS_MAX_HP * 0.50),
      Math.floor(FROG_BOSS_MAX_HP * 0.25),
    ];
    this.normalSprites = createFrogNormalSprites();
    this.rageSprites = createFrogRageSprites();
  }

  update(dt: number, _scrollSpeed: number): void {
    if (this.defeated) return;
    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.floatTime += dt;
    // Arm rotation: always spinning (slower in normal mode, faster in rage)
    this.armAngle += (this.isRaging ? 5.0 : 1.4) * dt;
    // Leg kick animation: faster during rage
    const legSpeed = this.isRaging ? 4.5 : 2.8;
    this.legPhaseLeft  = (this.legPhaseLeft  + legSpeed * dt) % (Math.PI * 2);
    this.legPhaseRight = (this.legPhaseRight + legSpeed * dt) % (Math.PI * 2);

    // Slide in from top
    if (this.y < FROG_TARGET_Y) {
      this.y = Math.min(FROG_TARGET_Y, this.y + 120 * dt);
      return;
    }

    this.animTimer += dt;
    const frameInterval = this.isRaging ? 0.1 : 0.4;
    const frameCount = this.isRaging ? this.rageSprites.length : this.normalSprites.length;
    if (this.animTimer >= frameInterval) { this.animTimer -= frameInterval; this.animFrame = (this.animFrame + 1) % frameCount; }

    if (this.isRaging) {
      this.updateRage(dt);
    } else {
      this.updateNormal(dt);
    }
  }

  private updateRage(dt: number): void {
    const margin = this.width * 0.38;
    // Spin out of control
    this.spinAngle += 5 * dt;
    const floatTarget = FROG_TARGET_Y + Math.sin(this.floatTime * 1.2) * 30;
    this.y += (floatTarget - this.y) * 2 * dt;
    const dx = this.targetX - this.x;
    const step = FROG_CHASE_SPEED * 1.5 * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

    this.rageTimer += dt;
    this.rageShootTimer += dt;
    if (this.rageShootTimer >= 0.35) {
      this.rageShootTimer = 0;
      // Spray tadpoles in multiple directions
      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 200;
        const tx = this.targetX + spread;
        const ty = this.targetY + (Math.random() - 0.5) * 100;
        this._pendingProjectiles.push(new Tadpole(this.x, this.y + 20, tx, ty));
      }
    }
    if (this.rageTimer >= BOSS_RAGE_DURATION) {
      this.isRaging = false;
      this.rageTimer = 0;
      this.rageShootTimer = 0;
      this.spinAngle = 0;
      this.animFrame = 0;
      this.animTimer = 0;
      this.nextRageIdx++;
      this.attackState = 'idle';
      this.attackTimer = 0;
      this.idleWait = 1.0;
      this.sequenceStep = 0;
    }
  }

  private updateNormal(dt: number): void {
    const margin = this.width * 0.38;

    if (this.attackState === 'idle' || this.attackState === 'shooting' || this.attackState === 'tongue') {
      const floatTarget = FROG_TARGET_Y + Math.sin(this.floatTime * 0.8) * 18;
      this.y += (floatTarget - this.y) * 1.5 * dt;
      const dx = this.targetX - this.x;
      const step = FROG_CHASE_SPEED * dt;
      this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    } else if (this.attackState === 'jumping') {
      const dxJ = this.jumpTargetX - this.x;
      const dyJ = this.jumpTargetY - this.y;
      const distJ = Math.sqrt(dxJ * dxJ + dyJ * dyJ);
      const jumpStep = FROG_JUMP_SPEED * dt;
      if (distJ > jumpStep) {
        this.x += (dxJ / distJ) * jumpStep;
        this.y += (dyJ / distJ) * jumpStep;
      } else {
        this.x = this.jumpTargetX;
        this.y = this.jumpTargetY;
      }
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    } else if (this.attackState === 'retreating') {
      const dyR = FROG_TARGET_Y - this.y;
      const retStep = FROG_RETREAT_SPEED * dt;
      this.y += Math.abs(dyR) > retStep ? Math.sign(dyR) * retStep : dyR;
      const dxR = this.targetX - this.x;
      const stepR = FROG_CHASE_SPEED * dt;
      this.x += Math.abs(dxR) > stepR ? Math.sign(dxR) * stepR : dxR;
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    }

    this.attackTimer += dt;

    switch (this.attackState) {
      case 'idle':
        if (this.attackTimer >= this.idleWait) {
          this.attackTimer = 0;
          this.sequenceStep = (this.sequenceStep + 1) % 3;
          if (this.sequenceStep === 0) {
            // Jump at player
            this.jumpTargetX = this.targetX;
            this.jumpTargetY = this.targetY;
            this.attackState = 'jumping';
          } else if (this.sequenceStep === 1) {
            // Shoot 3 tadpoles
            this.attackState = 'shooting';
          } else {
            // Tongue attack
            this.attackState = 'tongue';
            this._pendingProjectiles.push(new FrogTongue(this, 20, this.targetX, this.targetY));
          }
        }
        break;

      case 'jumping':
        if (this.attackTimer >= FROG_JUMP_DURATION) {
          this.attackTimer = 0;
          this.attackState = 'retreating';
        }
        break;

      case 'retreating':
        if (Math.abs(this.y - FROG_TARGET_Y) < 10 || this.attackTimer >= 1.0) {
          this.attackTimer = 0;
          this.attackState = 'idle';
          this.idleWait = 0.8;
        }
        break;

      case 'shooting':
        if (this.attackTimer >= 0.15) {
          this.attackTimer = 0;
          if (!this.tadpoleToggle) {
            // Burst of 3 tadpoles aimed at player
            for (let i = 0; i < 3; i++) {
              const spread = (i - 1) * 30;
              this._pendingProjectiles.push(new Tadpole(this.x, this.y + 20, this.targetX + spread, this.targetY));
            }
          } else {
            // Fart a toxic green cloud that chases the stingray
            this._pendingProjectiles.push(new ToxicCloud(this.x, this.y + 20, this.targetX, this.targetY));
          }
          this.tadpoleToggle = !this.tadpoleToggle;
          this.attackState = 'idle';
          this.idleWait = 1.2;
        }
        break;

      case 'tongue':
        if (this.attackTimer >= 1.4) {
          this.attackTimer = 0;
          this.attackState = 'idle';
          this.idleWait = 1.0;
        }
        break;
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
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width * 0.32,
      y: this.y - this.height * 0.32,
      width: this.width * 0.64,
      height: this.height * 0.64,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.defeated) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.isRaging) ctx.rotate(this.spinAngle);

    // Scale factors from sprite-space (88×90) to world-space (FROG_WIDTH × FROG_HEIGHT)
    const sx = this.width / 88;
    const sy = this.height / 90;

    // Shoulder pivot positions in world-space (relative to frog centre)
    // Sprite sockets at (10, 56) and (78, 56) → world: (10*sx−w/2, 56*sy−h/2)
    const leftPivotX  = 10 * sx - this.width / 2;   // ≈ −65
    const leftPivotY  = 56 * sy - this.height / 2;  // ≈  22
    const rightPivotX = 78 * sx - this.width / 2;   // ≈  65
    const rightPivotY = leftPivotY;

    const baseColor = this.isRaging ? '#88cc00' : '#5a9a00';
    const skinColor = this.isRaging ? '#aaee22' : '#7acc22';
    const darkColor = this.isRaging ? '#4a7a00' : '#2a5800';

    // ── Draw spinning arms (BEHIND body so shoulder is buried in the torso) ────
    const drawArm = (pivotX: number, pivotY: number, angle: number) => {
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(angle);

      // Upper arm
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 2;
      ctx.fillStyle = baseColor;
      ctx.beginPath(); ctx.ellipse(0, 22, 16, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Forearm (slightly narrower, further out)
      ctx.beginPath(); ctx.ellipse(0, 52, 12, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Fist
      ctx.beginPath(); ctx.arc(0, 72, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Muscle highlight
      ctx.fillStyle = skinColor;
      ctx.beginPath(); ctx.ellipse(0, 14, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
      // Knuckle dots on fist
      ctx.fillStyle = darkColor;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath(); ctx.arc(k * 7, 68, 3, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();
    };

    if (this.hitFlash <= 0) {
      drawArm(leftPivotX, leftPivotY, this.armAngle);
      drawArm(rightPivotX, rightPivotY, -this.armAngle);
    }

    // ── Animated muscular frog legs (BEHIND body sprite) ─────────────────────────
    // Hip joint world positions: sprite (16, 73) and (72, 73) → world (±56, 56)
    const leftHipX  = 16 * sx - this.width / 2;   // ≈ −55
    const rightHipX = 72 * sx - this.width / 2;   // ≈  53
    const hipY      = 73 * sy - this.height / 2;  // ≈  56
    if (this.hitFlash <= 0) {
      drawFrogLeg(ctx, leftHipX,  hipY, this.legPhaseLeft,  -1, this.isRaging);
      drawFrogLeg(ctx, rightHipX, hipY, this.legPhaseRight,  1, this.isRaging);
    }

    // ── Body sprite ─────────────────────────────────────────────────────────────
    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';
    const sprites = this.isRaging ? this.rageSprites : this.normalSprites;
    ctx.drawImage(sprites[this.animFrame], -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.filter = 'none';

    // ── Re-draw shoulder sockets on top of the arm root (non-rage only) ─────────
    if (!this.isRaging) {
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.arc(leftPivotX, leftPivotY, 9 * sx, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = baseColor;
      ctx.beginPath(); ctx.arc(leftPivotX, leftPivotY, 6 * sx, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = darkColor;
      ctx.beginPath(); ctx.arc(rightPivotX, rightPivotY, 9 * sx, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = baseColor;
      ctx.beginPath(); ctx.arc(rightPivotX, rightPivotY, 6 * sx, 0, Math.PI * 2); ctx.fill();
    }

    // ── Rage aura ────────────────────────────────────────────────────────────────
    if (this.isRaging) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, this.width * 0.7);
      aura.addColorStop(0, 'rgba(150,255,0,0.22)');
      aura.addColorStop(0.5, 'rgba(100,200,0,0.1)');
      aura.addColorStop(1, 'rgba(100,200,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    this.renderHPBar(ctx);
  }

  private renderHPBar(ctx: CanvasRenderingContext2D): void {
    const barW = CANVAS_WIDTH - 60;
    const barH = 10;
    const barX = 30;
    const barY = 8;

    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);
    ctx.fill();

    const frac = Math.max(0, this.hp / this.maxHp);
    const fillColor = this.isRaging ? '#aaff00' : (frac > 0.5 ? '#44cc00' : frac > 0.25 ? '#88aa00' : '#cc6600');
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, '#ccffaa');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * frac, barH);

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = this.isRaging ? '#aaff00' : '#66cc00';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = this.isRaging ? '#aaff00' : '#44aa00';
    ctx.shadowBlur = 6;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.isRaging ? '#aaff00' : '#88dd44';
    ctx.globalAlpha = 1;
    ctx.fillText('BOSS', barX, barY - 2);

    if (this.isRaging) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#aaff00';
      ctx.shadowColor = '#aaff00';
      ctx.shadowBlur = 8;
      ctx.fillText('RAGE MODE!', barX + barW, barY - 2);
    }

    ctx.restore();
  }
}
