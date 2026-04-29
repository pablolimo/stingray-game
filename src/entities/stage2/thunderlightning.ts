import { CANVAS_HEIGHT } from '../../constants';
import { ProjectileEntity } from '../entityRoles';

const WARNING_DURATION = 0.5;  // seconds of warning indicator
const STRIKE_DURATION  = 0.35; // seconds of active bolt

export class ThunderLightning extends ProjectileEntity {
  x: number;
  y: number = 0;
  width: number = 40;
  height: number = CANVAS_HEIGHT;
  active: boolean = true;

  private timer: number = 0;
  private striking: boolean = false;
  // Per-frame zigzag offsets refreshed each render call for a flickering look
  private zigzagOffsets: number[] = [];

  constructor(x: number) {
    super();
    this.x = x;
    this.refreshZigzag();
  }

  private refreshZigzag(): void {
    const segments = 14;
    this.zigzagOffsets = [];
    for (let i = 0; i <= segments; i++) {
      this.zigzagOffsets.push((Math.random() - 0.5) * 22);
    }
  }

  update(dt: number, _scrollSpeed: number): void {
    this.timer += dt;
    if (this.timer < WARNING_DURATION) {
      this.striking = false;
    } else if (this.timer < WARNING_DURATION + STRIKE_DURATION) {
      this.striking = true;
    } else {
      this.striking = false;
      this.active = false;
    }
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    // Only collidable during the actual strike
    if (!this.striking) {
      return { x: -9999, y: -9999, width: 0, height: 0 };
    }
    return {
      x: this.x - 18,
      y: 0,
      width: 36,
      height: CANVAS_HEIGHT,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const warn = this.timer < WARNING_DURATION;

    ctx.save();

    if (warn) {
      // Warning phase: thin pulsing dashed line
      const pulse = 0.35 + Math.sin(this.timer * 25) * 0.2;
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#ffff88';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small warning diamond at top
      ctx.globalAlpha = pulse + 0.2;
      ctx.fillStyle = '#ffff44';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(this.x, 12);
      ctx.lineTo(this.x + 8, 22);
      ctx.lineTo(this.x, 32);
      ctx.lineTo(this.x - 8, 22);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.striking) {
      // Strike phase: bright zigzag bolt (refreshed each frame for flicker)
      this.refreshZigzag();

      const progress = (this.timer - WARNING_DURATION) / STRIKE_DURATION;
      ctx.globalAlpha = 1 - progress * 0.4;

      const segments = this.zigzagOffsets.length - 1;

      // Outer glow pass
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = 'rgba(255,230,80,0.85)';
      ctx.lineWidth = 9;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x + this.zigzagOffsets[0], 0);
      for (let i = 1; i <= segments; i++) {
        const cy = (i / segments) * CANVAS_HEIGHT;
        ctx.lineTo(this.x + this.zigzagOffsets[i], cy);
      }
      ctx.stroke();

      // Mid pass
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.x + this.zigzagOffsets[0], 0);
      for (let i = 1; i <= segments; i++) {
        const cy = (i / segments) * CANVAS_HEIGHT;
        ctx.lineTo(this.x + this.zigzagOffsets[i], cy);
      }
      ctx.stroke();

      // Bright core
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + this.zigzagOffsets[0], 0);
      for (let i = 1; i <= segments; i++) {
        const cy = (i / segments) * CANVAS_HEIGHT;
        ctx.lineTo(this.x + this.zigzagOffsets[i], cy);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
