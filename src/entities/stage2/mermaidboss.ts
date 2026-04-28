import { Entity } from '../../types';
import { CANVAS_WIDTH, BOSS_MAX_HP, BOSS_LASER_HIT_INTERVAL } from '../../constants';
import { BossEnemy } from '../entityRoles';
import { EnergyBall } from '../energyball';

const MERMAID_WIDTH = 176;
const MERMAID_HEIGHT = 200;
const MERMAID_TARGET_Y = 220;
const MERMAID_CHASE_SPEED = 65;
const MERMAID_SHOOT_MIN = 1.8;
const MERMAID_SHOOT_MAX = 2.8;
const MERMAID_RAGE_THRESHOLD = 0.25; // single rage at 25%

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

  private pendingBalls: EnergyBall[] = [];
  get pendingProjectiles(): Entity[] { return this.pendingBalls; }
  set pendingProjectiles(v: Entity[]) { this.pendingBalls = v as EnergyBall[]; }

  private normalSprites: HTMLCanvasElement[];
  private rageSprites: HTMLCanvasElement[];
  private animFrame: number = 0;
  private animTimer: number = 0;
  private shootTimer: number = 0;
  private shootInterval: number;
  private floatTime: number = 0;
  private hitFlash: number = 0;
  private rageTriggered: boolean = false;

  constructor(x: number, startY: number) {
    super();
    this.x = x;
    this.y = startY;
    this.hp = BOSS_MAX_HP;
    this.maxHp = BOSS_MAX_HP;
    this.normalSprites = [createMermaidNormalSprite(), createMermaidNormalSprite()];
    this.rageSprites = [createMermaidRageSprite(), createMermaidRageSprite()];
    this.shootInterval = MERMAID_SHOOT_MIN + Math.random() * (MERMAID_SHOOT_MAX - MERMAID_SHOOT_MIN);
  }

  update(dt: number, _scrollSpeed: number): void {
    if (this.defeated) return;

    if (this.laserHitCooldown > 0) this.laserHitCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    this.floatTime += dt;

    // Slide in from top
    if (this.y < MERMAID_TARGET_Y) {
      this.y = Math.min(MERMAID_TARGET_Y, this.y + 110 * dt);
    }

    // Vertical float
    const floatTarget = MERMAID_TARGET_Y + Math.sin(this.floatTime * 0.7) * 20;
    this.y += (floatTarget - this.y) * 1.8 * dt;

    // Horizontal chase
    const dx = this.targetX - this.x;
    const step = MERMAID_CHASE_SPEED * dt;
    this.x += Math.abs(dx) > step ? Math.sign(dx) * step : dx;
    const margin = this.width * 0.38;
    this.x = Math.max(margin, Math.min(CANVAS_WIDTH - margin, this.x));

    // Sprite animation
    this.animTimer += dt;
    if (this.animTimer >= 0.45) { this.animTimer -= 0.45; this.animFrame = (this.animFrame + 1) % 2; }

    // Rage mode: shoot faster burst
    if (this.isRaging) {
      this.shootTimer += dt;
      const rageInterval = 0.5;
      if (this.shootTimer >= rageInterval) {
        this.shootTimer = 0;
        this.fireGoldBurst();
      }
    } else {
      this.shootTimer += dt;
      if (this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shootInterval = MERMAID_SHOOT_MIN + Math.random() * (MERMAID_SHOOT_MAX - MERMAID_SHOOT_MIN);
        this.fireWaterBolt();
      }
    }
  }

  private fireWaterBolt(): void {
    // Phase 1: single aimed water bolt toward player
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const angle = Math.atan2(dy, dx);
    const ball = new EnergyBall(this.x, this.y + 20, angle);
    // Tint it blue-white by overriding render - we just use regular EnergyBall
    this.pendingBalls.push(ball);
  }

  private fireGoldBurst(): void {
    // Phase 2 (rage): 6-way burst of golden bolts
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.pendingBalls.push(new EnergyBall(this.x, this.y + 20, angle));
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
    if (!this.rageTriggered && this.hp <= Math.floor(this.maxHp * MERMAID_RAGE_THRESHOLD)) {
      this.rageTriggered = true;
      this.isRaging = true;
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
      ctx.fillText('WITCH FORM UNLEASHED!', barX + barW, barY - 2);
    }

    ctx.restore();
  }
}
