(() => {
  const { rand, dist } = window.GameUtils;

  class MissionSystem {
    constructor(world) {
      this.world = world;
      this.current = null;
      this.pool = ['delivery', 'race', 'survive', 'eliminate'];
      this.newMission();
    }

    randomRoad() {
      let p = null;
      for (let i = 0; i < 100; i++) {
        const x = rand(100, this.world.width - 100);
        const y = rand(100, this.world.height - 100);
        if (this.world.isRoad(x, y)) {
          p = { x, y };
          break;
        }
      }
      return p || { x: 200, y: 200 };
    }

    newMission() {
      const type = this.pool[Math.floor(rand(0, this.pool.length))];
      if (type === 'delivery') this.current = { type, stage: 'pickup', pickup: this.randomRoad(), drop: this.randomRoad(), reward: 180, text: 'Collect package then deliver.' };
      if (type === 'race') this.current = { type, checkpoint: this.randomRoad(), timer: 35, reward: 220, text: 'Reach checkpoint before time runs out.' };
      if (type === 'survive') this.current = { type, zone: this.randomRoad(), radius: 130, timer: 20, reward: 260, text: 'Stay alive inside zone.' };
      if (type === 'eliminate') this.current = { type, remaining: 5, reward: 240, text: 'Eliminate gang members.' };
      this.current.status = 'active';
    }

    update(dt, player, ai, onReward) {
      const m = this.current;
      if (!m || !player.alive) return;
      if (m.type === 'delivery') {
        const target = m.stage === 'pickup' ? m.pickup : m.drop;
        if (dist(player, target) < 40) {
          if (m.stage === 'pickup') m.stage = 'drop';
          else this.complete(onReward);
        }
      }
      if (m.type === 'race') {
        m.timer -= dt;
        if (dist(player, m.checkpoint) < 45) this.complete(onReward);
        if (m.timer <= 0) this.fail();
      }
      if (m.type === 'survive') {
        if (dist(player, m.zone) < m.radius) m.timer -= dt;
        if (m.timer <= 0) this.complete(onReward);
      }
      if (m.type === 'eliminate') {
        const dead = ai.gangs.filter((g) => !g.alive).length;
        m.remaining = Math.max(0, 5 - dead);
        if (m.remaining <= 0) this.complete(onReward);
      }
    }

    complete(onReward) {
      this.current.status = 'success';
      onReward(this.current.reward);
      setTimeout(() => this.newMission(), 1500);
    }

    fail() {
      this.current.status = 'failed';
      setTimeout(() => this.newMission(), 1400);
    }

    drawWorld(ctx, camera) {
      const m = this.current;
      if (!m) return;
      const marker = (p, color = '#ffe36a') => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, 22, 0, Math.PI * 2);
        ctx.stroke();
      };
      if (m.type === 'delivery') marker(m.stage === 'pickup' ? m.pickup : m.drop, m.stage === 'pickup' ? '#80ddff' : '#a8ff76');
      if (m.type === 'race') marker(m.checkpoint, '#ffd367');
      if (m.type === 'survive') {
        ctx.strokeStyle = '#ff9b67';
        ctx.beginPath();
        ctx.arc(m.zone.x - camera.x, m.zone.y - camera.y, m.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  window.MissionSystem = MissionSystem;
})();
