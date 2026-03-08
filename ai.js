(() => {
  const { dist, angleTo, rand } = window.GameUtils;

  class NPC {
    constructor(x, y, type = 'gang') {
      this.x = x;
      this.y = y;
      this.type = type;
      this.team = type === 'police' ? 'police' : 'gang';
      this.speed = type === 'police' ? 120 : 100;
      this.health = 55;
      this.alive = true;
      this.angle = 0;
      this.cooldown = 0;
      this.patrolPoint = { x: x + rand(-80, 80), y: y + rand(-80, 80) };
    }
    takeDamage(v) {
      this.health -= v;
      if (this.health <= 0) this.alive = false;
    }
    draw(ctx, camera) {
      if (!this.alive) return;
      ctx.fillStyle = this.type === 'police' ? '#5aa6ff' : '#c75aff';
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.beginPath();
      ctx.moveTo(this.x - camera.x, this.y - camera.y);
      ctx.lineTo(this.x - camera.x + Math.cos(this.angle) * 10, this.y - camera.y + Math.sin(this.angle) * 10);
      ctx.stroke();
    }
  }

  class AIManager {
    constructor(world) {
      this.world = world;
      this.gangs = [];
      this.police = [];
      this.pickups = [];
      this.spawnGangInitial();
    }

    spawnGangInitial() {
      this.world.gangZones.forEach((z) => {
        for (let i = 0; i < 6; i++) this.gangs.push(new NPC(z.x + rand(-z.r * 0.5, z.r * 0.5), z.y + rand(-z.r * 0.5, z.r * 0.5), 'gang'));
      });
    }

    spawnPoliceNear(player) {
      const p = new NPC(player.x + rand(-180, 180), player.y + rand(-180, 180), 'police');
      this.police.push(p);
    }

    update(dt, player, combat, particles) {
      const all = [...this.gangs, ...this.police];
      all.forEach((n) => {
        if (!n.alive) return;
        n.cooldown = Math.max(0, n.cooldown - dt);
        const isPolice = n.type === 'police';
        const detect = isPolice ? 400 : 270;
        const target = dist(n, player) < detect ? player : null;
        if (target && player.alive) {
          n.angle = angleTo(n, target);
          if (dist(n, player) > (isPolice ? 140 : 190)) {
            n.x += Math.cos(n.angle) * n.speed * dt;
            n.y += Math.sin(n.angle) * n.speed * dt;
          }
          const weapon = isPolice ? 'smg' : 'pistol';
          if (dist(n, player) < (isPolice ? 220 : 190) && n.cooldown === 0) {
            combat.fire(n, weapon, player.x, player.y, n.team);
            n.cooldown = isPolice ? 0.25 : 0.45;
          }
        } else {
          const a = angleTo(n, n.patrolPoint);
          n.angle = a;
          if (dist(n, n.patrolPoint) < 10) n.patrolPoint = { x: n.x + rand(-100, 100), y: n.y + rand(-100, 100) };
          n.x += Math.cos(a) * n.speed * 0.4 * dt;
          n.y += Math.sin(a) * n.speed * 0.4 * dt;
        }
      });

      // defeated enemies drop pickups
      for (const group of [this.gangs, this.police]) {
        for (const n of group) {
          if (!n.alive && !n.dropped) {
            n.dropped = true;
            if (Math.random() < 0.9) this.pickups.push({ x: n.x, y: n.y, type: ['cash', 'ammo', 'medkit', 'armor'][Math.floor(rand(0, 4))], value: Math.floor(rand(10, 45)) });
          }
        }
      }

      this.gangs = this.gangs.filter((n) => n.alive || Math.random() > 0.01);
      this.police = this.police.filter((n) => n.alive || Math.random() > 0.02);
      if (this.gangs.length < 18) this.spawnGangInitial();
    }

    draw(ctx, camera) {
      [...this.gangs, ...this.police].forEach((n) => n.draw(ctx, camera));
      this.pickups.forEach((p) => {
        const c = { cash: '#ffd447', ammo: '#ff8f4d', medkit: '#61ff88', armor: '#7fd9ff', weapon: '#d594ff' }[p.type] || '#fff';
        ctx.fillStyle = c;
        ctx.fillRect(p.x - camera.x - 6, p.y - camera.y - 6, 12, 12);
      });
    }
  }

  window.AIManager = AIManager;
})();
