import { StageSpawnConfig } from './stages/stageDefinition';
import { CANVAS_WIDTH } from './constants';
import { Entity } from './types';

export class Spawner {
  private config: StageSpawnConfig;
  private time: number = 0;
  private fishTimer: number = 0;
  private starfishTimer: number = 0;
  private jellyfishTimer: number = 0;
  private sharkTimer: number = 0;
  private treasureTimer: number = 0;
  private shinyChestTimer: number = 0;
  private redTreasureTimer: number = 0;
  private squidTimer: number = 0;
  private squidInterval: number = 8.0 + Math.random() * 4.0;
  private kittenTimer: number = 0;
  private kittenInterval: number = 10.0 + Math.random() * 5.0;
  private glowingClamTimer: number = 0;
  private coinTimer: number = 0;
  private coinInterval: number = 12.0 + Math.random() * 6.0;
  // Stage 3 optional timers
  private obstacleTimer: number = 0;
  private obstacleInterval: number = 8.0 + Math.random() * 5.0;
  private hazardTimer: number = 0;
  private hazardInterval: number = 15.0 + Math.random() * 8.0;
  private speedBoostTimer: number = 0;
  private speedBoostInterval: number = 25.0 + Math.random() * 15.0;

  constructor(config: StageSpawnConfig) {
    this.config = config;
  }

  update(dt: number, _scrollSpeed: number, playerX: number, level: number = 1): Entity[] {
    this.time += dt;
    const spawned: Entity[] = [];

    // Difficulty multiplier
    const diff = Math.min(this.time / 60, 1); // 0 to 1 over 60 seconds

    // Food: stage 3 uses sardine school groups; others use regular fish
    const fishInterval = 2.0 - diff * 1.2;
    this.fishTimer += dt;
    if (this.fishTimer >= fishInterval) {
      this.fishTimer -= fishInterval;
      if (this.config.createFoodGroup) {
        // Sardine school – spawn as a group
        const school = this.config.createFoodGroup(30 + Math.random() * (CANVAS_WIDTH - 60), -20);
        spawned.push(...school);
      } else {
        const count = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
          spawned.push(this.config.createFood(x, -20));
        }
      }
    }

    // Starfish: every 5s decreasing to 3s
    const starfishInterval = 5.0 - diff * 2.0;
    this.starfishTimer += dt;
    if (this.starfishTimer >= starfishInterval) {
      this.starfishTimer -= starfishInterval;
      const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
      spawned.push(this.config.createBonusFood(x, -20));
    }

    // Jellyfish: start at 4s, decrease to 1.5s; level 2 = 1.5x speed, level 3 = faster & erratic + 2x spawn
    const jellyfishInterval = 4.0 - diff * 2.5;
    const jellyfishSpeed = level >= 2 ? 1.5 : 1.0;
    const jellyfishCount = level >= 3 ? 2 : 1;
    this.jellyfishTimer += dt;
    if (this.jellyfishTimer >= jellyfishInterval) {
      this.jellyfishTimer -= jellyfishInterval;
      for (let j = 0; j < jellyfishCount; j++) {
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        spawned.push(this.config.createSmallEnemy(x, -30, jellyfishSpeed, level));
      }
    }

    // Shark: start at 10s, decrease to 4s
    const sharkInterval = level >= 3 ? Math.max(4.0, 8.0 - diff * 4.0) : 10.0 - diff * 6.0;
    this.sharkTimer += dt;
    if (this.sharkTimer >= sharkInterval) {
      this.sharkTimer -= sharkInterval;
      const x = Math.random() * CANVAS_WIDTH;
      spawned.push(this.config.createBigEnemy(x, -20, playerX, level));
    }

    // Treasure chests: every 12s decreasing to 7s
    const treasureInterval = 12.0 - diff * 5.0;
    this.treasureTimer += dt;
    if (this.treasureTimer >= treasureInterval) {
      this.treasureTimer -= treasureInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(this.config.createTreasure(x, -30));
    }

    // Shiny powerup chests: every 30s decreasing to 20s
    const shinyInterval = 30.0 - diff * 10.0;
    this.shinyChestTimer += dt;
    if (this.shinyChestTimer >= shinyInterval) {
      this.shinyChestTimer -= shinyInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(this.config.createPowerupChest(x, -30));
    }

    // Red treasure: every 40s decreasing to 25s; level 3+ spawns twice as fast
    const redTreasureInterval = (40.0 - diff * 15.0) / (level >= 3 ? 2 : 1);
    this.redTreasureTimer += dt;
    if (this.redTreasureTimer >= redTreasureInterval) {
      this.redTreasureTimer -= redTreasureInterval;
      const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
      spawned.push(this.config.createRedTreasure(x, -30));
    }

    // Squid: level 2+, every 8-12s
    if (level >= 2) {
      this.squidTimer += dt;
      if (this.squidTimer >= this.squidInterval) {
        this.squidTimer = 0;
        this.squidInterval = 8.0 + Math.random() * 4.0;
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        spawned.push(this.config.createMediumEnemy(x, -30, playerX));
      }

      // Glowing clam: every glowingClamInterval (default 30s, stage 3 uses shorter)
      const clamInterval = this.config.glowingClamInterval ?? 30.0;
      this.glowingClamTimer += dt;
      if (this.glowingClamTimer >= clamInterval) {
        this.glowingClamTimer = 0;
        const x = 50 + Math.random() * (CANVAS_WIDTH - 100);
        spawned.push(this.config.createGlowingClam(x, -40));
      }
    }

    // Scuba kitten/eel: level 3 only, every 10-15s
    if (level >= 3) {
      this.kittenTimer += dt;
      if (this.kittenTimer >= this.kittenInterval) {
        this.kittenTimer = 0;
        this.kittenInterval = 10.0 + Math.random() * 5.0;
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        spawned.push(this.config.createLevel3Enemy(x, -30, playerX, 400));
      }
    }

    // Golden coins: all levels, every ~12-18s (spawn 2-3 at a time)
    this.coinTimer += dt;
    if (this.coinTimer >= this.coinInterval) {
      this.coinTimer = 0;
      this.coinInterval = 12.0 + Math.random() * 6.0;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
        spawned.push(this.config.createCoin(x, -30 - i * 30));
      }
    }

    // Floating bombs (stage 3 obstacle): all levels, random interval
    if (this.config.createObstacle) {
      this.obstacleTimer += dt;
      if (this.obstacleTimer >= this.obstacleInterval) {
        this.obstacleTimer = 0;
        this.obstacleInterval = 7.0 + Math.random() * 6.0;
        const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        spawned.push(this.config.createObstacle(x, -30));
      }
    }

    // Radioactive barrels (stage 3 hazard): all levels, random interval
    if (this.config.createHazard) {
      this.hazardTimer += dt;
      if (this.hazardTimer >= this.hazardInterval) {
        this.hazardTimer = 0;
        this.hazardInterval = 14.0 + Math.random() * 8.0;
        const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        spawned.push(this.config.createHazard(x, -40));
      }
    }

    // Speed boost (stage 3, level 2+): every ~25-40s
    if (this.config.createSpeedBoost && level >= 2) {
      this.speedBoostTimer += dt;
      if (this.speedBoostTimer >= this.speedBoostInterval) {
        this.speedBoostTimer = 0;
        this.speedBoostInterval = 25.0 + Math.random() * 15.0;
        const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
        spawned.push(this.config.createSpeedBoost(x, -40));
      }
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
    this.squidTimer = 0;
    this.squidInterval = 8.0 + Math.random() * 4.0;
    this.kittenTimer = 0;
    this.kittenInterval = 10.0 + Math.random() * 5.0;
    this.glowingClamTimer = 0;
    this.coinTimer = 0;
    this.coinInterval = 12.0 + Math.random() * 6.0;
    this.obstacleTimer = 0;
    this.obstacleInterval = 8.0 + Math.random() * 5.0;
    this.hazardTimer = 0;
    this.hazardInterval = 15.0 + Math.random() * 8.0;
    this.speedBoostTimer = 0;
    this.speedBoostInterval = 25.0 + Math.random() * 15.0;
  }
}
