import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Bubble } from './types';

export class Background {
  private layer1: HTMLCanvasElement;
  private layer2: HTMLCanvasElement;
  private layer3: HTMLCanvasElement;
  private offset1: number = 0;
  private offset2: number = 0;
  private offset3: number = 0;
  private bubbles: Bubble[] = [];
  private time: number = 0;
  private readonly LAYER_HEIGHT = CANVAS_HEIGHT * 2;
  private readonly stageId: number;

  constructor(stageId: number = 1) {
    this.stageId = stageId;
    if (stageId === 2) {
      this.layer1 = this.createLayer1_s2();
      this.layer2 = this.createLayer2_s2();
      this.layer3 = this.createLayer3_s2();
    } else if (stageId === 3) {
      this.layer1 = this.createLayer1_s3();
      this.layer2 = this.createLayer2_s3();
      this.layer3 = this.createLayer3_s3();
    } else {
      this.layer1 = this.createLayer1();
      this.layer2 = this.createLayer2();
      this.layer3 = this.createLayer3();
    }
    this.initBubbles();
  }

  private createLayer1(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Caribbean sandy base – lighter, warmer
    ctx.fillStyle = '#e8d59a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, this.LAYER_HEIGHT);

    // Grain texture - random dots
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light ? 'rgba(255,240,190,0.5)' : 'rgba(160,120,60,0.25)';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    // Subtle color variation bands
    for (let y = 0; y < this.LAYER_HEIGHT; y += 40) {
      const alpha = (Math.sin(y * 0.05) + 1) * 0.03;
      ctx.fillStyle = `rgba(200,165,90,${alpha})`;
      ctx.fillRect(0, y, CANVAS_WIDTH, 20);
    }

    return c;
  }

  private createLayer2(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Pebbles
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 2 + Math.random() * 4;
      const gray = Math.floor(100 + Math.random() * 80);
      ctx.fillStyle = `rgb(${gray},${gray - 10},${gray - 20})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sand ripples – lighter, caribbean
    ctx.strokeStyle = 'rgba(180,150,80,0.25)';
    ctx.lineWidth = 1;
    for (let y = 30; y < this.LAYER_HEIGHT; y += 50 + Math.random() * 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < CANVAS_WIDTH; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
      }
      ctx.stroke();
    }

    // Dark sand patches
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.fillStyle = 'rgba(160,120,60,0.15)';
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 30, 10 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Decorative pineapples (3-5 scattered)
    const pineappleCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pineappleCount; i++) {
      const px = 20 + Math.random() * (CANVAS_WIDTH - 40);
      const py = 20 + Math.random() * (this.LAYER_HEIGHT - 40);
      this.drawPineapple(ctx, px, py);
    }

    // Decorative pink starfish (3-5 scattered)
    const sfCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sfCount; i++) {
      const sx = 15 + Math.random() * (CANVAS_WIDTH - 30);
      const sy = 15 + Math.random() * (this.LAYER_HEIGHT - 30);
      const sr = 6 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      this.drawPinkStarfish(ctx, sx, sy, sr, angle);
    }

    return c;
  }

  private drawPineapple(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const scale = 0.55 + Math.random() * 0.35;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.72;

    // Body
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Diamond pattern
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 0.8;
    for (let row = -2; row <= 2; row++) {
      for (let col = -1; col <= 1; col++) {
        const ox = col * 4 + (row % 2 === 0 ? 0 : 2);
        const oy = row * 4 + 4;
        ctx.beginPath();
        ctx.moveTo(ox, oy - 2);
        ctx.lineTo(ox + 2, oy);
        ctx.lineTo(ox, oy + 2);
        ctx.lineTo(ox - 2, oy);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Leaves
    ctx.fillStyle = '#2e7d32';
    const leaves = [
      { lx: 0, ly: -6, rot: 0 },
      { lx: -3, ly: -4, rot: -0.7 },
      { lx: 3, ly: -4, rot: 0.7 },
      { lx: -2, ly: -8, rot: -0.3 },
      { lx: 2, ly: -8, rot: 0.3 },
    ];
    for (const lf of leaves) {
      ctx.save();
      ctx.translate(lf.lx, lf.ly);
      ctx.rotate(lf.rot);
      ctx.beginPath();
      ctx.ellipse(0, -5, 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawPinkStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number): void {
    ctx.save();
    ctx.globalAlpha = 0.68;
    ctx.fillStyle = '#f48fb1';
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 0.7;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const innerR = r * 0.42;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      const radius = i % 2 === 0 ? r : innerR;
      const sx = radius * Math.cos(angle);
      const sy = radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private createLayer3(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Seaweed
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const baseY = Math.random() * this.LAYER_HEIGHT;
      ctx.strokeStyle = `rgba(${40 + Math.random() * 30},${120 + Math.random() * 60},${30 + Math.random() * 20},0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      const height = 20 + Math.random() * 30;
      for (let seg = 0; seg < 5; seg++) {
        const sy = baseY - (seg / 5) * height;
        ctx.quadraticCurveTo(
          x + (seg % 2 === 0 ? 8 : -8),
          sy - height / 10,
          x + (seg % 2 === 0 ? 4 : -4),
          sy - height / 5
        );
      }
      ctx.stroke();
    }

    // Small rocks
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 3 + Math.random() * 6;
      ctx.fillStyle = `rgba(${80 + Math.random() * 40},${70 + Math.random() * 30},${60 + Math.random() * 20},0.9)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.75, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Coral bits
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.fillStyle = `rgba(${200 + Math.random() * 55},${80 + Math.random() * 60},${60 + Math.random() * 40},0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  // ─── Stage 2 layer creators ────────────────────────────────────────────────

  private createLayer1_s2(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Midnight deep – slightly lighter with moonlight feel (~25% brighter)
    ctx.fillStyle = '#0d1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, this.LAYER_HEIGHT);

    // Grain texture with slightly brighter dots
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,70,120,0.35)' : 'rgba(15,30,55,0.3)';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    // Subtle dark blue bands
    for (let y = 0; y < this.LAYER_HEIGHT; y += 55) {
      const alpha = (Math.sin(y * 0.04) + 1) * 0.03;
      ctx.fillStyle = `rgba(20,50,100,${alpha})`;
      ctx.fillRect(0, y, CANVAS_WIDTH, 25);
    }

    // Faint star reflections scattered across the floor
    for (let i = 0; i < 80; i++) {
      const sx = Math.random() * CANVAS_WIDTH;
      const sy = Math.random() * this.LAYER_HEIGHT;
      const sr = 0.5 + Math.random() * 1.2;
      ctx.fillStyle = `rgba(200,220,255,${0.08 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  private createLayer2_s2(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Dark rock formations
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 4 + Math.random() * 9;
      const gray = Math.floor(18 + Math.random() * 20);
      ctx.fillStyle = `rgb(${gray},${gray + 5},${gray + 15})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.65, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bioluminescent floor plants (soft glowing stalks)
    for (let i = 0; i < 6; i++) {
      const x = 20 + Math.random() * (CANVAS_WIDTH - 40);
      const baseY = 20 + Math.random() * (this.LAYER_HEIGHT - 40);
      const glowColor = ['#00ffe8', '#aa44ff', '#44aaff', '#ff44aa'][Math.floor(Math.random() * 4)];
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = glowColor;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      for (let seg = 0; seg < 4; seg++) {
        const sy = baseY - (seg / 4) * 28;
        ctx.quadraticCurveTo(x + (seg % 2 === 0 ? 7 : -7), sy - 7, x + (seg % 2 === 0 ? 3 : -3), sy - 14);
      }
      ctx.stroke();
      // Tip glow dot
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x - 3, baseY - 28, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Bioluminescent scattered spore/dot patterns
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const glows = ['rgba(0,255,220,0.25)', 'rgba(150,50,255,0.2)', 'rgba(50,160,255,0.2)'];
      ctx.fillStyle = glows[Math.floor(Math.random() * glows.length)];
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  private createLayer3_s2(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    const coralColors = [
      { body: '#1a4a3a', glow: '#00e8cc' },
      { body: '#3a1a4a', glow: '#cc44ff' },
      { body: '#1a2a4a', glow: '#44aaff' },
      { body: '#4a2a1a', glow: '#ff8844' },
      { body: '#1a3a1a', glow: '#44ff88' },
    ];

    const numFormations = 18 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numFormations; i++) {
      const cx = 20 + Math.random() * (CANVAS_WIDTH - 40);
      const cy = 20 + Math.random() * (this.LAYER_HEIGHT - 40);
      const cc = coralColors[Math.floor(Math.random() * coralColors.length)];
      const formType = Math.floor(Math.random() * 4);
      ctx.save();
      ctx.translate(cx, cy);

      if (formType === 0) {
        // Branching coral: a trunk with 2-4 branches
        const branches = 2 + Math.floor(Math.random() * 3);
        const trunkH = 12 + Math.random() * 20;
        ctx.strokeStyle = cc.glow;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = cc.glow;
        ctx.shadowBlur = 7;
        ctx.globalAlpha = 0.65;
        // trunk
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -trunkH);
        ctx.stroke();
        // branches
        for (let b = 0; b < branches; b++) {
          const branchY = -trunkH * (0.3 + b * 0.25);
          const branchDir = b % 2 === 0 ? 1 : -1;
          const branchLen = 6 + Math.random() * 10;
          ctx.beginPath();
          ctx.moveTo(0, branchY);
          ctx.lineTo(branchDir * branchLen, branchY - branchLen * 0.8);
          ctx.stroke();
          // tip dot
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = cc.glow;
          ctx.beginPath();
          ctx.arc(branchDir * branchLen, branchY - branchLen * 0.8, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.65;
        }
        // top tip
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = cc.glow;
        ctx.beginPath();
        ctx.arc(0, -trunkH, 2.2, 0, Math.PI * 2);
        ctx.fill();

      } else if (formType === 1) {
        // Tube / column coral: a set of vertical cylinders
        const tubes = 2 + Math.floor(Math.random() * 4);
        for (let t = 0; t < tubes; t++) {
          const tx = (t - tubes / 2) * 5 + Math.random() * 3;
          const th = 8 + Math.random() * 18;
          ctx.fillStyle = cc.body;
          ctx.shadowColor = cc.glow;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.rect(tx - 1.5, -th, 3, th);
          ctx.fill();
          // glowing rim
          ctx.strokeStyle = cc.glow;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.rect(tx - 1.5, -th, 3, th);
          ctx.stroke();
          // opening circle at top
          ctx.fillStyle = cc.glow;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(tx, -th, 2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (formType === 2) {
        // Fan coral: arc of connected arcs
        const fanR = 10 + Math.random() * 15;
        const fanSpokes = 5 + Math.floor(Math.random() * 5);
        ctx.strokeStyle = cc.glow;
        ctx.lineWidth = 1;
        ctx.shadowColor = cc.glow;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.5;
        for (let s = 0; s <= fanSpokes; s++) {
          const a = Math.PI + (s / fanSpokes) * Math.PI;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(fanR * Math.cos(a), fanR * Math.sin(a));
          ctx.stroke();
        }
        // arc connecting the tips
        ctx.beginPath();
        ctx.arc(0, 0, fanR, Math.PI, Math.PI * 2);
        ctx.stroke();

      } else {
        // Mound / bubble coral: a cluster of glowing circles
        const moundCount = 4 + Math.floor(Math.random() * 6);
        for (let m = 0; m < moundCount; m++) {
          const mx = (Math.random() - 0.5) * 18;
          const my = (Math.random() - 0.5) * 8;
          const mr = 2.5 + Math.random() * 3.5;
          ctx.fillStyle = cc.body;
          ctx.shadowColor = cc.glow;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.arc(mx, my, mr, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = cc.glow;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(mx, my, mr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Large dark rocks
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 5 + Math.random() * 10;
      ctx.fillStyle = `rgba(${10 + Math.random() * 12},${16 + Math.random() * 12},${28 + Math.random() * 14},0.92)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }

  // ─── Stage 1 layer creators ────────────────────────────────────────────────

  private initBubbles(): void {
    if (this.stageId === 2) {
      // Fewer, larger, blue-glowing bubbles
      for (let i = 0; i < 5; i++) {
        this.bubbles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          radius: 3 + Math.random() * 6,
          speed: 14 + Math.random() * 18,
        });
      }
      return;
    }
    if (this.stageId === 3) {
      // Murky greenish bubbles
      for (let i = 0; i < 6; i++) {
        this.bubbles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          radius: 2 + Math.random() * 4,
          speed: 18 + Math.random() * 25,
        });
      }
      return;
    }
    for (let i = 0; i < 8; i++) {
      this.bubbles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: 1 + Math.random() * 3,
        speed: 20 + Math.random() * 30,
      });
    }
  }

  update(dt: number, scrollSpeed: number): void {
    this.time += dt;
    this.offset1 = (this.offset1 + scrollSpeed * 0.3 * dt) % CANVAS_HEIGHT;
    this.offset2 = (this.offset2 + scrollSpeed * 0.6 * dt) % CANVAS_HEIGHT;
    this.offset3 = (this.offset3 + scrollSpeed * 1.0 * dt) % CANVAS_HEIGHT;

    for (const b of this.bubbles) {
      b.y -= b.speed * dt;
      if (b.y < -10) {
        b.y = CANVAS_HEIGHT + 10;
        b.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  private drawLayer(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, offset: number): void {
    const y = offset;
    ctx.drawImage(layer, 0, y - CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(layer, 0, y, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.drawLayer(ctx, this.layer1, this.offset1);
    this.drawLayer(ctx, this.layer2, this.offset2);
    this.drawLayer(ctx, this.layer3, this.offset3);

    if (this.stageId === 2) {
      this.renderStage2Water(ctx);
    } else if (this.stageId === 3) {
      this.renderStage3Water(ctx);
    } else {
      this.renderStage1Water(ctx);
    }
  }

  private renderStage1Water(ctx: CanvasRenderingContext2D): void {
    // Water tint – caribbean turquoise
    ctx.fillStyle = 'rgba(0, 140, 160, 0.28)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Turquoise gradient (sunlight from above)
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'rgba(0, 100, 140, 0.30)');
    gradient.addColorStop(0.5, 'rgba(0, 140, 150, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 80, 100, 0.04)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Caustics
    this.renderCaustics(ctx);

    // Bubbles
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const b of this.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      // Bubble shine
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
    }
  }

  private renderStage2Water(ctx: CanvasRenderingContext2D): void {
    // Dark deep-sea tint – reduced to simulate moonlight
    ctx.fillStyle = 'rgba(0, 25, 65, 0.32)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Deep gradient - lighter at top (moonlight), deeper at bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'rgba(5, 20, 55, 0.25)');
    gradient.addColorStop(0.6, 'rgba(0, 8, 28, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 4, 14, 0.04)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Moonlight shafts (thin pale rays from top)
    this.renderMoonlightShafts(ctx);

    // Bioluminescent blue-glowing bubbles
    for (const b of this.bubbles) {
      ctx.save();
      ctx.shadowColor = '#44aaff';
      ctx.shadowBlur = b.radius * 3;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(100,180,255,0.7)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Faint shine
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = 'rgba(200,230,255,0.8)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderMoonlightShafts(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 3; i++) {
      const t = this.time * 0.18 + i * 2.1;
      const cx = (Math.sin(t * 0.5) * 0.35 + 0.5) * CANVAS_WIDTH;
      const shaftW = 28 + Math.sin(t * 1.3) * 10;
      const shaftGrad = ctx.createLinearGradient(cx - shaftW, 0, cx + shaftW, 0);
      shaftGrad.addColorStop(0, 'transparent');
      shaftGrad.addColorStop(0.5, 'rgba(180, 220, 255, 0.9)');
      shaftGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shaftGrad;
      ctx.fillRect(cx - shaftW, 0, shaftW * 2, CANVAS_HEIGHT);
    }
    ctx.restore();
  }

  private renderStage3Water(ctx: CanvasRenderingContext2D): void {
    // Caribbean daytime hue with a slight toxic-green tint
    ctx.fillStyle = 'rgba(0, 150, 120, 0.22)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'rgba(0, 120, 100, 0.28)');
    gradient.addColorStop(0.5, 'rgba(0, 140, 90, 0.10)');
    gradient.addColorStop(1, 'rgba(0, 80, 60, 0.04)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.renderCaustics(ctx);

    // Murky green-tinged bubbles
    for (const b of this.bubbles) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = 'rgba(180,255,180,0.55)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ─── Stage 3 layer creators ────────────────────────────────────────────────

  private createLayer1_s3(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Sandy Caribbean base with slight grayish tinge (wasteland)
    ctx.fillStyle = '#d8c878';
    ctx.fillRect(0, 0, CANVAS_WIDTH, this.LAYER_HEIGHT);

    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light ? 'rgba(240,220,160,0.45)' : 'rgba(140,110,50,0.22)';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    // Subtle yellowish-green sickly tinge bands
    for (let y = 0; y < this.LAYER_HEIGHT; y += 50) {
      const alpha = (Math.sin(y * 0.06) + 1) * 0.025;
      ctx.fillStyle = `rgba(180,200,80,${alpha})`;
      ctx.fillRect(0, y, CANVAS_WIDTH, 22);
    }

    return c;
  }

  private createLayer2_s3(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Pebbles with nuclear sheen
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 2 + Math.random() * 5;
      const gray = Math.floor(90 + Math.random() * 70);
      ctx.fillStyle = `rgb(${gray},${gray + 10},${gray - 10})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sand ripples (same as stage 1 but slightly murkier)
    ctx.strokeStyle = 'rgba(160,140,70,0.22)';
    ctx.lineWidth = 1;
    for (let y = 30; y < this.LAYER_HEIGHT; y += 55 + Math.random() * 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < CANVAS_WIDTH; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
      }
      ctx.stroke();
    }

    // Toxic puddles / green stains
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const grd = ctx.createRadialGradient(x, y, 2, x, y, 18 + Math.random() * 12);
      grd.addColorStop(0, 'rgba(80,200,80,0.22)');
      grd.addColorStop(1, 'rgba(40,120,40,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(x, y, 20 + Math.random() * 14, 10 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scattered debris: broken pipes, screws
    for (let i = 0; i < 4; i++) {
      const x = 15 + Math.random() * (CANVAS_WIDTH - 30);
      const y = 15 + Math.random() * (this.LAYER_HEIGHT - 30);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      // Pipe segment
      ctx.fillStyle = 'rgba(120,120,110,0.55)';
      ctx.fillRect(-10, -3, 20, 6);
      ctx.strokeStyle = 'rgba(180,180,160,0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-10, -3, 20, 6);
      ctx.restore();
    }

    return c;
  }

  private createLayer3_s3(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = CANVAS_WIDTH;
    c.height = this.LAYER_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Dead/pale seaweed
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const baseY = Math.random() * this.LAYER_HEIGHT;
      ctx.strokeStyle = `rgba(${140 + Math.random() * 30},${140 + Math.random() * 20},${60 + Math.random() * 20},0.65)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      const height = 18 + Math.random() * 28;
      for (let seg = 0; seg < 5; seg++) {
        const sy = baseY - (seg / 5) * height;
        ctx.quadraticCurveTo(
          x + (seg % 2 === 0 ? 7 : -7), sy - height / 10,
          x + (seg % 2 === 0 ? 3 : -3), sy - height / 5,
        );
      }
      ctx.stroke();
    }

    // Rocks
    for (let i = 0; i < 7; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      const r = 4 + Math.random() * 7;
      ctx.fillStyle = `rgba(${75 + Math.random() * 35},${70 + Math.random() * 25},${55 + Math.random() * 18},0.88)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.75, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing radioactive pools on the sea floor
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * this.LAYER_HEIGHT;
      ctx.save();
      ctx.globalAlpha = 0.18;
      const pgrd = ctx.createRadialGradient(x, y, 2, x, y, 14);
      pgrd.addColorStop(0, 'rgba(0,255,80,0.7)');
      pgrd.addColorStop(1, 'rgba(0,180,40,0)');
      ctx.fillStyle = pgrd;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Half-buried skeletons (2-4 scattered); some wear a trucker's hat
    const skelCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < skelCount; i++) {
      const sx = 30 + Math.random() * (CANVAS_WIDTH - 60);
      const sy = 40 + Math.random() * (this.LAYER_HEIGHT - 60);
      const hasTruckerHat = Math.random() < 0.5;
      this.drawBuriedSkeleton(ctx, sx, sy, hasTruckerHat);
    }

    // Half-buried tires (1-3 scattered)
    const tireCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < tireCount; i++) {
      const tx = 25 + Math.random() * (CANVAS_WIDTH - 50);
      const ty = 30 + Math.random() * (this.LAYER_HEIGHT - 50);
      this.drawBuriedTire(ctx, tx, ty);
    }

    // Half-buried road signs (1-2 scattered)
    const signCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < signCount; i++) {
      const rx = 30 + Math.random() * (CANVAS_WIDTH - 60);
      const ry = 40 + Math.random() * (this.LAYER_HEIGHT - 60);
      const signType = Math.floor(Math.random() * 3); // 0=stop, 1=speed limit, 2=caution
      this.drawBuriedRoadSign(ctx, rx, ry, signType);
    }

    return c;
  }

  private drawBuriedSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, hasTruckerHat: boolean): void {
    const scale = 0.7 + Math.random() * 0.5;
    // Lay skeleton flat on the seafloor (horizontal), with slight random tilt variation
    const rotationDirection = Math.random() < 0.5 ? 1 : -1;
    const tilt = rotationDirection * (Math.PI / 2 + (Math.random() - 0.5) * 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.72;

    const boneColor = '#d4cdb0';
    const boneShadow = 'rgba(100,90,60,0.5)';

    // === LOWER BODY (drawn first so upper body renders on top) ===

    // Spine (full length from neck base down to pelvis)
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 24);
    ctx.stroke();

    // Pelvis / hip bar
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-15, 22);
    ctx.lineTo(15, 22);
    ctx.stroke();

    // Ilium arcs (pelvis wings)
    ctx.beginPath();
    ctx.arc(-11, 24, 9, -Math.PI * 0.75, 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, 24, 9, Math.PI - 0.25, Math.PI * 1.75);
    ctx.stroke();

    // Pubic arch
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 30, 6, 0, Math.PI);
    ctx.stroke();

    // Femurs (upper leg bones, slightly splayed outward)
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, 33);
    ctx.lineTo(-12, 55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 33);
    ctx.lineTo(12, 55);
    ctx.stroke();

    // Knee caps
    ctx.fillStyle = boneColor;
    ctx.beginPath(); ctx.arc(-12, 55, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 55, 3.5, 0, Math.PI * 2); ctx.fill();

    // Tibias (shin bones)
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 55);
    ctx.lineTo(-10, 73);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 55);
    ctx.lineTo(10, 73);
    ctx.stroke();

    // Fibulas (thin side bones alongside shin)
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, 57);
    ctx.lineTo(-12, 71);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, 57);
    ctx.lineTo(12, 71);
    ctx.stroke();

    // Feet (metatarsal fans)
    for (let toe = 0; toe < 4; toe++) {
      ctx.beginPath();
      ctx.moveTo(-10, 73);
      ctx.lineTo(-14 + toe * 3, 81);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 73);
      ctx.lineTo(8 + toe * 3, 81);
      ctx.stroke();
    }

    // === UPPER BODY ===

    // Clavicles / shoulder bones
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(14, -4);
    ctx.stroke();

    // Upper arm bones (angled out from shoulders)
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(-22, 10);
    ctx.moveTo(14, -4);
    ctx.lineTo(22, 10);
    ctx.stroke();

    // Forearm bones
    ctx.beginPath();
    ctx.moveTo(-22, 10);
    ctx.lineTo(-26, 24);
    ctx.moveTo(22, 10);
    ctx.lineTo(26, 24);
    ctx.stroke();

    // Hand / finger stubs
    ctx.lineWidth = 1.5;
    for (let digit = -1; digit <= 1; digit++) {
      ctx.beginPath();
      ctx.moveTo(-26, 24);
      ctx.lineTo(-26 + digit * 3, 31);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(26, 24);
      ctx.lineTo(26 + digit * 3, 31);
      ctx.stroke();
    }

    // Ribcage arcs (4 pairs of ribs)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = boneColor;
    for (let r = 0; r < 4; r++) {
      const ry2 = -2 + r * 4.5;
      const rw = 11 - r * 1.2;
      ctx.beginPath();
      ctx.arc(0, ry2, rw, -Math.PI * 0.7, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, ry2, rw, Math.PI, Math.PI * 1.7);
      ctx.stroke();
    }

    // Neck
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -14);
    ctx.stroke();

    // Skull
    ctx.fillStyle = boneColor;
    ctx.shadowColor = boneShadow;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.ellipse(0, -22, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Jaw (lower half of skull)
    ctx.fillStyle = '#c8c0a0';
    ctx.beginPath();
    ctx.ellipse(0, -16, 7, 5, 0, 0, Math.PI);
    ctx.fill();

    // Eye sockets
    ctx.fillStyle = 'rgba(40,30,20,0.85)';
    ctx.beginPath(); ctx.ellipse(-4, -23, 2.8, 3.2, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -23, 2.8, 3.2, 0.2, 0, Math.PI * 2); ctx.fill();

    // Nose cavity (small triangle)
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.lineTo(-1.5, -17);
    ctx.lineTo(1.5, -17);
    ctx.closePath();
    ctx.fill();

    // Teeth (3 small rectangles on jaw)
    ctx.fillStyle = '#e0d8bc';
    for (let t = -1; t <= 1; t++) {
      ctx.fillRect(t * 3 - 1, -15, 2, 3);
    }

    // Trucker hat (optional) – lies at the skull end of the horizontal skeleton
    if (hasTruckerHat) {
      // Brim
      ctx.fillStyle = '#cc4400';
      ctx.beginPath();
      ctx.ellipse(0, -33, 13, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cap body (flat-front trucker style)
      const hatGrd = ctx.createLinearGradient(-9, -44, 9, -33);
      hatGrd.addColorStop(0, '#dd5500');
      hatGrd.addColorStop(0.5, '#cc4400');
      hatGrd.addColorStop(1, '#aa3300');
      ctx.fillStyle = hatGrd;
      ctx.beginPath();
      ctx.moveTo(-9, -33);
      ctx.lineTo(-8, -44);
      ctx.lineTo(8, -44);
      ctx.lineTo(9, -33);
      ctx.closePath();
      ctx.fill();
      // Mesh side (right half - lighter)
      ctx.fillStyle = 'rgba(255,200,150,0.25)';
      ctx.beginPath();
      ctx.moveTo(0, -33);
      ctx.lineTo(1, -44);
      ctx.lineTo(8, -44);
      ctx.lineTo(9, -33);
      ctx.closePath();
      ctx.fill();
      // Hat button/top
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(0, -44, 2, 0, Math.PI * 2);
      ctx.fill();
      // Brim front overhang
      ctx.fillStyle = '#aa3300';
      ctx.beginPath();
      ctx.ellipse(-1, -33, 14, 2.5, -0.1, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBuriedTire(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const scale = 0.8 + Math.random() * 0.6;
    const tiltAngle = (Math.random() - 0.5) * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tiltAngle);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.68;

    // Sand burial: only top ~60% visible
    ctx.beginPath();
    ctx.rect(-22, -22, 44, 33);
    ctx.clip();

    // Outer tire ring
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Tire sidewall texture (tread lines)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ix = Math.cos(a) * 12;
      const iy = Math.sin(a) * 7;
      const ox = Math.cos(a) * 18;
      const oy = Math.sin(a) * 10;
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }

    // Rim (inner circle)
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rim spokes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 5);
      ctx.stroke();
    }

    // Rust/algae patches
    ctx.fillStyle = 'rgba(180,100,30,0.3)';
    ctx.beginPath();
    ctx.ellipse(-8, -4, 5, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBuriedRoadSign(ctx: CanvasRenderingContext2D, x: number, y: number, signType: number): void {
    const scale = 0.65 + Math.random() * 0.4;
    const lean = (Math.random() - 0.5) * 0.4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.7;

    // Post (partially buried – only top portion visible)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -30);
    ctx.stroke();

    if (signType === 0) {
      // STOP sign (octagon, red)
      const r = 14;
      ctx.fillStyle = '#cc1111';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
        const px = Math.cos(a) * r;
        const py = -38 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // STOP text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STOP', 0, -38);

    } else if (signType === 1) {
      // Speed limit sign (white rect with number)
      ctx.fillStyle = '#f0f0e8';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-12, -52, 24, 26);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPEED', 0, -46);
      ctx.fillText('LIMIT', 0, -40);
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#111';
      ctx.fillText('55', 0, -33);

    } else {
      // Caution/diamond sign (yellow)
      ctx.save();
      ctx.translate(0, -42);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f0c020';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.restore();
      // Exclamation mark
      ctx.fillStyle = '#333';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, -42);
    }

    ctx.restore();
  }

  private renderCaustics(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 6; i++) {
      const t = this.time * 0.5 + i * 1.1;
      const x = (Math.sin(t * 1.3) * 0.5 + 0.5) * CANVAS_WIDTH;
      const y = (Math.cos(t * 0.9) * 0.5 + 0.5) * CANVAS_HEIGHT;
      const rx = 30 + Math.sin(t * 2) * 15;
      const ry = 20 + Math.cos(t * 1.7) * 10;
      ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
