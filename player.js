(() => {
  const { clamp } = window.GameUtils;

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 10;
      this.speed = 170;
      this.sprintMult = 1.6;
      this.angle = 0;
      this.health = 100;
      this.armor = 30;
      this.cash = 0;
      this.score = 0;
      this.wanted = 0;
      this.vehicle = null;
      this.alive = true;
      this.weapons = ['pistol'];
      this.currentWeapon = 0;
      this.ammo = { pistol: 250, smg: 120, shotgun: 40 };
      this.fireHeld = false;
    }

    activeWeapon() {
      return this.weapons[this.currentWeapon];
    }

    cycleWeapon() {
      this.currentWeapon = (this.currentWeapon + 1) % this.weapons.length;
    }

    takeDamage(amount) {
      const armorAbsorb = Math.min(this.armor, amount * 0.6);
      this.armor -= armorAbsorb;
      this.health -= amount - armorAbsorb;
      if (this.health <= 0) {
        this.health = 0;
        this.alive = false;
      }
    }

    heal(v) {
      this.health = clamp(this.health + v, 0, 100);
    }

    addArmor(v) {
      this.armor = clamp(this.armor + v, 0, 100);
    }

    updateOnFoot(input, world, dt) {
      const moving = Number(input.right) - Number(input.left);
      const movingY = Number(input.down) - Number(input.up);
      let vx = moving;
      let vy = movingY;
      const len = Math.hypot(vx, vy) || 1;
      vx /= len;
      vy /= len;
      const speed = this.speed * (input.sprint ? this.sprintMult : 1);
      const nx = this.x + vx * speed * dt;
      const ny = this.y + vy * speed * dt;
      if (!world.collidesBuilding(nx, this.y, this.radius)) this.x = nx;
      if (!world.collidesBuilding(this.x, ny, this.radius)) this.y = ny;
      this.x = clamp(this.x, 0, world.width);
      this.y = clamp(this.y, 0, world.height);
    }

    draw(ctx, camera) {
      if (!this.alive) return;
      ctx.save();
      ctx.translate(this.x - camera.x, this.y - camera.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = '#f2d7b6';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(13, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  window.Player = Player;
})();
