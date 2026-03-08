(() => {
  const { clamp } = window.GameUtils;

  class UI {
    draw(ctx, game) {
      const { player, mission, world, camera, w, h } = game;
      const bar = (x, y, val, max, color, label) => {
        ctx.fillStyle = '#000a';
        ctx.fillRect(x, y, 210, 16);
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, clamp((val / max) * 206, 0, 206), 12);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${label}: ${Math.round(val)}`, x + 6, y + 12);
      };
      bar(16, 16, player.health, 100, '#ff6363', 'Health');
      bar(16, 36, player.armor, 100, '#74c3ff', 'Armor');

      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Cash $${player.cash}`, 16, 68);
      ctx.fillText(`Score ${player.score}`, 16, 86);
      ctx.fillText(`Wanted ${'★'.repeat(player.wanted) || 'none'}`, 16, 104);
      ctx.fillText(`Weapon ${player.activeWeapon()} (${player.ammo[player.activeWeapon()]})`, 16, 122);

      const m = mission.current;
      if (m) {
        ctx.fillText(`Mission: ${m.type.toUpperCase()} - ${m.text}`, 16, h - 58);
        if (m.type === 'delivery') ctx.fillText(`Stage: ${m.stage}`, 16, h - 40);
        if (m.timer !== undefined) ctx.fillText(`Timer: ${m.timer.toFixed(1)}s`, 16, h - 40);
        if (m.remaining !== undefined) ctx.fillText(`Remaining: ${m.remaining}`, 16, h - 40);
      }
      ctx.fillText('Move WASD/Arrows | Shift sprint | E enter/exit | Q weapon | LMB shoot | Space handbrake | R restart', 16, h - 16);

      this.drawMinimap(ctx, game, w - 190, 16, 170, 130);

      if (!player.alive) {
        ctx.fillStyle = '#0009';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('GAME OVER', w / 2 - 150, h / 2 - 10);
        ctx.font = '20px sans-serif';
        ctx.fillText('Press R to restart', w / 2 - 90, h / 2 + 28);
      }
    }

    drawMinimap(ctx, game, x, y, mw, mh) {
      const { world, player, ai, mission } = game;
      ctx.fillStyle = '#000a';
      ctx.fillRect(x, y, mw, mh);
      ctx.strokeStyle = '#fff6';
      ctx.strokeRect(x, y, mw, mh);
      const sx = mw / world.width;
      const sy = mh / world.height;
      world.gangZones.forEach((z) => {
        ctx.fillStyle = '#f4464633';
        ctx.beginPath();
        ctx.arc(x + z.x * sx, y + z.y * sy, z.r * sx, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#7ff';
      ctx.fillRect(x + player.x * sx - 2, y + player.y * sy - 2, 4, 4);
      ai.gangs.filter((g) => g.alive).forEach((g) => ctx.fillRect(x + g.x * sx - 1, y + g.y * sy - 1, 2, 2));
      const m = mission.current;
      if (m) {
        const p = m.pickup || m.drop || m.checkpoint || m.zone;
        if (p) {
          ctx.fillStyle = '#ffe36a';
          ctx.fillRect(x + p.x * sx - 2, y + p.y * sy - 2, 4, 4);
        }
      }
    }
  }

  window.UI = UI;
})();
