import { Entity } from '../../types';
import { CANVAS_WIDTH, BOSS_MAX_HP, BOSS_LASER_HIT_INTERVAL, BOSS_RAGE_DURATION } from '../../constants';
import { BossEnemy } from '../entityRoles';
import { MermaidRock } from './mermaidrock';
import { ThunderLightning } from './thunderlightning';

const MERMAID_WIDTH = 176;
const MERMAID_HEIGHT = 200;
const MERMAID_TARGET_Y = 220;
const MERMAID_CHASE_SPEED = 65;
const CHARGE_SPEED = 520;   // px/s toward player during charge
const RETREAT_SPEED = 380;  // px/s back to home Y after charge
const CHARGE_DURATION = 0.65; // max seconds per charge rush

type AttackState = 'idle' | 'prepare' | 'charging' | 'retreating' | 'throwing';

function createMermaidNormalSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 88;
  c.height = 100;
  const ctx = c.getContext('2d')!;

  // Subtle blue glow aura
  const auraGrd = ctx.createRadialGradient(44, 50, 10, 44, 50, 46);
  auraGrd.addColorStop(0, 'rgba(100,150,255,0.2)');
  auraGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrd;
  ctx.fillRect(0, 0, 88, 100);

  // Fish tail (bottom)
  ctx.fillStyle = '#1a6880';
  ctx.beginPath();
  ctx.ellipse(44, 78, 16, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail scales shimmer
  ctx.strokeStyle = '#2a88aa';
  ctx.lineWidth = 0.8;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const sx = 30 + col * 7 + (row % 2 === 0 ? 3 : 0);
      const sy = 62 + row * 7;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Tail fin (forked)
  ctx.fillStyle = '#1a8899';
  ctx.beginPath();
  ctx.moveTo(36, 94);
  ctx.lineTo(28, 100);
  ctx.lineTo(44, 90);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(52, 94);
  ctx.lineTo(60, 100);
  ctx.lineTo(44, 90);
  ctx.closePath();
  ctx.fill();

  // Upper body / torso
  ctx.fillStyle = '#aabccc'; // pale blue skin
  ctx.beginPath();
  ctx.ellipse(44, 50, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Seashell bra / chest piece
  ctx.fillStyle = '#5588aa';
  ctx.beginPath();
  ctx.ellipse(38, 52, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(50, 52, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Arms reaching forward
  ctx.strokeStyle = '#aabccc';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(30, 48);
  ctx.quadraticCurveTo(18, 52, 14, 60);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(58, 48);
  ctx.quadraticCurveTo(70, 52, 74, 60);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#aabccc';
  ctx.beginPath();
  ctx.ellipse(44, 28, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long flowing dark hair
  ctx.fillStyle = '#1a1a2a';
  // Left hair flow
  ctx.beginPath();
  ctx.moveTo(32, 22);
  ctx.quadraticCurveTo(18, 35, 16, 55);
  ctx.quadraticCurveTo(14, 65, 18, 75);
  ctx.lineTo(22, 74);
  ctx.quadraticCurveTo(20, 65, 22, 54);
  ctx.quadraticCurveTo(24, 35, 36, 24);
  ctx.closePath();
  ctx.fill();

  // Right hair flow
  ctx.beginPath();
  ctx.moveTo(56, 22);
  ctx.quadraticCurveTo(70, 35, 72, 55);
  ctx.quadraticCurveTo(74, 65, 70, 75);
  ctx.lineTo(66, 74);
  ctx.quadraticCurveTo(68, 65, 66, 54);
  ctx.quadraticCurveTo(64, 35, 52, 24);
  ctx.closePath();
  ctx.fill();

  // Top of head hair
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.ellipse(44, 18, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gloomy face
  // Eyes (half-closed, sad)
  ctx.fillStyle = '#334455';
  ctx.beginPath();
  ctx.ellipse(39, 26, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(49, 26, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Half-closed eyelids
  ctx.fillStyle = '#aabccc';
  ctx.fillRect(35, 23, 8, 3);
  ctx.fillRect(45, 23, 8, 3);

  // Eye pupils glow (pale blue)
  ctx.fillStyle = '#88aaff';
  ctx.shadowColor = '#88aaff';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(39, 27, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(49, 27, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Sad frown
  ctx.strokeStyle = '#8899aa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(44, 34, 5, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Tears
  ctx.fillStyle = '#88aaff';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(37, 31, 1.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(51, 32, 1.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  return c;
}

function createMermaidRageSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 88;
  c.height = 100;
  const ctx = c.getContext('2d')!;

  // Bright white-gold aura
  const auraGrd = ctx.createRadialGradient(44, 50, 8, 44, 50, 46);
  auraGrd.addColorStop(0, 'rgba(255,240,100,0.4)');
  auraGrd.addColorStop(0.5, 'rgba(255,200,50,0.2)');
  auraGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrd;
  ctx.fillRect(0, 0, 88, 100);

  // Serpent body (lower) - glowing coiling snake body
  ctx.fillStyle = '#2a1a3a';
  ctx.beginPath();
  ctx.ellipse(44, 75, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Serpent coil highlights
  ctx.strokeStyle = '#cc88ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#aa44ff';
  ctx.shadowBlur = 6;
  for (let i = 0; i < 4; i++) {
    const sy = 58 + i * 12;
    ctx.beginPath();
    ctx.ellipse(44, sy, 18 - i * 2, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Upper body - bright
  ctx.fillStyle = '#ffe0aa'; // bright gold-white skin
  ctx.beginPath();
  ctx.ellipse(44, 50, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Battle dress / armor
  ctx.fillStyle = '#aa6600';
  ctx.beginPath();
  ctx.ellipse(38, 52, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(50, 52, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#ffe0aa';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(30, 48);
  ctx.quadraticCurveTo(16, 50, 12, 58);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(58, 48);
  ctx.quadraticCurveTo(72, 50, 76, 58);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#ffe0aa';
  ctx.beginPath();
  ctx.ellipse(44, 28, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Witch hat
  ctx.fillStyle = '#1a0a2a';
  // Brim
  ctx.beginPath();
  ctx.ellipse(44, 16, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cone
  ctx.beginPath();
  ctx.moveTo(28, 16);
  ctx.lineTo(44, -8);
  ctx.lineTo(60, 16);
  ctx.closePath();
  ctx.fill();
  // Gold hat band
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 4;
  ctx.fillRect(28, 13, 32, 4);
  ctx.shadowBlur = 0;

  // Dark flowing hair (shorter on sides)
  ctx.fillStyle = '#1a0a2a';
  ctx.beginPath();
  ctx.moveTo(32, 22);
  ctx.quadraticCurveTo(20, 34, 20, 50);
  ctx.lineTo(24, 50);
  ctx.quadraticCurveTo(24, 36, 36, 26);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(56, 22);
  ctx.quadraticCurveTo(68, 34, 68, 50);
  ctx.lineTo(64, 50);
  ctx.quadraticCurveTo(64, 36, 52, 26);
  ctx.closePath();
  ctx.fill();

  // Angry eyes (glowing yellow/gold)
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath();
  ctx.ellipse(39, 26, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(49, 26, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffdd00';
  ctx.shadowColor = '#ffdd00';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(39, 26, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(49, 26, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Angry brow
  ctx.strokeStyle = '#1a0a00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, 21);
  ctx.lineTo(44, 23);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(54, 21);
  ctx.lineTo(44, 23);
  ctx.stroke();

  // Evil grin
  ctx.strokeStyle = '#cc4400';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(44, 33, 5, 0.1 * Math.PI, 0.9 * Math.PI, true);
  ctx.stroke();

  // Gold aura sparkles on body
  ctx.fillStyle = '#ffdd00';
  ctx.shadowColor = '#ffdd00';
  ctx.shadowBlur = 4;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(44 + Math.cos(a) * 22, 50 + Math.sin(a) * 26, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  return c;
}

export class MermaidBoss extends BossEnemy {
  x: number;
  y: number;
  width: number = MERMAID_WIDTH;
  height: number = MERMAID_HEIGHT;
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

  // Normal-mode attack state machine
  private attackState: AttackState = 'idle';
  private attackTimer: number = 0;
  private chargeCount: number = 0;
  private chargeTargetX: number = 0;
  private chargeTargetY: number = 0;
  private idleWait: number = 1.5;

  // rage triggers at 75%, 50%, 25% HP remaining
  private rageThresholds: number[];
  private nextRageIdx: number = 0;

  constructor(x: number, startY: number) {
    super();
    this.x = x;
    this.y = startY;
    this.hp = BOSS_MAX_HP;
    this.maxHp = BOSS_MAX_HP;
    this.rageThresholds = [
      Math.floor(BOSS_MAX_HP * 0.75),
      Math.floor(BOSS_MAX_HP * 0.50),
      Math.floor(BOSS_MAX_HP * 0.25),
    ];
    this.normalSprites = [createMermaidNormalSprite(), createMermaidNormalSprite()];
    this.rageSprites = [createMermaidRageSprite(), createMermaidRageSprite()];
  }

  update(dt: number, _scrollSpeed: number): void {
    if (this.defeated) return;

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this.floatTime += dt;

    // Slide in from top – skip attack logic until in position
    if (this.y < MERMAID_TARGET_Y) {
      this.y = Math.min(MERMAID_TARGET_Y, this.y + 110 * dt);
      return;
    }

    // Sprite animation
    this.animTimer += dt;
    if (this.animTimer >= 0.45) { this.animTimer -= 0.45; this.animFrame = (this.animFrame + 1) % 2; }

    if (this.isRaging) {
      // Rage mode: float at top + chase + thunder strikes
      const floatTarget = MERMAID_TARGET_Y + Math.sin(this.floatTime * 0.7) * 20;
      this.y += (floatTarget - this.y) * 1.8 * dt;
      const dx = this.targetX - this.x;
      const step = MERMAID_CHASE_SPEED * dt;
      this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
      const margin = this.width * 0.38;
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

      this.rageTimer += dt;
      this.rageShootTimer += dt;
      if (this.rageShootTimer >= 0.55) {
        this.rageShootTimer = 0;
        this.spawnThunder();
      }
      if (this.rageTimer >= BOSS_RAGE_DURATION) {
        this.isRaging = false;
        this.rageTimer = 0;
        this.rageShootTimer = 0;
        this.nextRageIdx++;
        // Reset attack state so she begins a fresh charge sequence
        this.attackState = 'idle';
        this.attackTimer = 0;
        this.chargeCount = 0;
        this.idleWait = 1.2;
      }
    } else {
      this.updateNormalAttack(dt);
    }
  }

  private updateNormalAttack(dt: number): void {
    // Movement is state-dependent
    const margin = this.width * 0.38;

    if (this.attackState === 'idle' || this.attackState === 'prepare' || this.attackState === 'throwing') {
      // Normal float + horizontal chase
      const floatTarget = MERMAID_TARGET_Y + Math.sin(this.floatTime * 0.7) * 20;
      this.y += (floatTarget - this.y) * 1.8 * dt;
      const dx = this.targetX - this.x;
      const step = MERMAID_CHASE_SPEED * dt;
      this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    } else if (this.attackState === 'charging') {
      // Rush toward the recorded player position
      const dxC = this.chargeTargetX - this.x;
      const dyC = this.chargeTargetY - this.y;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC);
      const chargeStep = CHARGE_SPEED * dt;
      if (distC > chargeStep) {
        this.x += (dxC / distC) * chargeStep;
        this.y += (dyC / distC) * chargeStep;
      } else {
        this.x = this.chargeTargetX;
        this.y = this.chargeTargetY;
      }
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    } else if (this.attackState === 'retreating') {
      // Rush back up to home Y
      const dyR = MERMAID_TARGET_Y - this.y;
      const retreatStep = RETREAT_SPEED * dt;
      this.y += Math.abs(dyR) > retreatStep ? Math.sign(dyR) * retreatStep : dyR;
      // Continue X chase while retreating
      const dxR = this.targetX - this.x;
      const stepR = MERMAID_CHASE_SPEED * dt;
      this.x += Math.abs(dxR) > stepR ? Math.sign(dxR) * stepR : dxR;
      this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));
    }

    // State timer + transitions
    this.attackTimer += dt;

    switch (this.attackState) {
      case 'idle':
        if (this.attackTimer >= this.idleWait) {
          this.attackTimer = 0;
          this.attackState = 'prepare';
        }
        break;

      case 'prepare':
        if (this.attackTimer >= 0.4) {
          this.attackTimer = 0;
          // Lock in player position at the moment the charge begins
          this.chargeTargetX = this.targetX;
          this.chargeTargetY = this.targetY;
          this.attackState = 'charging';
        }
        break;

      case 'charging':
        if (this.attackTimer >= CHARGE_DURATION) {
          this.attackTimer = 0;
          this.attackState = 'retreating';
        }
        break;

      case 'retreating':
        if (Math.abs(this.y - MERMAID_TARGET_Y) < 8 || this.attackTimer >= 1.4) {
          this.attackTimer = 0;
          this.chargeCount++;
          if (this.chargeCount >= 3) {
            this.chargeCount = 0;
            this.attackState = 'throwing';
            this.fireRock();
          } else {
            this.attackState = 'idle';
            this.idleWait = 0.5; // shorter pause between consecutive charges
          }
        }
        break;

      case 'throwing':
        // Brief pause after the rock is thrown before returning to idle
        if (this.attackTimer >= 0.5) {
          this.attackTimer = 0;
          this.attackState = 'idle';
          this.idleWait = 1.5;
        }
        break;
    }
  }

  private fireRock(): void {
    const rock = new MermaidRock(this.x, this.y + 20, this.targetX, this.targetY);
    this._pendingProjectiles.push(rock);
  }

  private spawnThunder(): void {
    // Spawn a lightning strike near the player's current position
    const spread = 220;
    const tx = this.targetX + (Math.random() - 0.5) * spread;
    const cx = Math.max(20, Math.min(CANVAS_WIDTH - 20, tx));
    this._pendingProjectiles.push(new ThunderLightning(cx));
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

    if (this.hitFlash > 0) ctx.filter = 'brightness(3)';

    const sprites = this.isRaging ? this.rageSprites : this.normalSprites;
    ctx.drawImage(sprites[this.animFrame], -this.width / 2, -this.height / 2, this.width, this.height);

    ctx.filter = 'none';

    // Rage: white-gold glow aura spinning
    if (this.isRaging) {
      ctx.save();
      const aura = ctx.createRadialGradient(0, 0, 20, 0, 0, this.width * 0.6);
      aura.addColorStop(0, 'rgba(255,220,50,0.22)');
      aura.addColorStop(1, 'rgba(255,200,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.6, 0, Math.PI * 2);
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
    const fillColor = this.isRaging ? '#ffdd00' : (frac > 0.5 ? '#aa44ff' : frac > 0.25 ? '#7722cc' : '#aa0099');
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * frac, barH);

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = this.isRaging ? '#ffdd00' : '#aa44ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = this.isRaging ? '#ffdd00' : '#aa44ff';
    ctx.shadowBlur = 6;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.isRaging ? '#ffdd00' : '#cc88ff';
    ctx.globalAlpha = 1;
    ctx.fillText('BOSS', barX, barY - 2);

    if (this.isRaging) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 8;
      ctx.fillText('INVINCIBLE RAGE!', barX + barW, barY - 2);
    }

    ctx.restore();
  }
}
