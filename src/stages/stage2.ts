import { SeaSnake } from '../entities/stage2/seasnake';
import { SeaTurtle } from '../entities/stage2/seaturtle';
import { SeaMonkey } from '../entities/stage2/seamonkey';
import { BioFish } from '../entities/stage2/biofish';
import { Krill } from '../entities/stage2/krill';
import { Shrimp } from '../entities/stage2/shrimp';
import { MoonJellyfish } from '../entities/stage2/moonjellyfish';
import { WhiteChest } from '../entities/stage2/whitechest';
import { Squid } from '../entities/squid';
import { RedTreasure } from '../entities/redtreasure';
import { GlowingClam } from '../entities/glowingclam';
import { GoldenCoin } from '../entities/goldencoin';
import { TreasureChest } from '../entities/treasure';
import { MermaidBoss } from '../entities/stage2/mermaidboss';
import { StageDefinition } from './stageDefinition';

export const stage2Definition: StageDefinition = {
  id: 2,
  name: 'Stage 2: Midnight Deep',
  backgroundStageId: 2,
  spawnConfig: {
    createSmallEnemy: (x, y, speedMult, level) => new SeaSnake(x, y, speedMult, level),
    createBigEnemy: (x, y, targetX, level) => new SeaTurtle(x, y, targetX, level),
    createMediumEnemy: (x, y, targetX) => new Squid(x, y, targetX),
    createLevel3Enemy: (x, y, targetX, targetY) => new SeaMonkey(x, y, targetX, targetY),
    createFood: (x, y) => {
      const r = Math.random();
      if (r < 0.25) return new MoonJellyfish(x, y);
      if (r < 0.5)  return new Shrimp(x, y);
      return new BioFish(x, y);
    },
    createBonusFood: (x, y) => new Krill(x, y),
    createTreasure: (x, y) => new TreasureChest(x, y),
    createPowerupChest: (x, y) => new WhiteChest(x, y),
    createRedTreasure: (x, y) => new RedTreasure(x, y),
    createGlowingClam: (x, y) => new GlowingClam(x, y),
    createCoin: (x, y) => new GoldenCoin(x, y),
  },
  createBoss: (x, startY) => new MermaidBoss(x, startY),
  bossName: 'The Midnight Mermaid',
  level2Message: 'Sea Turtles spotted! Deeper currents ahead!',
  level3Message: 'Sea Monkeys incoming! Watch for electric boogers!',
  level4BossMessage: 'BOSS INCOMING – The Midnight Mermaid!',
  stageClearMessage: 'The Midnight Mermaid has been vanquished!',
  smallEnemyDisintColors: ['#44ddcc', '#88ffee', '#00aa88', '#ffffff'],
  bigEnemyDisintColors: ['#22443a', '#446655', '#88ccaa', '#ffffff'],
  mediumEnemyDisintColors: ['#9b1e4b', '#dc508c', '#6e0032', '#ffe000'],
  level3EnemyDisintColors: ['#22dd88', '#44ff99', '#00aa66', '#ffffff'],
  mediumEnemyLaserHitColor: '#ff8844',
  level3EnemyLaserHitColor: '#22ff88',
};
