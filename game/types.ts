export type Vec2 = { x: number; y: number };

export type EnemyType = "walker" | "bat" | "brute";
export type WeaponType = "orb" | "lightning" | "blade";
export type UpgradeType =
  | "damage"
  | "fireRate"
  | "aoe"
  | "extraProjectile"
  | "speed"
  | "health"
  | "magnet"
  | "pierce";

export type FeatherIconName =
  | "zap"
  | "fast-forward"
  | "crosshair"
  | "copy"
  | "wind"
  | "heart"
  | "radio"
  | "chevrons-right"
  | "chevron-right"
  | "award"
  | "clock"
  | "star"
  | "activity"
  | "refresh-cw"
  | "home"
  | "shield";

export interface Enemy {
  id: string;
  type: EnemyType;
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
  damage: number;
  flashTimer: number;
}

export interface Projectile {
  id: string;
  weapon: WeaponType;
  pos: Vec2;
  vel: Vec2;
  damage: number;
  radius: number;
  lifetime: number;
  maxLifetime: number;
  piercing: boolean;
  hitEnemies: string[];
}

export interface Gem {
  id: string;
  pos: Vec2;
  value: number;
}

export interface HealthPickup {
  id: string;
  pos: Vec2;
  healAmount: number;
  pulse: number;
}

export type ParticleShape = "circle" | "drop" | "spark" | "shard" | "ring";

export interface Particle {
  id: string;
  pos: Vec2;
  vel: Vec2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
  shape: ParticleShape;
  angle?: number;
}

export interface OrbWeapon {
  angle: number;
  count: number;
  damage: number;
  radius: number;
  speed: number;
}

export interface BladeWeapon {
  angles: number[];
  damage: number;
  radius: number;
  speed: number;
}

export interface LightningWeapon {
  cooldown: number;
  timer: number;
  damage: number;
  range: number;
  targets: number;
  flashTimer: number;
  flashTarget: Vec2 | null;
}

export interface ProjectileWeapon {
  cooldown: number;
  timer: number;
  damage: number;
  speed: number;
  range: number;
  radius: number;
}

export interface WeaponStats {
  orb: OrbWeapon;
  lightning: LightningWeapon;
  blade: BladeWeapon;
  projectile: ProjectileWeapon;
}

export interface PlayerState {
  pos: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  invulnTimer: number;
  shakeTimer: number;
  shakeDir: Vec2;
}

export type SpecialType = "nova" | "shield" | "timewarp";

export interface SpecialSlot {
  cooldown: number;
  timer: number;
}

export interface GameState {
  phase: "start" | "playing" | "levelup" | "gameover" | "paused";
  worldOffset: Vec2;
  player: PlayerState;
  enemies: Enemy[];
  projectiles: Projectile[];
  gems: Gem[];
  particles: Particle[];
  level: number;
  xp: number;
  xpNeeded: number;
  kills: number;
  timeElapsed: number;
  waveTimer: number;
  waveNumber: number;
  waveBannerTimer: number;
  weapons: WeaponStats;
  upgrades: Record<UpgradeType, number>;
  highScore: number;
  pendingUpgrades: UpgradeType[];
  specials: Record<SpecialType, SpecialSlot>;
  slowTimer: number;
  shieldTimer: number;
  healthPickups: HealthPickup[];
  levelUpFlashTimer: number;
  levelUpLabelTimer: number;
}

export const UPGRADE_META: Record<
  UpgradeType,
  { label: string; desc: string; icon: FeatherIconName; maxLevel: number }
> = {
  damage: {
    label: "Dark Power",
    desc: "+25% attack damage",
    icon: "zap",
    maxLevel: 5,
  },
  fireRate: {
    label: "Rapid Curse",
    desc: "+20% attack speed",
    icon: "fast-forward",
    maxLevel: 5,
  },
  aoe: {
    label: "Blast Radius",
    desc: "+20% area of effect",
    icon: "crosshair",
    maxLevel: 4,
  },
  extraProjectile: {
    label: "Multicast",
    desc: "+1 extra projectile",
    icon: "copy",
    maxLevel: 3,
  },
  speed: {
    label: "Phantom Step",
    desc: "+15% movement speed",
    icon: "wind",
    maxLevel: 4,
  },
  health: {
    label: "Blood Pact",
    desc: "+20 max HP",
    icon: "heart",
    maxLevel: 5,
  },
  magnet: {
    label: "Soul Magnet",
    desc: "Larger gem pickup range",
    icon: "radio",
    maxLevel: 3,
  },
  pierce: {
    label: "Penetrate",
    desc: "Projectiles pierce enemies",
    icon: "chevrons-right",
    maxLevel: 2,
  },
};
