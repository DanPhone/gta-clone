(() => {
  const { DISTRICTS, rand } = window.GameUtils;

  class World {
    constructor() {
      this.width = 4200;
      this.height = 3200;
      this.block = 200;
      this.road = 56;
      this.buildings = [];
      this.gangZones = [];
      this.districtRects = [
        { name: 'downtown', x: 0, y: 0, w: 2100, h: 1600 },
        { name: 'industrial', x: 2100, y: 0, w: 2100, h: 1600 },
        { name: 'suburb', x: 0, y: 1600, w: 2100, h: 1600 },
        { name: 'waterfront', x: 2100, y: 1600, w: 2100, h: 1600 },
      ];
      this.generate();
    }

    districtAt(x, y) {
      return this.districtRects.find((d) => x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h)?.name || 'downtown';
    }

    isRoad(x, y) {
      if (x < 0 || y < 0 || x > this.width || y > this.height) return false;
      return x % this.block < this.road || y % this.block < this.road;
    }

    generate() {
      this.buildings.length = 0;
      this.gangZones = [
        { x: 2450, y: 260, r: 270, district: 'industrial' },
        { x: 820, y: 2350, r: 290, district: 'suburb' },
        { x: 3300, y: 2150, r: 260, district: 'waterfront' },
      ];

      for (let x = 0; x < this.width; x += this.block) {
        for (let y = 0; y < this.height; y += this.block) {
          if (x % this.block < this.road || y % this.block < this.road) continue;
          const district = this.districtAt(x + this.block * 0.5, y + this.block * 0.5);
          const pad = district === 'downtown' ? 12 : 20;
          const w = this.block - this.road - pad * 2;
          const h = this.block - this.road - pad * 2;
          const bx = x + this.road + pad;
          const by = y + this.road + pad;
          this.buildings.push({ x: bx, y: by, w, h, district, roof: rand(0.2, 1) });
        }
      }
    }

    collidesBuilding(x, y, radius = 8) {
      return this.buildings.some((b) => x + radius > b.x && x - radius < b.x + b.w && y + radius > b.y && y - radius < b.y + b.h);
    }

    draw(ctx, camera, vw, vh) {
      ctx.fillStyle = '#202329';
      ctx.fillRect(0, 0, vw, vh);

      const startX = Math.floor(camera.x / this.block) * this.block;
      const startY = Math.floor(camera.y / this.block) * this.block;
      const endX = camera.x + vw + this.block;
      const endY = camera.y + vh + this.block;

      for (let x = startX; x < endX; x += this.block) {
        for (let y = startY; y < endY; y += this.block) {
          const district = this.districtAt(x + this.block / 2, y + this.block / 2);
          const pal = DISTRICTS[district];
          ctx.fillStyle = pal.ground;
          ctx.fillRect(x - camera.x, y - camera.y, this.block, this.block);
          ctx.fillStyle = pal.road;
          ctx.fillRect(x - camera.x, y - camera.y, this.road, this.block);
          ctx.fillRect(x - camera.x, y - camera.y, this.block, this.road);
        }
      }

      this.buildings.forEach((b) => {
        if (b.x + b.w < camera.x || b.y + b.h < camera.y || b.x > camera.x + vw || b.y > camera.y + vh) return;
        const pal = DISTRICTS[b.district];
        ctx.fillStyle = pal.building;
        ctx.fillRect(b.x - camera.x, b.y - camera.y, b.w, b.h);
        ctx.strokeStyle = pal.accent;
        ctx.strokeRect(b.x - camera.x + 4, b.y - camera.y + 4, b.w - 8, b.h - 8);
      });

      this.gangZones.forEach((z) => {
        ctx.fillStyle = 'rgba(255,70,70,0.08)';
        ctx.beginPath();
        ctx.arc(z.x - camera.x, z.y - camera.y, z.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  window.World = World;
})();
