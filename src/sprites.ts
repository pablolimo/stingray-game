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
    for (let x = 7; x <= 16; x++) px(ctx, body, x, 12 + wo);
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

export function createSquidSprites(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(18, 22);
    const ctx = c.getContext('2d')!;

    // Mantle – teardrop pointing upward
    ctx.fillStyle = 'rgba(155, 30, 75, 0.92)';
    ctx.beginPath();
    ctx.moveTo(9, 0); // tip
    ctx.bezierCurveTo(15, 1, 17, 6, 15, 11);
    ctx.lineTo(3, 11);
    ctx.bezierCurveTo(1, 6, 3, 1, 9, 0);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(220, 80, 140, 0.55)';
    ctx.beginPath();
    ctx.ellipse(9, 5, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffe000';
    ctx.beginPath();
    ctx.arc(6, 9, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, 9, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(6, 9, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, 9, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Tentacles (8), alternating long/short with frame offset for animation
    ctx.strokeStyle = 'rgba(130, 20, 65, 0.9)';
    ctx.lineWidth = 1;
    const tentXs = [2, 4, 6, 8, 10, 12, 14, 16];
    for (let i = 0; i < tentXs.length; i++) {
      const long = i % 2 === 0;
      const waveDelta = f === 0 ? (long ? 1 : 0) : (long ? 0 : 1);
      ctx.beginPath();
      ctx.moveTo(tentXs[i], 11);
      ctx.lineTo(tentXs[i] + (i < 4 ? -waveDelta : waveDelta), long ? 21 : 17 - waveDelta);
      ctx.stroke();
    }

    frames.push(c);
  }
  return frames;
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

export function createHarpoonSprite(): HTMLCanvasElement {
  const c = makeCanvas(6, 20);
  const ctx = c.getContext('2d')!;

  // Shaft
  ctx.fillStyle = '#c0c0c0';
  for (let y = 4; y < 18; y++) {
    px(ctx, '#c0c0c0', 2, y);
    px(ctx, '#c0c0c0', 3, y);
  }
  // Tip
  px(ctx, '#e0e0e0', 2, 2);
  px(ctx, '#e0e0e0', 3, 2);
  px(ctx, '#e8e8e8', 2, 1);
  px(ctx, '#e8e8e8', 3, 1);
  px(ctx, '#ffffff', 2, 0);
  px(ctx, '#ffffff', 3, 0);
  // Barb
  px(ctx, '#a0a0a0', 1, 5);
  px(ctx, '#a0a0a0', 4, 5);
  px(ctx, '#a0a0a0', 0, 6);
  px(ctx, '#a0a0a0', 5, 6);
  // Tail fins
  px(ctx, '#808080', 1, 17);
  px(ctx, '#808080', 4, 17);
  px(ctx, '#808080', 0, 18);
  px(ctx, '#808080', 5, 18);
  px(ctx, '#808080', 0, 19);
  px(ctx, '#808080', 5, 19);

  return c;
}

export function createScubaKittenSprites(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(44, 50);
    const ctx = c.getContext('2d')!;

    // --- Air tanks (behind body) – left and right ---
    ctx.fillStyle = '#4a90d9';
    ctx.beginPath();
    ctx.roundRect(6, 18, 8, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#2a6ab0';
    ctx.beginPath();
    ctx.roundRect(30, 18, 8, 18, 3);
    ctx.fill();
    // Tank valves
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(9, 16, 2, 3);
    ctx.fillRect(33, 16, 2, 3);

    // --- Body / diving suit ---
    ctx.fillStyle = '#2d6e8a';
    ctx.beginPath();
    ctx.roundRect(12, 22, 20, 20, 4);
    ctx.fill();
    // Suit highlight
    ctx.fillStyle = '#3e8fb0';
    ctx.beginPath();
    ctx.roundRect(15, 24, 8, 14, 3);
    ctx.fill();

    // --- Head (black cat) ---
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(22, 16, 11, 0, Math.PI * 2);
    ctx.fill();

    // --- Ears (black cat) ---
    ctx.fillStyle = '#1a1a1a';
    // left ear
    ctx.beginPath();
    ctx.moveTo(12, 8); ctx.lineTo(15, 2); ctx.lineTo(18, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(13, 8); ctx.lineTo(15, 4); ctx.lineTo(17, 8);
    ctx.closePath(); ctx.fill();
    // right ear
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(26, 8); ctx.lineTo(29, 2); ctx.lineTo(32, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(27, 8); ctx.lineTo(29, 4); ctx.lineTo(31, 8);
    ctx.closePath(); ctx.fill();

    // --- Scuba mask / goggles ---
    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath();
    ctx.roundRect(13, 12, 18, 9, 3);
    ctx.fill();
    // Lenses
    ctx.fillStyle = '#88ddf0';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(18, 16, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(26, 16, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Mask strap
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(13, 16); ctx.lineTo(10, 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(31, 16); ctx.lineTo(34, 16);
    ctx.stroke();

    // Green eyes (pupils inside goggles)
    ctx.fillStyle = '#00cc44';
    ctx.beginPath();
    ctx.arc(18, 16, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(26, 16, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Bright green highlight
    ctx.fillStyle = '#66ff99';
    ctx.beginPath();
    ctx.arc(17.5, 15.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25.5, 15.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // --- Whiskers (white for black cat) ---
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.8;
    // left whiskers
    ctx.beginPath(); ctx.moveTo(14, 22); ctx.lineTo(7, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, 23); ctx.lineTo(7, 23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, 24); ctx.lineTo(7, 26); ctx.stroke();
    // right whiskers
    ctx.beginPath(); ctx.moveTo(30, 22); ctx.lineTo(37, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 23); ctx.lineTo(37, 23); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 24); ctx.lineTo(37, 26); ctx.stroke();

    // --- Nose & mouth ---
    ctx.fillStyle = '#d96060';
    ctx.beginPath();
    ctx.arc(22, 22, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // --- Harpoon gun arm ---
    ctx.fillStyle = '#2d6e8a';
    ctx.beginPath();
    ctx.roundRect(32, 28, 6, 4, 2);
    ctx.fill();
    // Harpoon gun barrel
    ctx.fillStyle = '#444';
    ctx.fillRect(36, 29, 7, 2);

    // --- Flippers – alternating kick (frame 0: left down / right up, frame 1: left up / right down) ---
    ctx.fillStyle = '#1a8a5a';
    if (f === 0) {
      // Left flipper kicks down
      ctx.beginPath();
      ctx.ellipse(15, 46, 8, 3, -0.7, 0, Math.PI * 2);
      ctx.fill();
      // Right flipper kicks up
      ctx.beginPath();
      ctx.ellipse(29, 40, 8, 3, 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Left flipper kicks up
      ctx.beginPath();
      ctx.ellipse(15, 40, 8, 3, 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Right flipper kicks down
      ctx.beginPath();
      ctx.ellipse(29, 46, 8, 3, -0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Bubbles rising from both tank valves ---
    ctx.strokeStyle = 'rgba(140,220,255,0.75)';
    ctx.lineWidth = 0.8;
    // Left tank bubbles
    const leftBubbleXs = [10, 9, 11];
    const leftBubbleYs = [13, 8, 4];
    const leftBubbleSizes = [1.8, 1.4, 1.0];
    for (let i = 0; i < 3; i++) {
      const yShift = f === 0 ? 0 : 1;
      ctx.fillStyle = 'rgba(140,220,255,0.65)';
      ctx.beginPath();
      ctx.arc(leftBubbleXs[i], leftBubbleYs[i] - yShift, leftBubbleSizes[i], 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(leftBubbleXs[i], leftBubbleYs[i] - yShift, leftBubbleSizes[i], 0, Math.PI * 2);
      ctx.stroke();
    }
    // Right tank bubbles
    const rightBubbleXs = [34, 33, 35];
    const rightBubbleYs = [13, 8, 4];
    const rightBubbleSizes = [1.8, 1.4, 1.0];
    for (let i = 0; i < 3; i++) {
      const yShift = f === 0 ? 1 : 0;
      ctx.fillStyle = 'rgba(140,220,255,0.65)';
      ctx.beginPath();
      ctx.arc(rightBubbleXs[i], rightBubbleYs[i] - yShift, rightBubbleSizes[i], 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightBubbleXs[i], rightBubbleYs[i] - yShift, rightBubbleSizes[i], 0, Math.PI * 2);
      ctx.stroke();
    }

    frames.push(c);
  }
  return frames;
}

export function createGoldenCoinSprite(): HTMLCanvasElement {
  const c = makeCanvas(20, 20);
  const ctx = c.getContext('2d')!;

  // Outer gold disc
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(10, 10, 9, 0, Math.PI * 2);
  ctx.fill();

  // Dark gold rim
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(10, 10, 8.5, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = '#daa520';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(10, 10, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Dollar sign
  ctx.fillStyle = '#8b6914';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 10, 11);

  // Shine highlight
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.arc(7, 7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  return c;
}
