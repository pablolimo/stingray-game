import { SARDINE_SCORE } from '../../constants';
import { FoodCollectible } from '../entityRoles';

function createSardineSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 18;
  c.height = 10;
  const ctx = c.getContext('2d')!;

  // Body – silvery blue
  ctx.fillStyle = '#88aabb';
  ctx.beginPath();
  ctx.ellipse(8, 5, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly shine
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(8, 4, 5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.fillStyle = '#6699aa';
  ctx.beginPath();
  ctx.moveTo(15, 5);
  ctx.lineTo(18, 2);
  ctx.lineTo(18, 8);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(3, 4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

export class Sardine extends FoodCollectible {
  x: number;
  y: number;
  width: number = 18;
  height: number = 10;
  collected: boolean = false;
  score: number = SARDINE_SCORE;

  // Group motion shared by the whole school
  private schoolOffsetX: number;
  private schoolOffsetY: number;
  private wavePhase: number;
  private sprite: HTMLCanvasElement;

  constructor(
    x: number,
    y: number,
    schoolOffsetX: number = 0,
    schoolOffsetY: number = 0,
    wavePhase: number = 0,
  ) {
    super();
    this.x = x;
    this.y = y;
    this.schoolOffsetX = schoolOffsetX;
    this.schoolOffsetY = schoolOffsetY;
    this.wavePhase = wavePhase;
    this.sprite = createSardineSprite();
  }

  update(dt: number, scrollSpeed: number): void {
    this.y += scrollSpeed * dt;
    // Gentle side-to-side swimming as a group
    this.x += Math.sin(this.wavePhase) * 35 * dt;
    this.wavePhase += dt * 1.8;
    // Individual slight drift using offsets
    this.x += Math.sin(this.wavePhase + this.schoolOffsetX) * 8 * dt;
    this.y += Math.cos(this.wavePhase * 0.7 + this.schoolOffsetY) * 4 * dt;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    ctx.drawImage(this.sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}

/**
 * Create a school of 10 sardines clustered around the given position.
 */
export function createSardineSchool(cx: number, cy: number): Sardine[] {
  const school: Sardine[] = [];
  const sharedPhase = Math.random() * Math.PI * 2;
  for (let i = 0; i < 10; i++) {
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 40;
    const phaseShift = (i / 10) * Math.PI * 2;
    school.push(new Sardine(cx + offsetX, cy + offsetY, offsetX * 0.1, offsetY * 0.1, sharedPhase + phaseShift));
  }
  return school;
}
