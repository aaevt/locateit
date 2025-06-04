import type { CanvasJson } from "../components/PathfinderSVG";

type FloorType = { id: string; number: number; name?: string; canvasJson: CanvasJson };
type RoomType = { id: string; x: number; y: number; floor: number; type: string; label?: string; floors?: number[] };
type GenerateGrid = (canvasJson: CanvasJson, floorId: string, floorNumber: number, gridSize?: number) => unknown;
type GridAStar = (grid: unknown[][], start: { x: number; y: number }, end: { x: number; y: number }, allowTypes?: string[]) => { x: number; y: number }[];

// Вспомогательная функция для генерации SVG (копия логики PathfinderSVG, но без React)
function generateSVG(canvasJson: CanvasJson, path: { x: number; y: number }[] = [], width = 1000, height = 1000): string {
  // Вычисление размеров SVG
  let maxX = 0, maxY = 0;
  for (const obj of canvasJson.objects) {
    if (obj.type === 'room' || obj.type === 'stairs') {
      maxX = Math.max(maxX, Math.round(obj.left) + (typeof obj.width === 'number' ? Math.round(obj.width) : 0));
      maxY = Math.max(maxY, Math.round(obj.top) + (typeof obj.height === 'number' ? Math.round(obj.height) : 0));
    } else if ('left' in obj && 'top' in obj) {
      maxX = Math.max(maxX, Math.round(obj.left));
      maxY = Math.max(maxY, Math.round(obj.top));
    }
  }
  width = Math.max(width, maxX + 50);
  height = Math.max(height, maxY + 50);

  // Вспомогательные функции для отрисовки
  function round(value: number, step = 1) { return Math.round(value / step) * step; }
  function adjustPosition(left: number, top: number, width = 0, height = 0, originX = 'left', originY = 'top') {
    let x = left, y = top;
    if (originX === 'center') x -= width / 2;
    else if (originX === 'right') x -= width;
    if (originY === 'center') y -= height / 2;
    else if (originY === 'bottom') y -= height;
    return { x: round(x), y: round(y) };
  }

  // Генерация SVG-элементов
  let svg = `<svg width="${width}" height="${height}" style="background:#f8fafc;border-radius:16px;box-shadow:0 2px 8px #0001;max-width:100%" xmlns="http://www.w3.org/2000/svg">`;
  // Комнаты
  for (const obj of canvasJson.objects) {
    if (obj.type === 'room') {
      const w = round(obj.width ?? 100, 10);
      const h = round(obj.height ?? 100, 10);
      const { x, y } = adjustPosition(obj.left, obj.top, w, h, obj.originX, obj.originY);
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e3eafe" stroke="#1976d2" stroke-width="2" rx="12" />`;
      svg += `<text x="${x + w / 2}" y="${y + 20}" text-anchor="middle" font-size="18" fill="#1976d2" font-weight="700">${obj.label || 'Кабинет'}</text>`;
    }
  }
  // Стены
  for (const obj of canvasJson.objects) {
    if (obj.type === 'Line' && obj.stroke === 'black') {
      const x1 = round(obj.left, 10), y1 = round(obj.top, 10);
      // LineObj: x1/y1/x2/y2 - относительные, width/height нет, рисуем по left/top + x1/y1/x2/y2
      const lx1 = x1 + (obj.x1 ?? 0), ly1 = y1 + (obj.y1 ?? 0);
      const lx2 = x1 + (obj.x2 ?? 0), ly2 = y1 + (obj.y2 ?? 0);
      svg += `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#000" stroke-width="${obj.strokeWidth ?? 4}" />`;
    }
  }
  // Двери
  for (const obj of canvasJson.objects) {
    if (obj.type === 'Line' && obj.stroke === 'brown') {
      const x1 = round(obj.left, 10), y1 = round(obj.top, 10);
      const lx1 = x1 + (obj.x1 ?? 0), ly1 = y1 + (obj.y1 ?? 0);
      const lx2 = x1 + (obj.x2 ?? 0), ly2 = y1 + (obj.y2 ?? 0);
      svg += `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#8d6e63" stroke-width="${obj.strokeWidth ?? 4}" stroke-dasharray="${obj.strokeDashArray?.join(',') ?? '10,5'}" />`;
    }
  }
  // Лестницы
  for (const obj of canvasJson.objects) {
    if (obj.type === 'stairs') {
      const w = round(obj.width ?? 60, 10);
      const h = round(obj.height ?? 60, 10);
      const { x, y } = adjustPosition(obj.left, obj.top, w, h, obj.originX, obj.originY);
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff3e0" stroke="#ffa726" stroke-width="2" rx="8" />`;
      svg += `<g><circle cx="${x + w / 2}" cy="${y + h / 2}" r="12" fill="#ffa726" opacity="0.7" /></g>`;
    }
  }
  // Путь
  if (path && path.length > 1) {
    svg += `<polyline points="${path.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')}" fill="none" stroke="red" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity="0.9" stroke-dasharray="12,8" />`;
  }
  svg += `</svg>`;
  return svg;
}

// Главная функция: рассчитывает все пути и генерирует embed-код
export function generateAllRoomPathsEmbedCode(
  floorsData: { floors: FloorType[] } | null,
  rooms: RoomType[],
  floors: FloorType[],
  generateGrid: GenerateGrid,
  gridAStar: GridAStar
): string {
  if (!floorsData || !rooms.length || !floors.length) return '';
  const paths: { floor: number; start: string; end: string; svg: string }[] = [];
  const gridSize = 20;
  const roomsByFloor: Record<number, RoomType[]> = {};
  for (const room of rooms) {
    if (!roomsByFloor[room.floor]) roomsByFloor[room.floor] = [];
    roomsByFloor[room.floor].push(room);
  }
  for (const floor of floors) {
    const floorRooms = roomsByFloor[floor.number]?.filter(r => r.type === 'room') || [];
    for (let i = 0; i < floorRooms.length; i++) {
      for (let j = 0; j < floorRooms.length; j++) {
        if (i === j) continue;
        const startRoom = floorRooms[i];
        const endRoom = floorRooms[j];
        const floorObj = floorsData.floors.find((f) => f.number === floor.number);
        if (!floorObj) continue;
        const grid = generateGrid(floorObj.canvasJson, floorObj.id, floor.number) as { cells: unknown[][] };
        const sx = Math.round(startRoom.x / gridSize);
        const sy = Math.round(startRoom.y / gridSize);
        const ex = Math.round(endRoom.x / gridSize);
        const ey = Math.round(endRoom.y / gridSize);
        const path = gridAStar(grid.cells, { x: sx, y: sy }, { x: ex, y: ey });
        const pathPoints = path.map((p: { x: number; y: number }) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2 }));
        paths.push({
          floor: floor.number,
          start: startRoom.id,
          end: endRoom.id,
          svg: generateSVG(floorObj.canvasJson, pathPoints)
        });
      }
    }
  }
  for (let f1 = 0; f1 < floors.length; f1++) {
    for (let f2 = 0; f2 < floors.length; f2++) {
      if (f1 === f2) continue;
      const floor1 = floors[f1], floor2 = floors[f2];
      const rooms1 = roomsByFloor[floor1.number]?.filter(r => r.type === 'room') || [];
      const rooms2 = roomsByFloor[floor2.number]?.filter(r => r.type === 'room') || [];
      const stairsOnStart = rooms.filter((r) => r.type === 'stairs' && r.floor === floor1.number && r.floors && r.floors.includes(floor2.number));
      const stairsOnEnd = rooms.filter((r) => r.type === 'stairs' && r.floor === floor2.number && r.floors && r.floors.includes(floor1.number));
      if (!stairsOnStart.length || !stairsOnEnd.length) continue;
      for (const startRoom of rooms1) {
        for (const endRoom of rooms2) {
          let minTotal = Infinity, bestPair: { s1: RoomType; s2: RoomType } | null = null;
          function dist(a: RoomType, b: RoomType) { return Math.hypot(a.x - b.x, a.y - b.y); }
          for (const s1 of stairsOnStart) {
            for (const s2 of stairsOnEnd) {
              if (s1.id === s2.id || (s1.label && s1.label === s2.label)) {
                const d1 = dist(startRoom, s1);
                const d2 = dist(endRoom, s2);
                if (d1 + d2 < minTotal) {
                  minTotal = d1 + d2;
                  bestPair = { s1, s2 };
                }
              }
            }
          }
          if (!bestPair) {
            let minD1 = Infinity, minD2 = Infinity, s1best = stairsOnStart[0], s2best = stairsOnEnd[0];
            for (const s1 of stairsOnStart) { const d1 = dist(startRoom, s1); if (d1 < minD1) { minD1 = d1; s1best = s1; } }
            for (const s2 of stairsOnEnd) { const d2 = dist(endRoom, s2); if (d2 < minD2) { minD2 = d2; s2best = s2; } }
            bestPair = { s1: s1best, s2: s2best };
          }
          const { s1, s2 } = bestPair!;
          const floorObj1 = floorsData.floors.find((f) => f.number === floor1.number);
          const grid1 = generateGrid(floorObj1!.canvasJson, floorObj1!.id, floor1.number) as { cells: unknown[][] };
          const sx = Math.round(startRoom.x / gridSize);
          const sy = Math.round(startRoom.y / gridSize);
          const s1x = Math.round(s1.x / gridSize);
          const s1y = Math.round(s1.y / gridSize);
          const path1 = gridAStar(grid1.cells, { x: sx, y: sy }, { x: s1x, y: s1y });
          const pathPoints1 = path1.map((p: { x: number; y: number }) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2 }));
          const floorObj2 = floorsData.floors.find((f) => f.number === floor2.number);
          const grid2 = generateGrid(floorObj2!.canvasJson, floorObj2!.id, floor2.number) as { cells: unknown[][] };
          const s2x = Math.round(s2.x / gridSize);
          const s2y = Math.round(s2.y / gridSize);
          const ex = Math.round(endRoom.x / gridSize);
          const ey = Math.round(endRoom.y / gridSize);
          const path2 = gridAStar(grid2.cells, { x: s2x, y: s2y }, { x: ex, y: ey });
          const pathPoints2 = path2.map((p: { x: number; y: number }) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2 }));
          paths.push({
            floor: floor1.number,
            start: startRoom.id,
            end: endRoom.id,
            svg: generateSVG(floorObj1!.canvasJson, pathPoints1)
          });
          paths.push({
            floor: floor2.number,
            start: startRoom.id,
            end: endRoom.id,
            svg: generateSVG(floorObj2!.canvasJson, pathPoints2)
          });
        }
      }
    }
  }
  // Формируем данные для передачи в компонент
  const embedData = {
    paths,
    floors: floors.map(f => ({ id: f.number, name: f.name })),
    rooms: rooms.filter(r => r.type === 'room').map(r => ({ id: r.id, label: r.label, floor: r.floor }))
  };
  // Генерируем HTML для вставки
  return `
<div id="mini-pathfinder-embed"></div>
<script src="/mini-pathfinder.js"></script>
<script>window.EmbedPathfinderData = ${JSON.stringify(embedData)};
window.addEventListener('DOMContentLoaded', function() {
  if (window.MiniPathfinder && window.EmbedPathfinderData) {
    window.MiniPathfinder(window.EmbedPathfinderData.paths, window.EmbedPathfinderData.floors, window.EmbedPathfinderData.rooms);
  }
});</script>
`;
}
