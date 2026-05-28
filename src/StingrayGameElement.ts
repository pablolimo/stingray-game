import { Game } from './game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export interface StagePassParams {
  lives: number;
  score: number;
  goldCoins: number;
}

export interface GameOverParams {
  score: number;
  goldCoins: number;
}

export interface StartGameParams {
  lives: number;
}

/**
 * StingrayGameElement — embeddable game instance.
 *
 * Usage:
 *   const game = new StingrayGameElement();
 *   document.getElementById('container')!.appendChild(game.element);
 *   game.startGame({ lives: 3 });
 */
export class StingrayGameElement {
  private _container: HTMLDivElement;
  private _canvas: HTMLCanvasElement;
  private _game: Game;
  private _animId: number = 0;
  private _lastTime: number = 0;

  constructor() {
    this._container = document.createElement('div');
    this._container.style.cssText = 'position:relative;display:inline-block;';

    this._canvas = document.createElement('canvas');
    this._canvas.width = CANVAS_WIDTH;
    this._canvas.height = CANVAS_HEIGHT;
    this._canvas.style.cssText = 'image-rendering:pixelated;image-rendering:crisp-edges;display:block;';

    const ctx = this._canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    this._container.appendChild(this._canvas);
    this._game = new Game(this._canvas, ctx);

    this._startLoop();
  }

  /** The root DOM element — append this to any container. */
  get element(): HTMLDivElement {
    return this._container;
  }

  /**
   * Switch to a different stage without starting the game.
   * The game will remain on the title screen for the chosen stage.
   */
  setStage(stage: number): void {
    this._game.setStage(stage);
  }

  /**
   * Start (or restart) the game.
   * @param params.lives — number of hearts the stingray begins with (defaults to 4)
   */
  startGame(params?: StartGameParams): void {
    this._game.startGame(params);
  }

  /**
   * Register a callback fired when the player clears a stage.
   * @param callback receives { lives, score, goldCoins }
   */
  onStagePass(callback: (params: StagePassParams) => void): void {
    this._game.setOnStageClearCallback(callback);
  }

  /**
   * Register a callback fired when the player loses.
   * @param callback receives { score, goldCoins }
   */
  onGameOver(callback: (params: GameOverParams) => void): void {
    this._game.setOnGameOverCallback(callback);
  }

  /** Stop the animation loop and remove the element from the DOM. */
  destroy(): void {
    cancelAnimationFrame(this._animId);
    this._container.remove();
  }

  private _startLoop(): void {
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
      this._lastTime = timestamp;
      this._game.update(dt);
      this._game.render();
      this._animId = requestAnimationFrame(loop);
    };
    this._animId = requestAnimationFrame(loop);
  }
}
