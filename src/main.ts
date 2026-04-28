import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Game } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

// Scale canvas to fit window
function resize() {
  const scaleX = window.innerWidth / CANVAS_WIDTH;
  const scaleY = (window.innerHeight - 44) / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = `${CANVAS_WIDTH * scale}px`;
  canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
}
resize();
window.addEventListener('resize', resize);

const game = new Game(canvas, ctx);

// Stage selector buttons
const stageBtn1 = document.getElementById('stage-btn-1') as HTMLButtonElement;
const stageBtn2 = document.getElementById('stage-btn-2') as HTMLButtonElement;

function setActiveStageButton(id: number): void {
  stageBtn1.classList.toggle('active', id === 1);
  stageBtn2.classList.toggle('active', id === 2);
}

stageBtn1.addEventListener('click', () => {
  game.setStage(1);
  setActiveStageButton(1);
});
stageBtn2.addEventListener('click', () => {
  game.setStage(2);
  setActiveStageButton(2);
});

let lastTime = 0;
function loop(timestamp: number) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  game.update(dt);
  game.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
