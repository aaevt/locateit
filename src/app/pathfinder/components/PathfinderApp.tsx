"use client";
import { useState } from "react";
import { Graph, PathNode } from "../types/graph";
import { Dijkstra, AStar } from "../algorithms/algorithms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { FloorSidebar } from "./FloorSidebar";
import { PathfindingControls } from "./PathfindingControls";
import { PathfindingResult } from "./PathfindingResult";
import { PathfindingVisualization } from "./PathfindingVisualization";
import type { CanvasJson } from "./PathfinderSVG";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

// Проверка пересечения двух отрезков
export function segmentsIntersect(a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }, d: { x: number, y: number }) {
  function ccw(p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }
  return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
}

// Проверка, пересекает ли путь стену
export function isPathBlocked(
  a: { x: number, y: number },
  b: { x: number, y: number },
  walls: { x1: number, y1: number, x2: number, y2: number, floor: number }[],
  floor: number
): boolean {
  for (const wall of walls) {
    if (wall.floor !== floor) continue;
    if (segmentsIntersect(a, b, { x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 })) {
      return true;
    }
  }
  return false;
}

// Типы для grid
export interface GridCell {
  x: number;
  y: number;
  type: 'wall' | 'room' | 'stairs' | 'empty';
}

export interface FloorGrid {
  floorId: string;
  floorNumber: number;
  width: number;
  height: number;
  cells: GridCell[][]; // cells[y][x]
}

// Генерация grid по canvasJson этажа
function generateGrid(canvasJson: CanvasJson, floorId: string, floorNumber: number, gridSize = 20): FloorGrid {
  // Определяем размеры grid
  let maxX = 0, maxY = 0;
  for (const obj of canvasJson.objects) {
    if ('left' in obj && 'top' in obj) {
      maxX = Math.max(maxX, obj.left + ('width' in obj ? obj.width ?? 0 : 0));
      maxY = Math.max(maxY, obj.top + ('height' in obj ? obj.height ?? 0 : 0));
    }
  }
  const width = Math.ceil(maxX / gridSize) + 2;
  const height = Math.ceil(maxY / gridSize) + 2;
  // Инициализация пустых ячеек
  const cells: GridCell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({ x, y, type: 'empty' as const }))
  );
  // Помечаем стены (логика как в SVG)
  for (const obj of canvasJson.objects) {
    if (obj.type === 'Line' && obj.stroke === 'black') {
      const line = obj as { left: number; top: number; width?: number; height?: number };
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
      // Брезенхем для стены
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
  // Помечаем комнаты
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
  // Помечаем лестницы
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

// Grid A* pathfinding
function gridAStar(grid: GridCell[][], start: { x: number, y: number }, end: { x: number, y: number }, allowTypes: GridCell['type'][] = ['room', 'stairs', 'empty']): { x: number, y: number }[] {
  const h = (a: { x: number, y: number }, b: { x: number, y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  type Node = { x: number, y: number, f: number, g: number, parent?: Node };
  const open: Node[] = [];
  const closed = new Set<string>();
  open.push({ ...start, f: h(start, end), g: 0 });
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    if (current.x === end.x && current.y === end.y) {
      // Восстановление пути
      const path: { x: number, y: number }[] = [];
      let node: Node | undefined = current;
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

function parseFloorsToGraph(floorsData: unknown): {
  graph: Graph,
  rooms: PathNode[],
  floors: { id: string, number: number, name?: string }[],
  walls: { x1: number, y1: number, x2: number, y2: number, floor: number }[]
} {
  if (!floorsData || typeof floorsData !== 'object' || !('floors' in floorsData)) {
    return { graph: new Graph(), rooms: [], floors: [], walls: [] };
  }

  const data = floorsData as { floors: Array<{ id: string; number: number; name?: string; canvasJson: { objects: unknown[] } }> };
  const graph = new Graph();
  const rooms: PathNode[] = [];
  const doors: PathNode[] = [];
  const stairs: PathNode[] = [];
  const floors: { id: string, number: number, name?: string }[] = [];
  const walls: { x1: number, y1: number, x2: number, y2: number, floor: number }[] = [];

  for (const floor of data.floors) {
    floors.push({ id: floor.id, number: floor.number, name: floor.name });
    const floorNum = floor.number;

    for (const obj of floor.canvasJson.objects) {
      if (obj && typeof obj === 'object' && 'type' in obj) {
        // Room
        if (obj.type === 'room' && 'left' in obj && 'top' in obj) {
          const roomObj = obj as { left: number; top: number; width?: number; height?: number; label?: string };
          const id = `${floor.id}_${roomObj.left}_${roomObj.top}`;
          const node: PathNode = {
            id,
            x: roomObj.left + (roomObj.width ? roomObj.width / 2 : 0),
            y: roomObj.top + (roomObj.height ? roomObj.height / 2 : 0),
            floor: floorNum,
            label: roomObj.label || id,
            type: 'room',
          };
          graph.addNode(node);
          rooms.push(node);
        }

        // Line (door or wall)
        else if (obj.type === 'Line' && 'left' in obj && 'top' in obj && 'x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj) {
          const lineObj = obj as {
            left: number; top: number;
            x1: number; y1: number; x2: number; y2: number;
            stroke?: string; strokeWidth?: number;
          };
          const isDoor = lineObj.stroke === 'brown' || (lineObj.strokeWidth && lineObj.strokeWidth >= 4);
          if (isDoor) {
            const doorId = `${floor.id}_door_${lineObj.left}_${lineObj.top}_${lineObj.x1}_${lineObj.y1}_${lineObj.x2}_${lineObj.y2}`;
            const node: PathNode = {
              id: doorId,
              x: lineObj.left + (lineObj.x1 + lineObj.x2) / 2,
              y: lineObj.top + (lineObj.y1 + lineObj.y2) / 2,
              floor: floorNum,
              label: 'Дверь',
              type: 'door',
            };
            graph.addNode(node);
            doors.push(node);
          } else {
            walls.push({
              x1: lineObj.left + lineObj.x1,
              y1: lineObj.top + lineObj.y1,
              x2: lineObj.left + lineObj.x2,
              y2: lineObj.top + lineObj.y2,
              floor: floorNum,
            });
          }
        }

        else if ((obj.type === 'stairs' || obj.type === 'stair') && 'left' in obj && 'top' in obj) {
          const stairObj = obj as { left: number; top: number; width?: number; height?: number; floors?: number[] };
          const stairFloors = stairObj.floors && Array.isArray(stairObj.floors) ? stairObj.floors : [floorNum];
          for (const stairFloor of stairFloors) {
            const stairId = `${floor.id}_stair_${stairObj.left}_${stairObj.top}_floor${stairFloor}`;
            const node: PathNode = {
              id: stairId,
              x: stairObj.left + (stairObj.width ?? 0) / 2,
              y: stairObj.top + (stairObj.height ?? 0) / 2,
              floor: stairFloor,
              label: 'Лестница',
              type: 'stairs',
            };
            graph.addNode(node);
            stairs.push(node);
          }
        }
      }
    }
  }

  for (const door of doors) {
    const candidates = rooms.filter(r => r.floor === door.floor);
    const sorted = candidates.map(r => ({ r, dist: Math.hypot(r.x - door.x, r.y - door.y) })).sort((a, b) => a.dist - b.dist);
    if (sorted[0]) graph.addEdge(door.id, sorted[0].r.id, sorted[0].dist);
    if (sorted[1]) graph.addEdge(door.id, sorted[1].r.id, sorted[1].dist);
  }

  for (const stair of stairs) {
    const candidates = rooms.filter(r => r.floor === stair.floor);
    const sorted = candidates.map(r => ({ r, dist: Math.hypot(r.x - stair.x, r.y - stair.y) })).sort((a, b) => a.dist - b.dist);
    if (sorted[0]) graph.addEdge(stair.id, sorted[0].r.id, sorted[0].dist);
    if (sorted[1]) graph.addEdge(stair.id, sorted[1].r.id, sorted[1].dist);
  }

  for (const stairA of stairs) {
    for (const stairB of stairs) {
      if (
        stairA.id !== stairB.id &&
        stairA.x === stairB.x &&
        stairA.y === stairB.y &&
        stairA.floor !== undefined &&
        stairB.floor !== undefined &&
        Math.abs(stairA.floor - stairB.floor) === 1
      ) {
        graph.addEdge(stairA.id, stairB.id, 1);
      }
    }
  }

  for (const roomA of rooms) {
    for (const roomB of rooms) {
      if (roomA.id !== roomB.id && roomA.floor === roomB.floor) {
        const doorBetween = doors.find(door => {
          const distA = Math.hypot(roomA.x - door.x, roomA.y - door.y);
          const distB = Math.hypot(roomB.x - door.x, roomB.y - door.y);
          return distA < 60 && distB < 60;
        });
        if (doorBetween) {
          if (!isPathBlocked(roomA, doorBetween, walls, roomA.floor!)) {
            graph.addEdge(roomA.id, doorBetween.id, Math.hypot(roomA.x - doorBetween.x, roomA.y - doorBetween.y));
          }
          if (!isPathBlocked(roomB, doorBetween, walls, roomA.floor!)) {
            graph.addEdge(doorBetween.id, roomB.id, Math.hypot(roomB.x - doorBetween.x, roomB.y - doorBetween.y));
          }
        } else {
          if (!isPathBlocked(roomA, roomB, walls, roomA.floor!)) {
            graph.addEdge(roomA.id, roomB.id, Math.hypot(roomA.x - roomB.x, roomA.y - roomB.y));
          }
        }
      }
    }
  }

  return { graph, rooms, floors, walls };
}

function buildPathPoints(path: PathNode[]): { x: number, y: number }[] {
  if (path.length < 2) return path.map(p => ({ x: p.x, y: p.y }));
  const points: { x: number, y: number }[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const curr = path[i];
    const next = path[i + 1];
    points.push({ x: curr.x, y: curr.y });
    points.push({ x: next.x, y: next.y });
  }
  return points;
}

function exportAllPaths(graph: Graph, rooms: PathNode[]) {
  const paths: Record<string, string[]> = {};
  const algo = new AStar(graph);

  for (const start of rooms) {
    for (const end of rooms) {
      if (start.id !== end.id) {
        const res = algo.findPath(start.id, end.id);
        if (res.path.length) {
          paths[`${start.id}_${end.id}`] = res.path.map(n => n.id);
        }
      }
    }
  }

  const js = `\n// Pathfinder Embed\nwindow.PATHFINDER_PATHS = ${JSON.stringify(paths, null, 2)};\nwindow.getPath = function(startId, endId) {\n  return window.PATHFINDER_PATHS[startId + "_" + endId] || [];\n};\n`;
  return js;
}

export function PathfinderApp() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<{ path: PathNode[]; visitedNodes: PathNode[] } | null>(null);
  const [floorsData, setFloorsData] = useState<unknown>(null);
  const [rooms, setRooms] = useState<PathNode[]>([]);
  const [floors, setFloors] = useState<{ id: string, number: number, name?: string }[]>([]);
  const [currentFloorId, setCurrentFloorId] = useState<string>('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportCode, setExportCode] = useState("");
  const [exportGenerated, setExportGenerated] = useState(false);
  const [debugGrid, setDebugGrid] = useState(false);

  let graph: Graph;
  let canvasJson: CanvasJson | null = null;
  let walls: { x1: number, y1: number, x2: number, y2: number, floor: number }[] = [];
  let grid: FloorGrid | null = null;

  if (floorsData) {
    const parsed = parseFloorsToGraph(floorsData);
    graph = parsed.graph;
    walls = parsed.walls;
    if (rooms.length === 0 && parsed.rooms.length > 0) setRooms(parsed.rooms);
    if (floors.length === 0 && parsed.floors.length > 0) {
      setFloors(parsed.floors);
      setCurrentFloorId(parsed.floors[0].id);
    }
    if (currentFloorId) {
      const data = floorsData as { floors: Array<{ id: string; canvasJson: CanvasJson }> };
      const floor = data.floors.find(f => f.id === currentFloorId);
      if (floor) canvasJson = floor.canvasJson;
      if (canvasJson) grid = generateGrid(canvasJson, currentFloorId, 1);
    }
  } else {
    graph = new Graph();
  }

  const pathPoints = result?.path ? buildPathPoints(result.path) : [];

  function handleFindPath() {
    handleFindPathGrid();
  }

  function handleFindPathGrid() {
    if (!start || !end || !canvasJson || !currentFloorId) return;
    const startRoom = rooms.find(r => r.id === start);
    const endRoom = rooms.find(r => r.id === end);
    if (!startRoom || !endRoom) return;
    if (startRoom.floor === endRoom.floor) {
      const grid = generateGrid(canvasJson, currentFloorId, startRoom.floor ?? 1);
      const gridSize = 20;
      const sx = Math.round(startRoom.x / gridSize);
      const sy = Math.round(startRoom.y / gridSize);
      const ex = Math.round(endRoom.x / gridSize);
      const ey = Math.round(endRoom.y / gridSize);
      const path = gridAStar(grid.cells, { x: sx, y: sy }, { x: ex, y: ey });
      setResult({
        path: path.map((p, i) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_${i}_${p.x}_${p.y}`, floor: startRoom.floor, type: 'waypoint' as const })),
        visitedNodes: []
      });
      return;
    }
    const stairsStart = rooms.filter(r => r.type === 'stairs' && r.floor === startRoom.floor);
    const stairsEnd = rooms.filter(r => r.type === 'stairs' && r.floor === endRoom.floor);
    // Пары лестниц с совпадающими координатами
    const matchingStairs = stairsStart.flatMap(stairA => {
      const match = stairsEnd.find(stairB =>
        Math.abs(stairA.x - stairB.x) < 1e-3 && Math.abs(stairA.y - stairB.y) < 1e-3
      );
      return match ? [{ stairA, stairB: match }] : [];
    });
    if (!matchingStairs.length) return; // Нет подходящей лестницы
    // Можно выбрать ближайшую к старту
    const { stairA: bestStairStart, stairB: bestStairEnd } = matchingStairs.reduce((closest, pair) => {
      const d = Math.hypot(pair.stairA.x - startRoom.x, pair.stairA.y - startRoom.y);
      const dc = Math.hypot(closest.stairA.x - startRoom.x, closest.stairA.y - startRoom.y);
      return d < dc ? pair : closest;
    }, matchingStairs[0]);
    // Путь на этаже старта: комната -> лестница
    const gridStart = generateGrid(canvasJson, currentFloorId, startRoom.floor ?? 1);
    const gridSize = 20;
    const sx = Math.round(startRoom.x / gridSize);
    const sy = Math.round(startRoom.y / gridSize);
    const stairSx = Math.round(bestStairStart.x / gridSize);
    const stairSy = Math.round(bestStairStart.y / gridSize);
    const path1 = gridAStar(gridStart.cells, { x: sx, y: sy }, { x: stairSx, y: stairSy });
    // Путь на этаже конца: лестница -> комната
    const data = floorsData as { floors: Array<{ id: string; canvasJson: CanvasJson }> };
    const floorEnd = data.floors.find(f => f.id === endRoom.id.split('_')[0]);
    if (!floorEnd) return;
    const gridEnd = generateGrid(floorEnd.canvasJson, floorEnd.id, endRoom.floor ?? 1);
    const stairEx = Math.round(bestStairEnd.x / gridSize);
    const stairEy = Math.round(bestStairEnd.y / gridSize);
    const ex = Math.round(endRoom.x / gridSize);
    const ey = Math.round(endRoom.y / gridSize);
    const path2 = gridAStar(gridEnd.cells, { x: stairEx, y: stairEy }, { x: ex, y: ey });
    // Склеиваем путь с уникальными id
    const fullPath = [
      ...path1.map((p, i) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_start_${i}_${p.x}_${p.y}`, floor: startRoom.floor, type: 'waypoint' as const })),
      ...path2.map((p, i) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_end_${i}_${p.x}_${p.y}`, floor: endRoom.floor, type: 'waypoint' as const }))
    ];
    setResult({ path: fullPath, visitedNodes: [] });
  }

  function handleExportGenerate() {
    if (!graph || !rooms.length) return;
    const js = exportAllPaths(graph, rooms);
    setExportCode(js);
    setExportGenerated(true);
  }

  function handleExportCopy() {
    if (!exportCode) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(exportCode);
      alert("JS-вставка скопирована в буфер обмена!");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = exportCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("JS-вставка скопирована в буфер обмена!");
      } catch {
        alert("Не удалось скопировать JS-вставку");
      }
      document.body.removeChild(textArea);
    }
  }

  return (
    <div className="flex flex-1 bg-white dark:bg-black">
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <FloorSidebar
          floors={floors}
          currentFloorId={currentFloorId}
          onChange={setCurrentFloorId}
        />
        <main className="flex-1 flex flex-col items-center justify-start w-full h-full pl-8 min-h-0">
          <div className="w-full h-full flex flex-col">
            <Card className="flex-1 flex flex-col shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl h-full font-bold">
                  <Search className="text-blue-600" />
                  Найти путь
                  <DialogTrigger asChild>
                    <Button
                      className="ml-auto"
                      variant="outline"
                      size="sm"
                      title="Экспортировать все пути как JS-вставку"
                    >
                      Экспортировать
                    </Button>
                  </DialogTrigger>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex h-full flex-col">
                <PathfindingControls
                  start={start}
                  setStart={setStart}
                  end={end}
                  setEnd={setEnd}
                  rooms={rooms}
                  floors={floors}
                  currentFloorId={currentFloorId}
                  onFindPath={handleFindPath}
                  onLoadFloors={(data: unknown) => {
                    setFloorsData(data);
                    setRooms([]);
                    setResult(null);
                    setStart('');
                    setEnd('');
                  }}
                  allowAllRooms
                />
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="debugGrid" checked={debugGrid} onChange={e => setDebugGrid(e.target.checked)} />
                  <label htmlFor="debugGrid" className="text-sm select-none cursor-pointer">Debug grid (показать сетку и стены)</label>
                </div>
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                  <PathfindingVisualization
                    canvasJson={canvasJson}
                    pathPoints={pathPoints}
                    debugGrid={debugGrid}
                    grid={grid}
                  />
                  <PathfindingResult result={result} />
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Экспорт JS-вставки</DialogTitle>
              <DialogDescription>
                Сгенерируйте и скопируйте код для вставки на другой сайт. Все пути будут предрассчитаны.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button onClick={handleExportGenerate} disabled={exportGenerated}>
                Сгенерировать
              </Button>
              <textarea
                className="w-full min-h-[180px] rounded border p-2 font-mono text-xs bg-neutral-100 dark:bg-neutral-900"
                value={exportCode}
                readOnly
                placeholder="Сначала нажмите 'Сгенерировать'"
                style={{ resize: 'vertical' }}
              />
              <DialogFooter>
                <Button onClick={handleExportCopy} disabled={!exportCode} variant="outline">
                  Скопировать
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary">Закрыть</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </main>
      </Dialog>
    </div>
  );
}
