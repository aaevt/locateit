export interface GridCell {
  x: number;
  y: number;
  type: string;
}

export interface Grid {
  floorId: string;
  floorNumber: number;
  width: number;
  height: number;
  cells: GridCell[][];
}

// Генерация grid по canvasJson
export function generateGrid(canvasJson: any, floorId: string, floorNumber: number, gridSize = 20): Grid {
  let maxX = 0, maxY = 0;
  for (const obj of canvasJson.objects) {
    if ('left' in obj && 'top' in obj) {
      maxX = Math.max(maxX, obj.left + ('width' in obj ? obj.width ?? 0 : 0));
      maxY = Math.max(maxY, obj.top + ('height' in obj ? obj.height ?? 0 : 0));
    }
  }
  const width = Math.ceil(maxX / gridSize) + 2;
  const height = Math.ceil(maxY / gridSize) + 2;
  const cells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({ x, y, type: 'empty' }))
  );
  // Стены
  for (const obj of canvasJson.objects) {
    if (obj.type === 'Line' && obj.stroke === 'black') {
      const line = obj;
      const x1 = Math.round(line.left / gridSize);
      const y1 = Math.round(line.top / gridSize);
      const w = Math.round((line.width ?? 0) / gridSize);
      const h = Math.round((line.height ?? 0) / gridSize);
      let x2 = x1, y2 = y1;
      if (w > h) {
        x2 = x1 + w;
      } else {
        y2 = y1 + h;
      }
      const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
      let err = dx - dy, cx = x1, cy = y1;
      while (true) {
        if (cells[cy] && cells[cy][cx]) cells[cy][cx].type = 'wall';
        if (cx === x2 && cy === y2) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 < dx) { err += dx; cy += sy; }
      }
    }
  }
  // Комнаты
  for (const obj of canvasJson.objects) {
    if (obj.type === 'room') {
      const left = Math.floor(obj.left / gridSize);
      const top = Math.floor(obj.top / gridSize);
      const w = Math.ceil((obj.width ?? 100) / gridSize);
      const h = Math.ceil((obj.height ?? 100) / gridSize);
      for (let y = top; y < top + h; y++) {
        for (let x = left; x < left + w; x++) {
          if (cells[y] && cells[y][x] && cells[y][x].type === 'empty') {
            cells[y][x].type = 'room';
          }
        }
      }
    }
  }
  // Лестницы
  for (const obj of canvasJson.objects) {
    if (obj.type === 'stairs') {
      const left = Math.floor(obj.left / gridSize);
      const top = Math.floor(obj.top / gridSize);
      const w = Math.ceil((obj.width ?? 60) / gridSize);
      const h = Math.ceil((obj.height ?? 60) / gridSize);
      for (let y = top; y < top + h; y++) {
        for (let x = left; x < left + w; x++) {
          if (cells[y] && cells[y][x]) {
            cells[y][x].type = 'stairs';
          }
        }
      }
    }
  }
  return { floorId, floorNumber, width, height, cells };
}

// A* поиск пути по grid
export function gridAStar(
  grid: GridCell[][],
  start: { x: number; y: number },
  end: { x: number; y: number },
  allowTypes = ['room', 'stairs', 'empty']
): { x: number; y: number }[] {
  const h = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const open: any[] = [];
  const closed = new Set();
  open.push({ ...start, f: h(start, end), g: 0 });
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (current.x === end.x && current.y === end.y) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }
    closed.add(`${current.x},${current.y}`);
    for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = current.x + dx, ny = current.y + dy;
      if (!grid[ny] || !grid[ny][nx]) continue;
      if (!allowTypes.includes(grid[ny][nx].type)) continue;
      if (closed.has(`${nx},${ny}`)) continue;
      const g = current.g + 1;
      const f = g + h({ x: nx, y: ny }, end);
      if (!open.some(n => n.x === nx && n.y === ny && n.g <= g)) {
        open.push({ x: nx, y: ny, f, g, parent: current });
      }
    }
  }
  return [];
}
