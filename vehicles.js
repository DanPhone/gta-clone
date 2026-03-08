(() => {
  const { rand, clamp, Particle, dist, angleTo } = window.GameUtils;

  const VEHICLE_CFG = {
    maxSpeed: 300,
    accel: 520,
    brake: 680,
    reverse: 260,
    turnRate: 2.8,
    drag: 0.986,
  };

  class Vehicle {
    constructor(x, y, color = '#5db2ff', isTraffic = false) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.angle = rand(0, Math.PI * 2);
      this.w = 38;
      this.h = 20;
      this.hp = 100;
      this.maxHp = 100;
      this.color = color;
      this.driver = null;
      this.isTraffic = isTraffic;
      this.aiTarget = null;
      this.exploded = false;
    }

    speed() {
      return Math.hypot(this.vx, this.vy);
    }

    applyInput(input, dt) {
      const speed = this.speed();
      const dirX = Math.cos(this.angle);
      const dirY = Math.sin(this.angle);
      const steerScale = clamp(speed / 220, 0.25, 1.1);
      if (input.left) this.angle -= VEHICLE_CFG.turnRate * steerScale * dt;
      if (input.right) this.angle += VEHICLE_CFG.turnRate * steerScale * dt;

      let force = 0;
      if (input.up) force = VEHICLE_CFG.accel;
      if (input.down) force = input.up ? -VEHICLE_CFG.brake : -VEHICLE_CFG.reverse;

      if (input.handbrake) {
        this.vx *= 0.975;
        this.vy *= 0.975;
      }
      this.vx += dirX * force * dt;
      this.vy += dirY * force * dt;
    }

    update(world, dt, particles) {
      this.vx *= VEHICLE_CFG.drag;
      this.vy *= VEHICLE_CFG.drag;

      const speed = this.speed();
      if (speed > VEHICLE_CFG.maxSpeed) {
        const scale = VEHICLE_CFG.maxSpeed / speed;
        this.vx *= scale;
        this.vy *= scale;
      }

      const nx = this.x + this.vx * dt;
      const ny = this.y + this.vy * dt;
      if (!world.collidesBuilding(nx, this.y, 16) && nx > 0 && nx < world.width) this.x = nx; else this.vx *= -0.25;
      if (!world.collidesBuilding(this.x, ny, 16) && ny > 0 && ny < world.height) this.y = ny; else this.vy *= -0.25;

      if (this.hp < 40 && Math.random() < 0.25) {
        particles.push(new Particle(this.x, this.y, rand(-18, 18), rand(-18, 18), 0.5, 'rgba(130,130,130,0.8)', 2));
      }
    }

    damage(amount, particles) {
      this.hp -= amount;
      for (let i = 0; i < 6; i++) particles.push(new Particle(this.x, this.y, rand(-80, 80), rand(-80, 80), 0.35, '#ffb84d', 2));
      if (this.hp <= 0 && !this.exploded) {
        this.exploded = true;
        for (let i = 0; i < 30; i++) particles.push(new Particle(this.x, this.y, rand(-180, 180), rand(-180, 180), 1.2, i % 2 ? '#ff5d33' : '#ffdf66', 3));
      }
    }

    draw(ctx, camera) {
      ctx.save();
      ctx.translate(this.x - camera.x, this.y - camera.y);
      ctx.rotate(this.angle);
      const dmg = 1 - clamp(this.hp / this.maxHp, 0, 1);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.fillStyle = `rgba(30,30,30,${0.2 + dmg * 0.5})`;
      ctx.fillRect(-this.w / 2 + 4, -this.h / 2 + 3, this.w - 8, this.h - 6);
      if (dmg > 0.35) {
        ctx.strokeStyle = `rgba(255,120,90,${dmg})`;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, 4);
        ctx.moveTo(-2, -7);
        ctx.lineTo(7, 8);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  class TrafficManager {
    constructor(world) {
      this.world = world;
      this.vehicles = [];
      this.maxTraffic = 28;
      this.spawnInitial();
    }

    randomRoadPoint() {
      for (let i = 0; i < 100; i++) {
        const x = rand(40, this.world.width - 40);
        const y = rand(40, this.world.height - 40);
        if (this.world.isRoad(x, y) && !this.world.collidesBuilding(x, y, 16)) return { x, y };
      }
      return { x: 120, y: 120 };
    }

    spawnInitial() {
      while (this.vehicles.length < this.maxTraffic) {
        const p = this.randomRoadPoint();
        const v = new Vehicle(p.x, p.y, `hsl(${rand(0, 360)},65%,58%)`, true);
        v.angle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][Math.floor(rand(0, 4))];
        v.aiTarget = this.randomRoadPoint();
        this.vehicles.push(v);
      }
    }

    update(dt, particles, playerVehicle) {
      for (const v of this.vehicles) {
        if (v.exploded) continue;
        if (!v.aiTarget || dist(v, v.aiTarget) < 70) v.aiTarget = this.randomRoadPoint();
        const desired = angleTo(v, v.aiTarget);
        let da = desired - v.angle;
        da = Math.atan2(Math.sin(da), Math.cos(da));

        const near = this.vehicles.find((o) => o !== v && !o.exploded && dist(v, o) < 70);
        const input = {
          up: true,
          down: false,
          left: da < -0.1,
          right: da > 0.1,
          handbrake: false,
        };
        if (near) input.up = false;
        if (playerVehicle && dist(v, playerVehicle) < 60) input.up = false;
        v.applyInput(input, dt);
        v.update(this.world, dt, particles);
      }

      this.vehicles = this.vehicles.filter((v) => !(v.exploded && Math.random() < 0.03));
      while (this.vehicles.length < this.maxTraffic) {
        const p = this.randomRoadPoint();
        this.vehicles.push(new Vehicle(p.x, p.y, `hsl(${rand(0, 360)},65%,58%)`, true));
      }
    }

    draw(ctx, camera) {
      this.vehicles.forEach((v) => v.draw(ctx, camera));
    }

    nearestEnterable(player, maxDist = 54) {
      return this.vehicles.find((v) => !v.driver && !v.exploded && dist(player, v) < maxDist);
    }
  }

  window.Vehicle = Vehicle;
  window.TrafficManager = TrafficManager;
})();
