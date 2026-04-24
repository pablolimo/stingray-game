import { createHeartSprite } from './sprites';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIELD_DURATION } from './constants';

export class HUD {
  private heartSprite: HTMLCanvasElement;

  constructor() {
    this.heartSprite = createHeartSprite();
  }

  render(
    ctx: CanvasRenderingContext2D,
    score: number,
    hp: number,
    powerupActive: boolean = false,
    gaugeLevel: number = 0,
    laserActive: boolean = false,
    shieldActive: boolean = false,
    shieldTimer: number = 0,
  ): void {
    // Score
    ctx.save();
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`SCORE: ${score}`, 10, 24);

    // Hearts top right
    for (let i = 0; i < hp; i++) {
      ctx.drawImage(this.heartSprite, CANVAS_WIDTH - 12 - (hp - i) * 14, 8, 12, 12);
    }
    ctx.restore();

    // Shield timer bar (below hearts, only when shield is active)
    if (shieldActive) {
      const shW = hp * 14 + 4;
      const shX = CANVAS_WIDTH - 12 - shW;
      const shY = 22;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#330000';
      ctx.fillRect(shX, shY, shW, 4);
      ctx.globalAlpha = 0.9;
      const shieldFrac = Math.max(0, shieldTimer / SHIELD_DURATION);
      const grad = ctx.createLinearGradient(shX, 0, shX + shW * shieldFrac, 0);
      grad.addColorStop(0, '#ff2222');
      grad.addColorStop(1, '#ff8888');
      ctx.fillStyle = grad;
      ctx.fillRect(shX, shY, shW * shieldFrac, 4);
      ctx.restore();
    }

    // Laser gauge bar (bottom of screen, only when powerup is active)
    if (powerupActive) {
      const barW = CANVAS_WIDTH - 40;
      const barH = 14;
      const barX = 20;
      const barY = CANVAS_HEIGHT - 28;

      ctx.save();

      // Label
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      if (laserActive) {
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.fillText('LASER ACTIVE!', barX, barY - 4);
      } else if (gaugeLevel > 0) {
        ctx.fillStyle = '#aef';
        ctx.shadowColor = 'rgba(0,229,255,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText('LASER GAUGE', barX, barY - 4);
      } else {
        ctx.fillStyle = '#89c';
        ctx.shadowBlur = 0;
        ctx.fillText('LASER GAUGE – eat to recharge!', barX, barY - 4);
      }

      // Bar background
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#003344';
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill
      ctx.globalAlpha = 1;
      const fillW = barW * Math.min(gaugeLevel, 1);
      if (laserActive) {
        // Bright pulsing cyan when laser is firing
        const pulse = 0.7 + Math.sin(Date.now() / 80) * 0.3;
        ctx.globalAlpha = pulse;
        const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, '#00bcd4');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, '#00e5ff');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
      } else {
        const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, '#0055aa');
        grad.addColorStop(1, '#00e5ff');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
      }

      // Bar border
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.restore();
    }
  }
}
