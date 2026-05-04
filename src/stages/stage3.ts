import { FloatingBomb } from '../entities/stage3/floatingbomb';
import { RadioactiveBarrel } from '../entities/stage3/radioactivebarrel';
import { BlackSquid } from '../entities/stage3/blacksquid';
import { ElectricEel } from '../entities/stage3/electriceel';
import { SpeedBoostPowerup } from '../entities/stage3/speedboostpowerup';
import { NuclearChest } from '../entities/stage3/nuclearchest';
import { MutantFrogBoss } from '../entities/stage3/frogboss';
import { Sardine, createSardineSchool } from '../entities/stage3/sardine';
import { RedTreasure } from '../entities/redtreasure';
import { GlowingClam } from '../entities/glowingclam';
import { GoldenCoin } from '../entities/goldencoin';
import { TreasureChest } from '../entities/treasure';
import { Starfish } from '../entities/starfish';
import { Jellyfish } from '../entities/jellyfish';
import { Shark } from '../entities/shark';
import { StageDefinition } from './stageDefinition';

export const stage3Definition: StageDefinition = {
  id: 3,
  name: 'Stage 3: Nuclear Wasteland',
  backgroundStageId: 3,
  spawnConfig: {
    // Small enemy: nuclear jellyfish (reuse base Jellyfish)
    createSmallEnemy: (x, y, speedMult, level) => new Jellyfish(x, y, speedMult, level),
    // Big enemy: nuclear shark (reuse base Shark)
    createBigEnemy: (x, y, targetX, level) => new Shark(x, y, targetX, level),
    // Medium enemy: black squid (faster)
    createMediumEnemy: (x, y, targetX) => new BlackSquid(x, y, targetX),
    // Level 3 enemy: electric eel
    createLevel3Enemy: (x, y, targetX, targetY) => new ElectricEel(x, y, targetX, targetY),
    // Food: individual sardine (used as fallback; createFoodGroup is primary)
    createFood: (x, y) => new Sardine(x, y),
    // Food group: schools of 10 sardines
    createFoodGroup: (x, y) => createSardineSchool(x, y),
    // Bonus food: starfish
    createBonusFood: (x, y) => new Starfish(x, y),
    // Treasure (regular)
    createTreasure: (x, y) => new TreasureChest(x, y),
    // Powerup chest: nuclear chest (replaces laser chest)
    createPowerupChest: (x, y) => new NuclearChest(x, y),
    // Red treasure (heart)
    createRedTreasure: (x, y) => new RedTreasure(x, y),
    // More glowing clams (shorter interval via config)
    createGlowingClam: (x, y) => new GlowingClam(x, y),
    glowingClamInterval: 15.0,  // more frequent than stage 1/2's 30s
    // Coins
    createCoin: (x, y) => new GoldenCoin(x, y),
    // Stage 3 specific obstacles
    createObstacle: (x, y) => new FloatingBomb(x, y),
    createHazard: (x, y) => new RadioactiveBarrel(x, y, 0),
    createSpeedBoost: (x, y) => new SpeedBoostPowerup(x, y),
  },
  createBoss: (x, startY) => new MutantFrogBoss(x, startY),
  bossName: 'The Mutant Frog',
  level2Message: 'Speed boosts spotted! Radioactive barrels in the water!',
  level3Message: 'Electric Eels incoming! Watch for the shock field!',
  level4BossMessage: 'BOSS INCOMING – The Mutant Frog King!',
  stageClearMessage: 'The Mutant Frog King has been defeated! The wasteland is safe!',
  smallEnemyDisintColors: ['#aaffaa', '#88cc44', '#ffff00', '#ffffff'],
  bigEnemyDisintColors: ['#556633', '#88aa55', '#ccee88', '#ffffff'],
  mediumEnemyDisintColors: ['#110011', '#440022', '#aa0044', '#ff4488'],
  level3EnemyDisintColors: ['#00ccff', '#44eeff', '#00aacc', '#ffffff'],
  mediumEnemyLaserHitColor: '#ff0044',
  level3EnemyLaserHitColor: '#00ccff',
};
