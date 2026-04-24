import { Fish } from './entities/fish';
import { Starfish } from './entities/starfish';
import { Jellyfish } from './entities/jellyfish';
import { Shark } from './entities/shark';
import { TreasureChest } from './entities/treasure';
import { PowerupChest } from './entities/powerupchest';
import { RedTreasure } from './entities/redtreasure';
import { CANVAS_WIDTH } from './constants';
import { Entity } from './types';

export class Spawner {
  private time: number = 0;
  private fishTimer: number = 0;
  private starfishTimer: number = 0;
  private jellyfishTimer: number = 0;
  private sharkTimer: number = 0;
  private treasureTimer: number = 0;
  private shinyChestTimer: number = 0;
  private redTreasureTimer: number = 0;

  update(dt: number, _scrollSpeed: number, playerX: number): Entity[] {
    this.time += dt;
    const spawned: Entity[] = [];

    // Difficulty multiplier
    const diff = Math.min(this.time / 60, 1); // 0 to 1 over 60 seconds

    // Fish: starts at 2s interval, decreases to 0.8s
    const fishInterval = 2.0 - diff * 1.2;
    this.fishTimer += dt;
    if (this.fishTimer >= fishInterval) {
      this.fishTimer -= fishInterval;
      const count = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        const variant = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        spawned.push(new Fish(x, -20, variant));
      }
    }

    // Starfish: every 5s decreasing to 3s
    const starfishInterval = 5.0 - diff * 2.0;
    this.starfishTimer += dt;
    if (this.starfishTimer >= starfishInterval) {
      this.starfishTimer -= starfishInterval;
      const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
      spawned.push(new Starfish(x, -20));
    }

    // Jellyfish: start at 4s, decrease to 1.5s
    const jellyfishInterval = 4.0 - diff * 2.5;
    this.jellyfishTimer += dt;
    if (this.jellyfishTimer >= jellyfishInterval) {
      this.jellyfishTimer -= jellyfishInterval;
      const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
      spawned.push(new Jellyfish(x, -30));
    }

    // Shark: start at 10s, decrease to 4s
    const sharkInterval = 10.0 - diff * 6.0;
    this.sharkTimer += dt;
    if (this.sharkTimer >= sharkInterval) {
      this.sharkTimer -= sharkInterval;
      const x = Math.random() * CANVAS_WIDTH;
      spawned.push(new Shark(x, -20, playerX));
    }

    // Treasure chests: every 12s decreasing to 7s
    const treasureInterval = 12.0 - diff * 5.0;
    this.treasureTimer += dt;
    if (this.treasureTimer >= treasureInterval) {
      this.treasureTimer -= treasureInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(new TreasureChest(x, -30));
    }

    // Shiny powerup chests: every 30s decreasing to 20s
    const shinyInterval = 30.0 - diff * 10.0;
    this.shinyChestTimer += dt;
    if (this.shinyChestTimer >= shinyInterval) {
      this.shinyChestTimer -= shinyInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(new PowerupChest(x, -30));
    }

    // Red treasure: every 40s decreasing to 25s
    const redTreasureInterval = 40.0 - diff * 15.0;
    this.redTreasureTimer += dt;
    if (this.redTreasureTimer >= redTreasureInterval) {
      this.redTreasureTimer -= redTreasureInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(new RedTreasure(x, -30));
    }

    return spawned;
  }

  reset(): void {
    this.time = 0;
    this.fishTimer = 0;
    this.starfishTimer = 0;
    this.jellyfishTimer = 0;
    this.sharkTimer = 0;
    this.treasureTimer = 0;
    this.shinyChestTimer = 0;
    this.redTreasureTimer = 0;
  }
}
