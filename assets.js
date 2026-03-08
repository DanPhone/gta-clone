(() => {
  const DISTRICTS = {
    downtown: { road: '#3f434a', ground: '#1e2127', accent: '#6c7a89', building: '#2d3138' },
    industrial: { road: '#4a443f', ground: '#2f2a24', accent: '#9f7f5b', building: '#4f4338' },
    suburb: { road: '#3c4a3f', ground: '#243228', accent: '#80aa79', building: '#4a634e' },
    waterfront: { road: '#384756', ground: '#1d2e3d', accent: '#66a8c8', building: '#3a5468' },
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

  class Particle {
    constructor(x, y, vx, vy, life, color, size = 2) {
      Object.assign(this, { x, y, vx, vy, life, maxLife: life, color, size });
    }
    update(dt) {
      this.life -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.96;
      this.vy *= 0.96;
      return this.life > 0;
    }
    draw(ctx, camera) {
      const a = this.life / this.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - camera.x, this.y - camera.y, this.size * a, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  window.GameUtils = { DISTRICTS, rand, clamp, dist, angleTo, Particle };
})();
