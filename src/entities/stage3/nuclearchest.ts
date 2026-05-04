import { PowerupCollectible } from '../entityRoles';

function createNuclearChestSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 36;
  c.height = 30;
  const ctx = c.getContext('2d')!;

  // Box body – shiny metal
  const metalGrd = ctx.createLinearGradient(2, 12, 2, 28);
  metalGrd.addColorStop(0, '#d0d8e0');
  metalGrd.addColorStop(0.5, '#a0aab8');
  metalGrd.addColorStop(1, '#707888');
  ctx.fillStyle = metalGrd;
  ctx.fillRect(3, 14, 30, 15);

  // Box lid
  const lidGrd = ctx.createLinearGradient(2, 4, 2, 14);
  lidGrd.addColorStop(0, '#e0e8f0');
  lidGrd.addColorStop(1, '#b0b8c8');
  ctx.fillStyle = lidGrd;
  ctx.fillRect(2, 6, 32, 10);
  ctx.fillRect(4, 4, 28, 4);

  // Metal rivets
  ctx.fillStyle = '#c0c8d0';
  const rivets = [[5,22],[31,22],[5,13],[31,13]];
  for (const [rx,ry] of rivets) {
    ctx.beginPath(); ctx.arc(rx, ry, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // Green crystal in center
  const crystalGrd = ctx.createRadialGradient(18, 18, 2, 18, 18, 8);
  crystalGrd.addColorStop(0, '#ccffcc');
  crystalGrd.addColorStop(0.4, '#44ff88');
  crystalGrd.addColorStop(1, '#006622');
  ctx.fillStyle = crystalGrd;
  ctx.shadowColor = '#00ff66';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(18, 10);
  ctx.lineTo(24, 16);
  ctx.lineTo(22, 24);
  ctx.lineTo(14, 24);
  ctx.lineTo(12, 16);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crystal highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(18, 11);
  ctx.lineTo(22, 15);
  ctx.lineTo(20, 15);
  ctx.lineTo(17, 12);
  ctx.closePath();
  ctx.fill();

  // Metal border on box
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 6, 30, 23);

  return c;
}

export class NuclearChest extends PowerupCollectible {
  x: number;
  y: number;
  width: number = 64;
  height: number = 52;
  collected: boolean = false;
  score: number = 0;

  get powerupStyle(): 'laser' | 'arc' | 'nuclear' { return 'nuclear'; }

  private sprite: HTMLCanvasElement;
  private glowTimer: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = createNuclearChestSprite();
    this.glowTimer = Math.random() * Math.PI * 2;
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    this.glowTimer += dt * 2.5;
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
    if (this.collected) return;

    // Green pulsing glow
    ctx.save();
    const gAlpha = 0.22 + Math.abs(Math.sin(this.glowTimer)) * 0.18;
    ctx.globalAlpha = gAlpha;
    const gGrd = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, 42);
    gGrd.addColorStop(0, 'rgba(0,255,100,0.8)');
    gGrd.addColorStop(1, 'rgba(0,200,50,0)');
    ctx.fillStyle = gGrd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // Sparkle on crystal
    ctx.save();
    ctx.fillStyle = '#aaffcc';
    for (let i = 0; i < 4; i++) {
      const phase = this.glowTimer * 3 + i * 1.6;
      const alpha = (Math.sin(phase) + 1) / 2;
      ctx.globalAlpha = alpha * 0.9;
      const ox = (i % 2 === 0 ? -1 : 1) * (8 + i * 4);
      ctx.beginPath();
      ctx.arc(this.x + ox, this.y - 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
