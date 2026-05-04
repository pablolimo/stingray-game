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
    goldScore: number = 0,
    powerupStyle: 'laser' | 'arc' | 'nuclear' = 'laser',
    speedBoostTimer: number = 0,
  ): void {
    // Score
    ctx.save();
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`SCORE: ${score}`, 10, 24);

    // Gold coin score (shown below main score)
    if (goldScore > 0) {
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#b8860b';
      ctx.shadowBlur = 6;
      ctx.fillText(`$: ${goldScore}`, 10, 42);
    }

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

      const isNuclear = powerupStyle === 'nuclear';
      const barColor = isNuclear ? '#ff4400' : '#00e5ff';
      const barFillA = isNuclear ? '#ff8800' : '#0055aa';
      const barFillB = isNuclear ? '#ffcc00' : '#00e5ff';
      const barBorder = isNuclear ? '#ff4400' : '#00e5ff';

      ctx.save();

      // Label
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      if (laserActive) {
        ctx.fillStyle = barColor;
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 8;
        ctx.fillText(isNuclear ? 'NUCLEAR FIRE ACTIVE!' : 'LASER ACTIVE!', barX, barY - 4);
      } else if (gaugeLevel > 0) {
        ctx.fillStyle = barColor;
        ctx.shadowColor = `${barColor}88`;
        ctx.shadowBlur = 4;
        ctx.fillText(isNuclear ? 'NUCLEAR GAUGE' : 'LASER GAUGE', barX, barY - 4);
      } else {
        ctx.fillStyle = '#89c';
        ctx.shadowBlur = 0;
        ctx.fillText(isNuclear ? 'NUCLEAR GAUGE – eat to charge!' : 'LASER GAUGE – eat to recharge!', barX, barY - 4);
      }

      // Bar background
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = isNuclear ? '#330000' : '#003344';
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill
      ctx.globalAlpha = 1;
      const fillW = barW * Math.min(gaugeLevel, 1);
      if (laserActive) {
        const pulse = 0.7 + Math.sin(Date.now() / 80) * 0.3;
        ctx.globalAlpha = pulse;
        const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, isNuclear ? '#cc4400' : '#00bcd4');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, barColor);
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
      } else {
        const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        grad.addColorStop(0, barFillA);
        grad.addColorStop(1, barFillB);
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, fillW, barH);
      }

      // Bar border
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = barBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.restore();
    }

    // Speed boost indicator (shown while active)
    if (speedBoostTimer > 0) {
      ctx.save();
      const bx = 20;
      const by = CANVAS_HEIGHT - 48;
      const alpha = Math.min(1, speedBoostTimer);
      const hue = (Date.now() / 10) % 360;
      ctx.globalAlpha = alpha * (0.7 + Math.sin(Date.now() / 80) * 0.3);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `hsl(${hue},100%,65%)`;
      ctx.shadowColor = `hsl(${hue},100%,50%)`;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ SPEED BOOST ${speedBoostTimer.toFixed(1)}s`, bx, by);
      ctx.restore();
    }
  }
}
