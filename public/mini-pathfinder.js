// mini-pathfinder.js
(function(){
  window.MiniPathfinder = function(paths, floors, rooms) {
    // Создаем интерфейс
    const container = document.getElementById('mini-pathfinder-embed');
    if (!container) return;
    container.innerHTML = `
      <div style="max-width:1100px;margin:0 auto">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <label>Этаж: <select id="mp-floor">${floors.map(f => `<option value="${f.id}">${f.name || f.id}</option>`).join('')}</select></label>
          <label>Откуда: <select id="mp-start">${rooms.map(r => `<option value="${r.id}">${r.label || r.id} (этаж ${r.floor})</option>`).join('')}</select></label>
          <label>Куда: <select id="mp-end">${rooms.map(r => `<option value="${r.id}">${r.label || r.id} (этаж ${r.floor})</option>`).join('')}</select></label>
          <button id="mp-show-path" style="padding:4px 12px;border-radius:6px;border:1px solid #1976d2;background:#e3eafe;color:#1976d2;font-weight:600;cursor:pointer">Показать путь</button>
        </div>
        <div id="mp-svg-container" style="min-height:400px"></div>
      </div>
    `;
    function showPath() {
      const floor = document.getElementById('mp-floor').value;
      const start = document.getElementById('mp-start').value;
      const end = document.getElementById('mp-end').value;
      const svg = paths.find(p => String(p.floor) === String(floor) && p.start === start && p.end === end)?.svg;
      document.getElementById('mp-svg-container').innerHTML = svg || '<div style="color:#888;padding:40px;text-align:center">Нет маршрута</div>';
    }
    document.getElementById('mp-show-path').onclick = showPath;
    document.getElementById('mp-floor').onchange = showPath;
    document.getElementById('mp-start').onchange = showPath;
    document.getElementById('mp-end').onchange = showPath;
    setTimeout(showPath, 100);
  };
  // Автоматическая инициализация, если контейнер есть и данных нет
  document.addEventListener('DOMContentLoaded', function() {
    if (window.EmbedPathfinderData) {
      window.MiniPathfinder(
        window.EmbedPathfinderData.paths,
        window.EmbedPathfinderData.floors,
        window.EmbedPathfinderData.rooms
      );
    } else if (document.getElementById('mini-pathfinder-embed')) {
      fetch('/mini-pathfinder-data.json')
        .then(r => r.json())
        .then(data => {
          window.MiniPathfinder(data.paths, data.floors, data.rooms);
        });
    }
  });
})();
