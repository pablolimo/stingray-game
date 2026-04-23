import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Game } from './game';
const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
// Scale canvas to fit window
function resize() {
    const scaleX = window.innerWidth / CANVAS_WIDTH;
    const scaleY = window.innerHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    canvas.style.width = `${CANVAS_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
}
resize();
window.addEventListener('resize', resize);
const game = new Game(canvas, ctx);
let lastTime = 0;
function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    game.update(dt);
    game.render();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
