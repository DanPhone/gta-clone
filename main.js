(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const { clamp, dist, Particle } = window.GameUtils;

  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false };

  const state = {
    w: 0,
    h: 0,
    world: null,
    player: null,
    traffic: null,
    combat: null,
    ai: null,
    mission: null,
    ui: null,
    particles: [],
    camera: { x: 0, y: 0 },
  };

  const resetGame = () => {
    state.world = new World();
    state.player = new Player(350, 350);
    state.traffic = new TrafficManager(state.world);
    state.combat = new CombatSystem();
    state.ai = new AIManager(state.world);
    state.mission = new MissionSystem(state.world);
    state.ui = new UI();
    state.particles = [];
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    state.w = canvas.width;
    state.h = canvas.height;
  }

  function inputFromKeys() {
    return {
      up: keys.has('w') || keys.has('arrowup'),
      down: keys.has('s') || keys.has('arrowdown'),
      left: keys.has('a') || keys.has('arrowleft'),
      right: keys.has('d') || keys.has('arrowright'),
      sprint: keys.has('shift'),
      handbrake: keys.has(' '),
    };
  }

  function collectPickups() {
    state.ai.pickups = state.ai.pickups.filter((p) => {
      if (dist(p, state.player) > 20) return true;
      if (p.type === 'cash') state.player.cash += p.value;
      if (p.type === 'ammo') state.player.ammo[state.player.activeWeapon()] += p.value;
      if (p.type === 'medkit') state.player.heal(p.value);
      if (p.type === 'armor') state.player.addArmor(p.value);
      if (p.type === 'weapon') {
        const available = ['smg', 'shotgun'];
        const unlock = available.find((w) => !state.player.weapons.includes(w));
        if (unlock) state.player.weapons.push(unlock);
      }
      return false;
    });
  }

  function update(dt) {
    const input = inputFromKeys();
    const p = state.player;
    if (!p.alive) return;

    const wx = mouse.x + state.camera.x;
    const wy = mouse.y + state.camera.y;
    p.angle = Math.atan2(wy - p.y, wx - p.x);

    if (p.vehicle) {
      p.x = p.vehicle.x;
      p.y = p.vehicle.y;
      p.vehicle.applyInput(input, dt);
      p.vehicle.update(state.world, dt, state.particles);
      if (keys.has('e')) {
        keys.delete('e');
        p.vehicle.driver = null;
        p.vehicle = null;
      }
    } else {
      p.updateOnFoot(input, state.world, dt);
      if (keys.has('e')) {
        keys.delete('e');
        const v = state.traffic.nearestEnterable(p);
        if (v) {
          p.vehicle = v;
          v.driver = p;
        }
      }
    }

    if (mouse.down && p.ammo[p.activeWeapon()] > 0) {
      if (state.combat.fire(p, p.activeWeapon(), wx, wy, 'player')) {
        p.ammo[p.activeWeapon()]--;
        p.wanted = clamp(p.wanted + 0.02, 0, 5);
      }
    }

    state.traffic.update(dt, state.particles, p.vehicle);
    state.ai.update(dt, p, state.combat, state.particles);

    if (p.wanted > 1.1 && state.ai.police.length < Math.floor(p.wanted) + 1 && Math.random() < 0.02) state.ai.spawnPoliceNear(p);

    state.combat.update(dt, state.world, [
      { ...p, team: 'player', takeDamage: (d) => p.takeDamage(d), alive: p.alive },
      ...state.ai.gangs,
      ...state.ai.police,
    ], state.traffic.vehicles, state.particles);

    const defeated = state.ai.gangs.filter((g) => !g.alive).length + state.ai.police.filter((q) => !q.alive).length;
    p.score = defeated * 25 + Math.floor(p.cash / 2);

    collectPickups();
    if (Math.random() < 0.002) state.ai.pickups.push({ x: p.x + (Math.random() - 0.5) * 250, y: p.y + (Math.random() - 0.5) * 250, type: 'weapon', value: 1 });

    state.mission.update(dt, p, state.ai, (reward) => {
      p.cash += reward;
      p.score += reward;
      p.wanted = clamp(p.wanted + 0.4, 0, 5);
    });

    p.wanted = clamp(p.wanted - dt * 0.02, 0, 5);
    state.particles = state.particles.filter((pt) => pt.update(dt));

    state.camera.x = clamp(p.x - state.w / 2, 0, state.world.width - state.w);
    state.camera.y = clamp(p.y - state.h / 2, 0, state.world.height - state.h);
  }

  function draw() {
    state.world.draw(ctx, state.camera, state.w, state.h);
    state.mission.drawWorld(ctx, state.camera);
    state.traffic.draw(ctx, state.camera);
    state.ai.draw(ctx, state.camera);
    state.player.draw(ctx, state.camera);
    state.combat.draw(ctx, state.camera);
    state.particles.forEach((p) => p.draw(ctx, state.camera));
    state.ui.draw(ctx, state);
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys.add(key);
    if (key === 'q') state.player.cycleWeapon();
    if (key === 'r') resetGame();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mousedown', () => (mouse.down = true));
  canvas.addEventListener('mouseup', () => (mouse.down = false));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  resize();
  resetGame();
  requestAnimationFrame(loop);
})();
