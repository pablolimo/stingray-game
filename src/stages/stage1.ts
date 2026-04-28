import { Jellyfish } from '../entities/jellyfish';
import { Shark } from '../entities/shark';
import { Squid } from '../entities/squid';
import { ScubaKitten } from '../entities/scubakitten';
import { Fish } from '../entities/fish';
import { Starfish } from '../entities/starfish';
import { TreasureChest } from '../entities/treasure';
import { PowerupChest } from '../entities/powerupchest';
import { RedTreasure } from '../entities/redtreasure';
import { GlowingClam } from '../entities/glowingclam';
import { GoldenCoin } from '../entities/goldencoin';
import { ScubaRastafariBoss } from '../entities/scubarastafari';
import { StageDefinition } from './stageDefinition';

export const stage1Definition: StageDefinition = {
  id: 1,
  name: 'Stage 1: Caribbean Reef',
  backgroundStageId: 1,
  spawnConfig: {
    createSmallEnemy: (x, y, speedMult, level) => new Jellyfish(x, y, speedMult, level),
    createBigEnemy: (x, y, targetX, level) => new Shark(x, y, targetX, level),
    createMediumEnemy: (x, y, targetX) => new Squid(x, y, targetX),
    createLevel3Enemy: (x, y, targetX, targetY) => new ScubaKitten(x, y, targetX, targetY),
    createFood: (x, y) => new Fish(x, y, Math.floor(Math.random() * 3) as 0 | 1 | 2),
    createBonusFood: (x, y) => new Starfish(x, y),
    createTreasure: (x, y) => new TreasureChest(x, y),
    createPowerupChest: (x, y) => new PowerupChest(x, y),
    createRedTreasure: (x, y) => new RedTreasure(x, y),
    createGlowingClam: (x, y) => new GlowingClam(x, y),
    createCoin: (x, y) => new GoldenCoin(x, y),
  },
  createBoss: (x, startY) => new ScubaRastafariBoss(x, startY),
  bossName: 'The Rasta Diver',
  level2Message: 'Squid attackers incoming!',
  level3Message: 'Jellyfish are electrified! Sharks hunt you!',
  level4BossMessage: 'BOSS INCOMING – The Rasta Diver!',
  stageClearMessage: 'The Rasta Diver has been defeated!',
  smallEnemyDisintColors: ['#c864c8', '#e0a0e0', '#9632b4', '#ffffff'],
  bigEnemyDisintColors: ['#708090', '#536878', '#b0c0d0', '#ffffff'],
  mediumEnemyDisintColors: ['#9b1e4b', '#dc508c', '#6e0032', '#ffe000'],
  level3EnemyDisintColors: ['#2d6e8a', '#f5c98a', '#1a8a5a', '#ffcc00'],
  mediumEnemyLaserHitColor: '#ff8844',
  level3EnemyLaserHitColor: '#4a90d9',
};
