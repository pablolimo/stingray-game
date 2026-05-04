import { BigEnemy } from '../entityRoles';

function createBarrelSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 36;
  c.height = 44;
  const ctx = c.getContext('2d')!;

  // Barrel body – metal yellow-grey
  ctx.fillStyle = '#c8a800';
  ctx.beginPath();
  ctx.roundRect(4, 6, 28, 34, 4);
  ctx.fill();

  // Metal bands
  ctx.strokeStyle = '#888600';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 6, 28, 34);
  ctx.beginPath(); ctx.moveTo(4, 14); ctx.lineTo(32, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, 32); ctx.lineTo(32, 32); ctx.stroke();

  // Top lid
  ctx.fillStyle = '#aaa000';
  ctx.beginPath();
  ctx.ellipse(18, 6, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Biohazard symbol (simplified 3-arc design)
  ctx.save();
  ctx.translate(18, 22);
  const bColor = '#1a1a00';
  ctx.strokeStyle = bColor;
  ctx.lineWidth = 2;
  ctx.fillStyle = bColor;

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Three lobes
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const lx = Math.cos(angle) * 4.5;
    const ly = Math.sin(angle) * 4.5;
    ctx.beginPath();
    ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Greenish glow bottom
  const glow = ctx.createRadialGradient(18, 38, 2, 18, 38, 16);
  glow.addColorStop(0, 'rgba(0,255,80,0.35)');
  glow.addColorStop(1, 'rgba(0,200,50,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 22, 36, 22);

  return c;
}

export class RadioactiveBarrel extends BigEnemy {
  x: number;
  y: number;
  width: number = 36;
  height: number = 44;
  targetX: number;

  private sprite: HTMLCanvasElement;
  private glowTimer: number;

  constructor(x: number, y: number, targetX: number) {
    super();
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.sprite = createBarrelSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 2;
    // Static: doesn't chase player
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Pulsing greenish glow around barrel
    ctx.save();
    const glowAlpha = 0.18 + Math.abs(Math.sin(this.glowTimer)) * 0.15;
    ctx.globalAlpha = glowAlpha;
    const g = ctx.createRadialGradient(this.x, this.y + 6, 4, this.x, this.y + 6, 32);
    g.addColorStop(0, 'rgba(0,255,80,0.8)');
    g.addColorStop(1, 'rgba(0,180,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y + 6, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
