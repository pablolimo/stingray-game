function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, size = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

export function createStingraySprites(): HTMLCanvasElement[] {
  // 3 frames of 24x24
  const frames: HTMLCanvasElement[] = [];
  
  const body = '#2a4a6b';
  const wing = '#1a3a5a';
  const belly = '#3a6a8b';
  const tail = '#1a2a3b';
  const eye = '#000000';
  const highlight = '#4a8ab0';

  // Wing offsets for flap animation: [0, -1, -2] for y offset of wing tips
  const wingOffsets = [0, -1, -2];

  for (let f = 0; f < 3; f++) {
    const c = makeCanvas(24, 24);
    const ctx = c.getContext('2d')!;
    const wo = wingOffsets[f];

    // Draw stingray top-down
    // Tail
    for (let i = 0; i < 7; i++) {
      px(ctx, tail, 11, 16 + i);
      px(ctx, tail, 12, 16 + i);
    }
    // Body center column
    for (let y = 4; y < 17; y++) {
      px(ctx, belly, 11, y);
      px(ctx, belly, 12, y);
    }
    // Body shape - diamond
    // Row 4: 2px
    px(ctx, body, 11, 4); px(ctx, body, 12, 4);
    // Row 5: 4px
    for (let x = 10; x <= 13; x++) px(ctx, body, x, 5);
    // Row 6: 6px
    for (let x = 9; x <= 14; x++) px(ctx, body, x, 6);
    // Row 7: 8px
    for (let x = 8; x <= 15; x++) px(ctx, body, x, 7);
    // Row 8: 10px
    for (let x = 7; x <= 16; x++) px(ctx, body, x, 8);
    // Row 9: 12px (widest)
    for (let x = 6; x <= 17; x++) px(ctx, body, x, 9);
    // Row 10: 14px
    for (let x = 5; x <= 18; x++) px(ctx, body, x, 10);
    // Row 11: 16px (max width with wings)
    for (let x = 4; x <= 19; x++) px(ctx, wing, x, 11);
    for (let x = 6; x <= 17; x++) px(ctx, body, x, 11);
    // Row 12: wings narrowing
    for (let x = 3; x <= 20; x++) px(ctx, wing, x, 12 + wo);
    for (let x = 7; x <= 16; x++) px(ctx, body, x, 12);
    // Row 13: 
    for (let x = 4; x <= 19; x++) px(ctx, wing, x, 13);
    for (let x = 8; x <= 15; x++) px(ctx, body, x, 13);
    // Row 14:
    for (let x = 5; x <= 18; x++) px(ctx, wing, x, 14);
    for (let x = 9; x <= 14; x++) px(ctx, body, x, 14);
    // Row 15:
    for (let x = 7; x <= 16; x++) px(ctx, body, x, 15);
    // Row 16 (body narrows to tail)
    for (let x = 9; x <= 14; x++) px(ctx, body, x, 16);
    for (let x = 10; x <= 13; x++) px(ctx, body, x, 17);
    for (let x = 11; x <= 12; x++) px(ctx, body, x, 18);

    // Eyes
    px(ctx, eye, 10, 8);
    px(ctx, eye, 13, 8);
    // Highlight on body center
    px(ctx, highlight, 11, 7);
    px(ctx, highlight, 12, 7);
    px(ctx, highlight, 11, 6);

    frames.push(c);
  }
  return frames;
}

export function createFishSprites(): HTMLCanvasElement[][] {
  // 3 color variants, 2 frames each
  const colorSets = [
    { body: '#f4721a', fin: '#d4521a', belly: '#f9a23a', eye: '#111' },
    { body: '#f4d03f', fin: '#d4b01f', belly: '#f9e07a', eye: '#111' },
    { body: '#2196f3', fin: '#1565c0', belly: '#64b5f6', eye: '#111' },
  ];

  const result: HTMLCanvasElement[][] = [];
  for (const colors of colorSets) {
    const frames: HTMLCanvasElement[] = [];
    for (let f = 0; f < 2; f++) {
      const c = makeCanvas(12, 8);
      const ctx = c.getContext('2d')!;
      // Fish body rows
      const body = colors.body;
      const fin = colors.fin;
      const belly = colors.belly;
      // Row 0: tail fin
      px(ctx, fin, 0, 1); px(ctx, fin, 0, 2); px(ctx, fin, 0, 3); px(ctx, fin, 0, 4); px(ctx, fin, 0, 5);
      if (f === 0) {
        px(ctx, fin, 1, 0); px(ctx, fin, 1, 6);
      } else {
        px(ctx, fin, 1, 1); px(ctx, fin, 1, 5);
      }
      // Body
      for (let y = 1; y <= 5; y++) {
        for (let x = 2; x <= 9; x++) {
          px(ctx, body, x, y);
        }
      }
      // Belly highlight
      for (let x = 3; x <= 8; x++) {
        px(ctx, belly, x, 3);
      }
      // Head
      for (let y = 2; y <= 4; y++) {
        px(ctx, body, 10, y);
        px(ctx, body, 11, y);
      }
      // Eye
      px(ctx, colors.eye, 9, 2);
      frames.push(c);
    }
    result.push(frames);
  }
  return result;
}

export function createStarfishSprite(): HTMLCanvasElement {
  const c = makeCanvas(16, 16);
  const ctx = c.getContext('2d')!;
  const color1 = '#e8612a';
  const color2 = '#f48942';

  ctx.fillStyle = color1;
  // Draw 5-pointed star using canvas path
  ctx.beginPath();
  const cx = 8, cy = 8, outerR = 7, innerR = 3;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI / 5) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color2;
  ctx.beginPath();
  const innerCx = 8, innerCy = 8;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI / 5) - Math.PI / 2;
    const r = i % 2 === 0 ? 4 : 2;
    const x = innerCx + r * Math.cos(angle);
    const y = innerCy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  return c;
}

export function createJellyfishSprites(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(16, 20);
    const ctx = c.getContext('2d')!;
    const bellWidth = f === 0 ? 14 : 12;
    const bellHeight = f === 0 ? 9 : 11;

    // Bell
    ctx.fillStyle = 'rgba(200, 100, 200, 0.8)';
    ctx.beginPath();
    ctx.ellipse(8, bellHeight / 2, bellWidth / 2, bellHeight / 2, 0, Math.PI, 0, true);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(240, 180, 240, 0.5)';
    ctx.beginPath();
    ctx.ellipse(8, bellHeight / 2, bellWidth / 4, bellHeight / 3, 0, Math.PI, 0, true);
    ctx.fill();

    // Tentacles
    ctx.strokeStyle = 'rgba(180, 80, 200, 0.7)';
    ctx.lineWidth = 1;
    const tentacleX = [4, 6, 8, 10, 12];
    for (const tx of tentacleX) {
      ctx.beginPath();
      ctx.moveTo(tx, bellHeight);
      ctx.lineTo(tx + (f === 0 ? 1 : -1), bellHeight + 5);
      ctx.lineTo(tx, bellHeight + 10);
      ctx.stroke();
    }

    frames.push(c);
  }
  return frames;
}

export function createSharkSprite(): HTMLCanvasElement {
  const c = makeCanvas(20, 12);
  const ctx = c.getContext('2d')!;
  const gray = '#708090';
  const darkGray = '#536878';
  const belly = '#b0c0d0';

  // Body - elongated oval
  ctx.fillStyle = gray;
  ctx.beginPath();
  ctx.ellipse(10, 6, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(10, 6, 7, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal fin (top center)
  ctx.fillStyle = darkGray;
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(13, 0);
  ctx.lineTo(15, 3);
  ctx.lineTo(10, 4);
  ctx.closePath();
  ctx.fill();

  // Tail fin
  ctx.fillStyle = darkGray;
  ctx.beginPath();
  ctx.moveTo(1, 6);
  ctx.lineTo(-1, 2);
  ctx.lineTo(3, 5);
  ctx.lineTo(3, 7);
  ctx.lineTo(-1, 10);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#000';
  ctx.fillRect(15, 5, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(15, 5, 1, 1);

  return c;
}

export function createHeartSprite(): HTMLCanvasElement {
  const c = makeCanvas(8, 8);
  const ctx = c.getContext('2d')!;
  const red = '#e74c3c';
  // Heart pixel art 8x8
  const heart = [
    '........',
    '.##.##..',
    '########',
    '########',
    '.######.',
    '..####..',
    '...##...',
    '........',
  ];
  for (let y = 0; y < heart.length; y++) {
    for (let x = 0; x < heart[y].length; x++) {
      if (heart[y][x] === '#') {
        ctx.fillStyle = red;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return c;
}
