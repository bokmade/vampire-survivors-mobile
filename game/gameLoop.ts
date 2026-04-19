import type { GameState, Enemy, Projectile, Particle, Gem, HealthPickup, Vec2, UpgradeType, SpecialType, ParticleShape, EnemyType } from "./types";
import {
  dist,
  normalize,
  genId,
  spawnEnemy,
  gemValue,
  xpNeededForLevel,
  pickRandomUpgrades,
  clamp,
} from "./utils";
import {
  GEM_COLLECT_RADIUS,
  WAVE_INTERVAL,
  WAVE_ENEMY_BASE,
  WAVE_ENEMY_SCALE,
  ORB_SIZE,
  BLADE_SIZE,
  COLORS,
  ENEMY_CONFIGS,
  HEALTH_PICKUP_COLLECT_RADIUS,
  HEALTH_DROP_CHANCE,
  HEALTH_HEAL_AMOUNT,
  WAVE_BANNER_DURATION,
} from "./constants";

const MAX_PARTICLES = 30;
const MAX_GEMS = 60;
const MAX_ENEMIES = 40;
const MAX_HEALTH_PICKUPS = 10;

function spawnParticles(
  particles: Particle[],
  pos: Vec2,
  color: string,
  count: number,
  speed: number,
  shape: ParticleShape = "circle"
): void {
  if (particles.length >= MAX_PARTICLES) return;
  const allowed = Math.min(count, MAX_PARTICLES - particles.length);
  for (let i = 0; i < allowed; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = speed * (0.5 + Math.random() * 0.8);
    const lifetime = 0.35 + Math.random() * 0.3;
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color,
      size: 3 + Math.random() * 4,
      lifetime,
      maxLifetime: lifetime,
      shape,
      angle,
    });
  }
}

function spawnBloodDrops(particles: Particle[], pos: Vec2, count: number): void {
  if (particles.length >= MAX_PARTICLES) return;
  const allowed = Math.min(count, MAX_PARTICLES - particles.length);
  for (let i = 0; i < allowed; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 60 + Math.random() * 110;
    const lifetime = 0.45 + Math.random() * 0.35;
    particles.push({
      id: genId(),
      pos: { x: pos.x + (Math.random() - 0.5) * 6, y: pos.y + (Math.random() - 0.5) * 6 },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color: Math.random() > 0.3 ? "#cc0000" : "#880000",
      size: 4 + Math.random() * 5,
      lifetime,
      maxLifetime: lifetime,
      shape: "drop",
      angle,
    });
  }
}

function spawnPurpleSparks(particles: Particle[], pos: Vec2, count: number): void {
  if (particles.length >= MAX_PARTICLES) return;
  const allowed = Math.min(count, MAX_PARTICLES - particles.length);
  for (let i = 0; i < allowed; i++) {
    const angle = (i / allowed) * Math.PI * 2 + Math.random() * 0.5;
    const spd = 80 + Math.random() * 130;
    const lifetime = 0.3 + Math.random() * 0.25;
    const sparkColors = ["#cc44ff", "#9900cc", "#aa00ff", "#ff88ff"];
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      size: 2 + Math.random() * 3,
      lifetime,
      maxLifetime: lifetime,
      shape: "spark",
      angle,
    });
  }
}

function spawnFlashBurst(particles: Particle[], pos: Vec2, count: number): void {
  if (particles.length >= MAX_PARTICLES) return;
  const allowed = Math.min(count, MAX_PARTICLES - particles.length);
  const flashColors = ["#ffffff", "#ffe080", "#ffaa00", "#ff6600", "#ffddaa"];
  for (let i = 0; i < allowed; i++) {
    const angle = (i / allowed) * Math.PI * 2 + Math.random() * 0.3;
    const spd = 120 + Math.random() * 200;
    const lifetime = 0.25 + Math.random() * 0.2;
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color: flashColors[Math.floor(Math.random() * flashColors.length)],
      size: 6 + Math.random() * 8,
      lifetime,
      maxLifetime: lifetime,
      shape: "circle",
      angle,
    });
  }
}

function spawnLevelUpBurst(particles: Particle[], pos: Vec2, milestone: boolean = false): void {
  const goldenColors = ["#ffd700", "#ffb300", "#ff8800", "#ff4444", "#cc1111", "#ffee44"];
  const milestoneColors = ["#ffd700", "#ffffff", "#ffee44", "#ff4444", "#cc1111", "#ff8800", "#ffffff", "#fffbe0"];

  const innerCount = Math.min(12, MAX_PARTICLES - particles.length);
  if (innerCount <= 0) return;
  const colors = milestone ? milestoneColors : goldenColors;
  const spdMult = milestone ? 1.6 : 1;
  const sizeMult = milestone ? 1.5 : 1;

  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2;
    const spd = (140 + Math.random() * 100) * spdMult;
    const lifetime = 0.5 + Math.random() * 0.3;
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (5 + Math.random() * 5) * sizeMult,
      lifetime,
      maxLifetime: lifetime,
      shape: "circle",
      angle,
    });
  }

  if (milestone) {
    const outerCount = Math.min(10, MAX_PARTICLES - particles.length);
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2 + Math.PI / outerCount;
      const spd = 280 + Math.random() * 120;
      const lifetime = 0.65 + Math.random() * 0.25;
      particles.push({
        id: genId(),
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
        color: milestoneColors[Math.floor(Math.random() * milestoneColors.length)],
        size: 7 + Math.random() * 6,
        lifetime,
        maxLifetime: lifetime,
        shape: "circle",
        angle,
      });
    }
  }
}

function hitGlowColorForEnemy(type: EnemyType): string {
  const colors: Record<EnemyType, string> = {
    walker: "#cc1111",
    bat: "#9933cc",
    brute: "#ff6600",
  };
  return colors[type];
}

function shockwaveColorsForEnemy(type: EnemyType): readonly [string, string] {
  const inner = ENEMY_CONFIGS[type].color;
  const outerByType: Record<EnemyType, string> = {
    walker: "#8aaa60",
    bat: "#6d3a9c",
    brute: "#7a4e30",
  };
  return [inner, outerByType[type]];
}

function spawnShockwaveRing(
  particles: Particle[],
  pos: Vec2,
  innerColor: string = "#ffcc44",
  outerColor: string = "#ff8800"
): void {
  if (particles.length < MAX_PARTICLES) {
    const lifetime = 0.55;
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: 0, y: 0 },
      color: innerColor,
      size: 90,
      lifetime,
      maxLifetime: lifetime,
      shape: "ring",
      angle: 0,
    });
  }
  if (particles.length < MAX_PARTICLES) {
    const lifetime2 = 0.9;
    particles.push({
      id: genId(),
      pos: { x: pos.x, y: pos.y },
      vel: { x: 0, y: 0 },
      color: outerColor,
      size: 130,
      lifetime: lifetime2,
      maxLifetime: lifetime2,
      shape: "ring",
      angle: 0,
    });
  }
}

function spawnBoneShards(particles: Particle[], pos: Vec2, count: number): void {
  if (particles.length >= MAX_PARTICLES) return;
  const allowed = Math.min(count, MAX_PARTICLES - particles.length);
  for (let i = 0; i < allowed; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 50 + Math.random() * 100;
    const lifetime = 0.4 + Math.random() * 0.4;
    const boneColors = ["#ddd8c8", "#c8c4b0", "#f0ece0", "#b8b4a0"];
    particles.push({
      id: genId(),
      pos: { x: pos.x + (Math.random() - 0.5) * 10, y: pos.y + (Math.random() - 0.5) * 10 },
      vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
      color: boneColors[Math.floor(Math.random() * boneColors.length)],
      size: 3 + Math.random() * 5,
      lifetime,
      maxLifetime: lifetime,
      shape: "shard",
      angle,
    });
  }
}

function findNearestEnemy(
  enemies: Enemy[],
  origin: Vec2,
  maxRange: number
): Enemy | null {
  let nearest: Enemy | null = null;
  let nearestDist = maxRange;
  for (const e of enemies) {
    const d = dist(origin, e.pos);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = e;
    }
  }
  return nearest;
}

export function useSpecialAbility(state: GameState, type: SpecialType): GameState {
  const slot = state.specials[type];
  if (slot.timer > 0) return state;

  const particles: Particle[] = [...state.particles];
  let enemies = state.enemies.map((e) => ({ ...e, pos: { ...e.pos } }));
  let playerHp = state.player.hp;
  let playerMaxHp = state.player.maxHp;
  let shieldTimer = state.shieldTimer;
  let slowTimer = state.slowTimer;

  if (type === "nova") {
    const novaRadius = 260;
    const novaDamage = 80;
    let killed = 0;
    for (const enemy of enemies) {
      const d = dist(state.player.pos, enemy.pos);
      if (d <= novaRadius) {
        enemy.hp -= novaDamage;
        enemy.flashTimer = 0.3;
        if (killed < 3) {
          spawnPurpleSparks(particles, enemy.pos, 5);
          killed++;
        }
      }
    }
    spawnPurpleSparks(particles, state.player.pos, 14);
  } else if (type === "shield") {
    shieldTimer = 3;
    playerHp = Math.min(playerMaxHp, playerHp + Math.round(playerMaxHp * 0.25));
    spawnParticles(particles, state.player.pos, "#3498db", 10, 140);
  } else if (type === "timewarp") {
    slowTimer = 4;
    spawnParticles(particles, state.player.pos, "#1abc9c", 10, 130);
  }

  const newSpecials = {
    ...state.specials,
    [type]: { ...slot, timer: slot.cooldown },
  };

  const livingEnemies = enemies.filter((e) => e.hp > 0);
  const newGems: Gem[] = [];
  let kills = state.kills;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) {
      kills++;
      newGems.push({ id: genId(), pos: { ...enemy.pos }, value: gemValue(enemy.type) });
    }
  }

  return {
    ...state,
    enemies: livingEnemies,
    gems: newGems.length > 0 ? [...state.gems, ...newGems].slice(-MAX_GEMS) : state.gems,
    kills,
    particles,
    specials: newSpecials,
    shieldTimer,
    slowTimer,
    player: { ...state.player, hp: playerHp, maxHp: playerMaxHp },
  };
}

export function tickGame(
  state: GameState,
  dt: number,
  joystickDir: Vec2,
  screenW: number,
  screenH: number
): GameState {
  if (state.phase !== "playing") return state;

  const particles: Particle[] = [];
  for (const p of state.particles) {
    const newLifetime = p.lifetime - dt;
    if (newLifetime <= 0) continue;
    particles.push({
      ...p,
      pos: { x: p.pos.x + p.vel.x * dt, y: p.pos.y + p.vel.y * dt },
      vel: { x: p.vel.x * 0.88, y: p.vel.y * 0.88 },
      lifetime: newLifetime,
    });
  }

  const timeElapsed = state.timeElapsed + dt;
  let waveTimer = state.waveTimer + dt;
  let waveNumber = state.waveNumber;
  let waveBannerTimer = Math.max(0, state.waveBannerTimer - dt);
  const slowTimer = Math.max(0, state.slowTimer - dt);
  const shieldTimer = Math.max(0, state.shieldTimer - dt);
  const slowMult = slowTimer > 0 ? 0.25 : 1;

  const newSpecials = {
    nova: { ...state.specials.nova, timer: Math.max(0, state.specials.nova.timer - dt) },
    shield: { ...state.specials.shield, timer: Math.max(0, state.specials.shield.timer - dt) },
    timewarp: { ...state.specials.timewarp, timer: Math.max(0, state.specials.timewarp.timer - dt) },
  };

  const playerSpeedMult = 1 + (state.upgrades.speed ?? 0) * 0.15;
  const playerSpeed = state.player.speed * playerSpeedMult;
  let px = state.player.pos.x;
  let py = state.player.pos.y;

  if (joystickDir.x !== 0 || joystickDir.y !== 0) {
    const len = Math.sqrt(joystickDir.x * joystickDir.x + joystickDir.y * joystickDir.y);
    const nx = joystickDir.x / len;
    const ny = joystickDir.y / len;
    const intensity = Math.min(1, len);
    px = clamp(px + nx * playerSpeed * dt * intensity, 20, screenW - 20);
    py = clamp(py + ny * playerSpeed * dt * intensity, 20, screenH - 20);
  }

  let playerHp = state.player.hp;
  const playerMaxHp = state.player.maxHp;
  let invulnTimer = Math.max(0, state.player.invulnTimer - dt);
  let shakeTimer = Math.max(0, state.player.shakeTimer - dt);
  let shakeDir = state.player.shakeDir;
  const playerPos: Vec2 = { x: px, y: py };
  const worldOffset: Vec2 = {
    x: state.worldOffset.x - (px - state.player.pos.x),
    y: state.worldOffset.y - (py - state.player.pos.y),
  };

  const waveDifficulty = Math.floor(timeElapsed / WAVE_INTERVAL);
  let enemies: Enemy[] = state.enemies.map((e) => ({ ...e, pos: { ...e.pos } }));

  if (waveTimer >= WAVE_INTERVAL) {
    waveTimer = 0;
    waveNumber = waveNumber + 1;
    waveBannerTimer = WAVE_BANNER_DURATION;
    if (enemies.length < MAX_ENEMIES) {
      const slots = MAX_ENEMIES - enemies.length;
      const spawnCount = Math.min(
        slots,
        Math.floor(WAVE_ENEMY_BASE + waveDifficulty * WAVE_ENEMY_SCALE * 4)
      );
      for (let i = 0; i < spawnCount; i++) {
        const r = Math.random();
        let type: "walker" | "bat" | "brute";
        if (waveDifficulty < 2) {
          type = r < 0.7 ? "walker" : "bat";
        } else if (waveDifficulty < 5) {
          type = r < 0.5 ? "walker" : r < 0.85 ? "bat" : "brute";
        } else {
          type = r < 0.4 ? "walker" : r < 0.75 ? "bat" : "brute";
        }
        const scaleFactor = 1 + waveDifficulty * 0.05;
        const base = ENEMY_CONFIGS[type];
        const enemy = spawnEnemy(type, screenW, screenH);
        enemy.hp = Math.round(base.hp * scaleFactor);
        enemy.maxHp = enemy.hp;
        enemy.damage = Math.round(base.damage * scaleFactor);
        enemies.push(enemy);
      }
    }
  }

  for (const enemy of enemies) {
    const dir = normalize({ x: playerPos.x - enemy.pos.x, y: playerPos.y - enemy.pos.y });
    enemy.pos.x += dir.x * enemy.speed * slowMult * dt;
    enemy.pos.y += dir.y * enemy.speed * slowMult * dt;
    if (enemy.flashTimer > 0) enemy.flashTimer -= dt;
  }

  const damageMult = 1 + (state.upgrades.damage ?? 0) * 0.25;
  const aoeMult = 1 + (state.upgrades.aoe ?? 0) * 0.20;
  const fireRateMult = 1 + (state.upgrades.fireRate ?? 0) * 0.20;
  const isPiercing = (state.upgrades.pierce ?? 0) > 0;

  const isHighLoad = particles.length > 15 || enemies.length > 20;

  const newOrbAngle = state.weapons.orb.angle + state.weapons.orb.speed * dt * 60 * 0.02;
  const orbCount = state.weapons.orb.count + (state.upgrades.extraProjectile ?? 0);
  const orbRadius = state.weapons.orb.radius * aoeMult;

  for (let i = 0; i < orbCount; i++) {
    const angle = newOrbAngle + (i * Math.PI * 2) / orbCount;
    const orbPos: Vec2 = {
      x: playerPos.x + Math.cos(angle) * orbRadius,
      y: playerPos.y + Math.sin(angle) * orbRadius,
    };
    const orbDamage = state.weapons.orb.damage * damageMult;
    const orbHitRadius = ORB_SIZE * aoeMult;
    for (const enemy of enemies) {
      if (dist(orbPos, enemy.pos) < orbHitRadius + enemy.size) {
        enemy.hp -= orbDamage * dt * 3;
        enemy.flashTimer = 0.12;
        if (!isHighLoad) spawnParticles(particles, enemy.pos, hitGlowColorForEnemy(enemy.type), 1, 60);
      }
    }
  }

  const newBladeAngles = [...state.weapons.blade.angles];
  const bladeCount = newBladeAngles.length + (state.upgrades.extraProjectile ?? 0);
  const bladeRadius = state.weapons.blade.radius * aoeMult;

  for (let i = 0; i < bladeCount; i++) {
    if (newBladeAngles.length <= i) {
      newBladeAngles.push(i * ((Math.PI * 2) / Math.max(bladeCount, 1)));
    }
    newBladeAngles[i] += state.weapons.blade.speed * dt * 60 * 0.025;
    const bladePos: Vec2 = {
      x: playerPos.x + Math.cos(newBladeAngles[i]) * bladeRadius,
      y: playerPos.y + Math.sin(newBladeAngles[i]) * bladeRadius,
    };
    const bladeDamage = state.weapons.blade.damage * damageMult;
    const bladeHitRadius = BLADE_SIZE * aoeMult;
    for (const enemy of enemies) {
      if (dist(bladePos, enemy.pos) < bladeHitRadius + enemy.size) {
        enemy.hp -= bladeDamage * dt * 2.5;
        enemy.flashTimer = 0.10;
        if (!isHighLoad) spawnParticles(particles, enemy.pos, hitGlowColorForEnemy(enemy.type), 1, 55);
      }
    }
  }

  let lightningTimer = state.weapons.lightning.timer + dt;
  let lightningFlashTimer = state.weapons.lightning.flashTimer;
  let lightningFlashTarget = state.weapons.lightning.flashTarget;
  const lightningCooldown = state.weapons.lightning.cooldown / fireRateMult;

  if (lightningTimer >= lightningCooldown) {
    lightningTimer = 0;
    const lightningRange = state.weapons.lightning.range * aoeMult;
    const lightningDamage = state.weapons.lightning.damage * damageMult;
    const targets = state.weapons.lightning.targets + (state.upgrades.extraProjectile ?? 0);
    const inRange = enemies
      .filter((e) => dist(playerPos, e.pos) <= lightningRange)
      .sort((a, b) => dist(playerPos, a.pos) - dist(playerPos, b.pos))
      .slice(0, targets);
    for (const target of inRange) {
      target.hp -= lightningDamage;
      target.flashTimer = 0.2;
      lightningFlashTarget = { ...target.pos };
      lightningFlashTimer = 0.2;
      if (!isHighLoad) spawnParticles(particles, target.pos, hitGlowColorForEnemy(target.type), 4, 100);
    }
  } else if (lightningFlashTimer > 0) {
    lightningFlashTimer -= dt;
  }

  let projectileTimer = state.weapons.projectile.timer + dt;
  const projectileCooldown = state.weapons.projectile.cooldown / fireRateMult;
  const liveProjectiles: Projectile[] = [];

  for (const p of state.projectiles) {
    liveProjectiles.push({
      ...p,
      pos: { x: p.pos.x + p.vel.x * dt, y: p.pos.y + p.vel.y * dt },
      lifetime: p.lifetime + dt,
      hitEnemies: [...p.hitEnemies],
    });
  }

  if (projectileTimer >= projectileCooldown) {
    projectileTimer = 0;
    const projectileRange = state.weapons.projectile.range * aoeMult;
    const projectileDamage = state.weapons.projectile.damage * damageMult;
    const projectileCount = 1 + (state.upgrades.extraProjectile ?? 0);
    const target = findNearestEnemy(enemies, playerPos, projectileRange);
    if (target) {
      const dir = normalize({
        x: target.pos.x - playerPos.x,
        y: target.pos.y - playerPos.y,
      });
      const spreadAngles =
        projectileCount === 1 ? [0] :
        projectileCount === 2 ? [-0.15, 0.15] :
        [-0.2, 0, 0.2];
      for (let i = 0; i < Math.min(projectileCount, 3); i++) {
        const spread = spreadAngles[i] ?? 0;
        const cos = Math.cos(spread);
        const sin = Math.sin(spread);
        const vx = dir.x * cos - dir.y * sin;
        const vy = dir.x * sin + dir.y * cos;
        const maxLifetime = projectileRange / state.weapons.projectile.speed;
        liveProjectiles.push({
          id: genId(),
          weapon: "lightning",
          pos: { x: playerPos.x, y: playerPos.y },
          vel: { x: vx * state.weapons.projectile.speed, y: vy * state.weapons.projectile.speed },
          damage: projectileDamage,
          radius: state.weapons.projectile.radius * aoeMult,
          lifetime: 0,
          maxLifetime,
          piercing: isPiercing,
          hitEnemies: [],
        });
      }
    }
  }

  if (!isHighLoad) {
    for (const proj of liveProjectiles) {
      if (particles.length >= MAX_PARTICLES) break;
      if (Math.random() < 0.6) {
        const trailLifetime = 0.18 + Math.random() * 0.12;
        particles.push({
          id: genId(),
          pos: { x: proj.pos.x + (Math.random() - 0.5) * 3, y: proj.pos.y + (Math.random() - 0.5) * 3 },
          vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
          color: Math.random() > 0.5 ? "#cc2200" : "#880000",
          size: 2 + Math.random() * 2,
          lifetime: trailLifetime,
          maxLifetime: trailLifetime,
          shape: "drop",
          angle: Math.atan2(proj.vel.y, proj.vel.x),
        });
      }
    }
  }

  const projectilesToRemove = new Set<string>();
  for (const proj of liveProjectiles) {
    if (proj.lifetime >= proj.maxLifetime) {
      projectilesToRemove.add(proj.id);
      continue;
    }
    for (const enemy of enemies) {
      if (proj.hitEnemies.includes(enemy.id)) continue;
      if (dist(proj.pos, enemy.pos) < proj.radius + enemy.size) {
        enemy.hp -= proj.damage;
        enemy.flashTimer = 0.18;
        if (!isHighLoad) spawnParticles(particles, proj.pos, hitGlowColorForEnemy(enemy.type), 2, 70);
        if (proj.piercing) {
          proj.hitEnemies.push(enemy.id);
        } else {
          projectilesToRemove.add(proj.id);
          break;
        }
      }
    }
  }
  const projectiles = liveProjectiles.filter((p) => !projectilesToRemove.has(p.id));

  const magnetRange = GEM_COLLECT_RADIUS * (1 + (state.upgrades.magnet ?? 0) * 0.5);
  let xp = state.xp;
  const gemsToRemove = new Set<string>();
  for (const gem of state.gems) {
    if (dist(playerPos, gem.pos) < magnetRange) {
      gemsToRemove.add(gem.id);
      xp += gem.value;
      if (!isHighLoad) spawnParticles(particles, gem.pos, COLORS.particleGem, 2, 50);
    }
  }
  let gems: Gem[] = gemsToRemove.size > 0
    ? state.gems.filter((g) => !gemsToRemove.has(g.id))
    : state.gems;
  if (gems.length > MAX_GEMS) gems = gems.slice(gems.length - MAX_GEMS);

  const healthToRemove = new Set<string>();
  let playerHpAfterPickups = playerHp;
  const tickedHealthPickups: HealthPickup[] = state.healthPickups.map((hp) => ({
    ...hp,
    pulse: hp.pulse + dt * 3,
  }));
  for (const hp of tickedHealthPickups) {
    if (dist(playerPos, hp.pos) < HEALTH_PICKUP_COLLECT_RADIUS) {
      healthToRemove.add(hp.id);
      playerHpAfterPickups = Math.min(playerMaxHp, playerHpAfterPickups + hp.healAmount);
      spawnParticles(particles, hp.pos, COLORS.healthPickup, 4, 70);
    }
  }
  playerHp = playerHpAfterPickups;
  let survivingHealthPickups = healthToRemove.size > 0
    ? tickedHealthPickups.filter((hp) => !healthToRemove.has(hp.id))
    : tickedHealthPickups;

  let kills = state.kills;
  const newGems: Gem[] = [];
  const newHealthPickups: HealthPickup[] = [];
  for (const enemy of enemies) {
    if (enemy.hp <= 0) {
      kills++;
      newGems.push({ id: genId(), pos: { x: enemy.pos.x, y: enemy.pos.y }, value: gemValue(enemy.type) });
      if (!isHighLoad) {
        if (enemy.type === "walker") {
          spawnBloodDrops(particles, enemy.pos, 7);
        } else if (enemy.type === "bat") {
          spawnPurpleSparks(particles, enemy.pos, 8);
        } else if (enemy.type === "brute") {
          spawnBoneShards(particles, enemy.pos, 6);
          spawnBloodDrops(particles, enemy.pos, 4);
          spawnFlashBurst(particles, enemy.pos, 8);
          const [bruteIC, bruteOC] = shockwaveColorsForEnemy(enemy.type);
          spawnShockwaveRing(particles, enemy.pos, bruteIC, bruteOC);
          shakeTimer = Math.max(shakeTimer, 0.5);
          const brutedx = playerPos.x - enemy.pos.x;
          const brutedy = playerPos.y - enemy.pos.y;
          const bruteLen = Math.sqrt(brutedx * brutedx + brutedy * brutedy) || 1;
          shakeDir = { x: brutedx / bruteLen, y: brutedy / bruteLen };
        }
      } else {
        if (enemy.type === "walker") {
          spawnBloodDrops(particles, enemy.pos, 2);
        } else if (enemy.type === "bat") {
          spawnPurpleSparks(particles, enemy.pos, 3);
        } else if (enemy.type === "brute") {
          spawnBoneShards(particles, enemy.pos, 3);
          spawnFlashBurst(particles, enemy.pos, 5);
          const [bruteHLIC, bruteHLOC] = shockwaveColorsForEnemy(enemy.type);
          spawnShockwaveRing(particles, enemy.pos, bruteHLIC, bruteHLOC);
          shakeTimer = Math.max(shakeTimer, 0.5);
          const bruteHLdx = playerPos.x - enemy.pos.x;
          const bruteHLdy = playerPos.y - enemy.pos.y;
          const bruteHLLen = Math.sqrt(bruteHLdx * bruteHLdx + bruteHLdy * bruteHLdy) || 1;
          shakeDir = { x: bruteHLdx / bruteHLLen, y: bruteHLdy / bruteHLLen };
        }
      }
      if (survivingHealthPickups.length < MAX_HEALTH_PICKUPS) {
        const dropChance = HEALTH_DROP_CHANCE[enemy.type];
        if (Math.random() < dropChance) {
          newHealthPickups.push({
            id: genId(),
            pos: {
              x: enemy.pos.x + (Math.random() - 0.5) * 20,
              y: enemy.pos.y + (Math.random() - 0.5) * 20,
            },
            healAmount: HEALTH_HEAL_AMOUNT[enemy.type],
            pulse: 0,
          });
        }
      }
    }
  }
  const livingEnemies = enemies.filter((e) => e.hp > 0);
  let allGems = newGems.length > 0 ? [...gems, ...newGems] : gems;
  if (allGems.length > MAX_GEMS) allGems = allGems.slice(allGems.length - MAX_GEMS);
  if (newHealthPickups.length > 0) {
    survivingHealthPickups = [...survivingHealthPickups, ...newHealthPickups];
  }

  let level = state.level;
  let xpNeeded = state.xpNeeded;
  let pendingUpgrades = state.pendingUpgrades;
  let phase = state.phase as GameState["phase"];
  let levelUpFlashTimer = Math.max(0, state.levelUpFlashTimer - dt);
  let levelUpLabelTimer = Math.max(0, state.levelUpLabelTimer - dt);

  if (xp >= xpNeeded && levelUpFlashTimer <= 0) {
    xp -= xpNeeded;
    level++;
    xpNeeded = xpNeededForLevel(level);
    pendingUpgrades = pickRandomUpgrades(state.upgrades);
    levelUpFlashTimer = 0.4;
    levelUpLabelTimer = 1.0;
    spawnLevelUpBurst(particles, playerPos, level % 5 === 0);
  }

  if (state.levelUpFlashTimer > 0 && levelUpFlashTimer <= 0) {
    phase = "levelup";
  }

  const isShielded = shieldTimer > 0;
  if (phase === "playing" && invulnTimer <= 0 && !isShielded) {
    for (const enemy of livingEnemies) {
      if (dist(playerPos, enemy.pos) < enemy.size + 18) {
        playerHp -= enemy.damage * dt * 1.5;
        invulnTimer = 0.5;
        shakeTimer = 0.25;
        const hitdx = playerPos.x - enemy.pos.x;
        const hitdy = playerPos.y - enemy.pos.y;
        const hitLen = Math.sqrt(hitdx * hitdx + hitdy * hitdy) || 1;
        shakeDir = { x: hitdx / hitLen, y: hitdy / hitLen };
        spawnParticles(particles, playerPos, "#e74c3c", 3, 70);
        break;
      }
    }
  }

  let highScore = state.highScore;
  if (playerHp <= 0) {
    playerHp = 0;
    phase = "gameover";
    const score = kills + Math.floor(timeElapsed);
    if (score > state.highScore) highScore = score;
  }

  return {
    ...state,
    phase,
    worldOffset,
    player: {
      ...state.player,
      pos: playerPos,
      hp: playerHp,
      maxHp: playerMaxHp,
      invulnTimer,
      shakeTimer,
      shakeDir,
    },
    enemies: livingEnemies,
    projectiles,
    gems: allGems,
    particles,
    level,
    xp,
    xpNeeded,
    kills,
    timeElapsed,
    waveTimer,
    waveNumber,
    waveBannerTimer,
    weapons: {
      ...state.weapons,
      orb: { ...state.weapons.orb, angle: newOrbAngle },
      blade: { ...state.weapons.blade, angles: newBladeAngles },
      lightning: {
        ...state.weapons.lightning,
        timer: lightningTimer,
        flashTimer: lightningFlashTimer,
        flashTarget: lightningFlashTarget,
      },
      projectile: { ...state.weapons.projectile, timer: projectileTimer },
    },
    specials: newSpecials,
    slowTimer,
    shieldTimer,
    highScore,
    pendingUpgrades,
    healthPickups: survivingHealthPickups,
    levelUpFlashTimer,
    levelUpLabelTimer,
  };
}

export function applyUpgrade(state: GameState, upgrade: UpgradeType): GameState {
  const newUpgrades = { ...state.upgrades, [upgrade]: (state.upgrades[upgrade] ?? 0) + 1 };
  let playerHp = state.player.hp;
  let playerMaxHp = state.player.maxHp;

  if (upgrade === "health") {
    playerMaxHp += 20;
    playerHp = Math.min(playerHp + 20, playerMaxHp);
  }

  return {
    ...state,
    upgrades: newUpgrades,
    pendingUpgrades: [],
    phase: "playing",
    levelUpFlashTimer: 0,
    levelUpLabelTimer: 0,
    player: { ...state.player, hp: playerHp, maxHp: playerMaxHp },
  };
}
