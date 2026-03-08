(() => {
  const { rand, dist, angleTo, Particle } = window.GameUtils;

  const WEAPONS = {
    pistol: { damage: 24, cooldown: 0.28, spread: 0.03, speed: 630, color: '#ffed8a' },
    smg: { damage: 10, cooldown: 0.08, spread: 0.12, speed: 700, color: '#ffe36a' },
    shotgun: { damage: 9, cooldown: 0.55, spread: 0.26, pellets: 6, speed: 560, color: '#ffd4a0' },
  };

  class CombatSystem {
    constructor() {
      this.bullets = [];
      this.fireTimers = new Map();
    }

    fire(shooter, weaponName, tx, ty, team = 'player') {
      const cfg = WEAPONS[weaponName];
      const timer = this.fireTimers.get(shooter) || 0;
      if (timer > 0 || !cfg) return false;
      const base = angleTo(shooter, { x: tx, y: ty });
      const shots = cfg.pellets || 1;
      for (let i = 0; i < shots; i++) {
        const a = base + rand(-cfg.spread, cfg.spread);
        this.bullets.push({
          x: shooter.x,
          y: shooter.y,
          vx: Math.cos(a) * cfg.speed,
          vy: Math.sin(a) * cfg.speed,
          life: 1.2,
          damage: cfg.damage,
          team,
          color: cfg.color,
        });
      }
      this.fireTimers.set(shooter, cfg.cooldown);
      return true;
    }

    update(dt, world, entities, vehicles, particles) {
      for (const [k, v] of this.fireTimers) this.fireTimers.set(k, Math.max(0, v - dt));
      this.bullets = this.bullets.filter((b) => {
        b.life -= dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > world.width || b.y > world.height || world.collidesBuilding(b.x, b.y, 2)) return false;

        for (const e of entities) {
          if (!e.alive || e.team === b.team || dist(e, b) > 12) continue;
          e.takeDamage ? e.takeDamage(b.damage) : (e.health -= b.damage);
          for (let i = 0; i < 3; i++) particles.push(new Particle(b.x, b.y, rand(-60, 60), rand(-60, 60), 0.25, '#ff6f6f', 2));
          return false;
        }

        for (const v of vehicles) {
          if (dist(v, b) < 18) {
            v.damage(b.damage * 0.5, particles);
            return false;
          }
        }
        return true;
      });
    }

    draw(ctx, camera) {
      this.bullets.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - camera.x - 1, b.y - camera.y - 1, 3, 3);
      });
    }
  }

  window.CombatSystem = CombatSystem;
  window.WEAPONS = WEAPONS;
})();
