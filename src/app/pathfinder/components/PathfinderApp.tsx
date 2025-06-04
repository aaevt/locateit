"use client";
import { useState } from "react";
import { generateGrid, gridAStar } from "../utils/gridAStar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { FloorSidebar } from "./FloorSidebar";
import { PathfindingControls } from "./PathfindingControls";
import { PathfindingResult } from "./PathfindingResult";
import { PathfindingVisualization } from "./PathfindingVisualization";
import React from "react";
import { Button } from "@/components/ui/button";
import { InsertExportModal } from "./InsertExportModal";
import { generateEmbedCode, generateAllRoomPathsEmbedCode } from "../utils/generateEmbedCode";
import type { CanvasJson, RoomObj, LineObj, StairsObj } from "./PathfinderSVG";

export function PathfinderApp() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [floorsData, setFloorsData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [currentFloorId, setCurrentFloorId] = useState("");
  const [debugGrid, setDebugGrid] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  let canvasJson: any = null;
  let grid: any = null;

  if (floorsData) {
    if (rooms.length === 0 && floorsData.floors?.length) {
      const allRooms: any[] = [];
      for (const floor of floorsData.floors) {
        for (const obj of floor.canvasJson.objects) {
          if (obj.type === 'room' || obj.type === 'stairs') {
            allRooms.push({
              ...obj,
              id: obj.id || `${obj.type}_${floor.id}_${obj.left}_${obj.top}`,
              floor: floor.number,
              floorId: floor.id,
              x: obj.left + (obj.width ?? 100) / 2,
              y: obj.top + (obj.height ?? 100) / 2,
              type: obj.type
            });
          }
        }
      }
      setRooms(allRooms);
    }
    if (floors.length === 0 && floorsData.floors?.length) {
      setFloors(floorsData.floors.map((f: any) => ({ id: f.id, number: f.number, name: f.name })));
      setCurrentFloorId(floorsData.floors[0].id);
    }
    if (currentFloorId) {
      const data = floorsData as { floors: any[] };
      const floor = data.floors.find((f) => f.id === currentFloorId);
      if (floor) canvasJson = floor.canvasJson;
      if (canvasJson) grid = generateGrid(canvasJson, currentFloorId, floor?.number ?? 1);
    }
  }

  // Вспомогательный тип для этажа
  type FloorType = { id: string; number: number; name?: string; canvasJson?: unknown };
  // Вспомогательный тип для точки пути/комнаты/лестницы
  type RoomType = { id: string; x: number; y: number; floor: number; type: string; label?: string; floors?: number[] };
  type PathPoint = { x: number; y: number; id: string; floor: number; type: string };
  // Вспомогательная функция для расстояния между точками
  function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // Исправляем типизацию для поиска номера этажа по id
  const getCurrentFloorNumber = () => {
    const found = floors.find((f: FloorType) => f.id === currentFloorId);
    return found ? found.number : undefined;
  };

  const pathPoints = result && result.pathByFloor && floors.length && currentFloorId
    ? result.pathByFloor[getCurrentFloorNumber() ?? -1] || []
    : [];

  function handleFindPathGrid() {
    if (!start || !end || !floorsData || !rooms.length || !floors.length) return;
    const startRoom = rooms.find((r: RoomType) => r.id === start);
    const endRoom = rooms.find((r: RoomType) => r.id === end);
    if (!startRoom || !endRoom) return;
    const pathByFloor: Record<number, PathPoint[]> = {};
    const gridSize = 20;
    const data = floorsData;
    if (startRoom.floor === endRoom.floor) {
      // --- На одном этаже ---
      const floor = data.floors.find((f: FloorType) => f.number === startRoom.floor);
      if (!floor) return;
      const grid = generateGrid(floor.canvasJson, floor.id, startRoom.floor ?? 1);
      const sx = Math.round(startRoom.x / gridSize);
      const sy = Math.round(startRoom.y / gridSize);
      const ex = Math.round(endRoom.x / gridSize);
      const ey = Math.round(endRoom.y / gridSize);
      const path = gridAStar(grid.cells, { x: sx, y: sy }, { x: ex, y: ey });
      pathByFloor[startRoom.floor] = path.map((p: { x: number; y: number }, i: number) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_${i}_${p.x}_${p.y}`, floor: startRoom.floor, type: 'waypoint' }));
      setResult({ pathByFloor });
      return;
    }
    // --- Многоэтажный маршрут ---
    // 1. Найти лестницы, соединяющие оба этажа
    const stairsOnStart = rooms.filter((r: RoomType) => r.type === 'stairs' && r.floor === startRoom.floor && r.floors && r.floors.includes(endRoom.floor));
    const stairsOnEnd = rooms.filter((r: RoomType) => r.type === 'stairs' && r.floor === endRoom.floor && r.floors && r.floors.includes(startRoom.floor));
    if (!stairsOnStart.length || !stairsOnEnd.length) {
      alert("Нет лестницы, соединяющей эти этажи!");
      return;
    }
    // 2. Найти ближайшую лестницу к старту и к финишу
    let minTotal = Infinity, bestPair: { s1: RoomType; s2: RoomType } | null = null;
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
      // Если не совпали id/label, просто берём ближайшие по расстоянию
      let minD1 = Infinity, minD2 = Infinity, s1best = stairsOnStart[0], s2best = stairsOnEnd[0];
      for (const s1 of stairsOnStart) {
        const d1 = dist(startRoom, s1);
        if (d1 < minD1) { minD1 = d1; s1best = s1; }
      }
      for (const s2 of stairsOnEnd) {
        const d2 = dist(endRoom, s2);
        if (d2 < minD2) { minD2 = d2; s2best = s2; }
      }
      bestPair = { s1: s1best, s2: s2best };
    }
    const { s1, s2 } = bestPair;
    // 3. Путь на первом этаже: от startRoom до s1
    const floor1 = data.floors.find((f: FloorType) => f.number === startRoom.floor);
    if (!floor1) return;
    const grid1 = generateGrid(floor1.canvasJson, floor1.id, startRoom.floor ?? 1);
    const sx = Math.round(startRoom.x / gridSize);
    const sy = Math.round(startRoom.y / gridSize);
    const s1x = Math.round(s1.x / gridSize);
    const s1y = Math.round(s1.y / gridSize);
    const path1 = gridAStar(grid1.cells, { x: sx, y: sy }, { x: s1x, y: s1y });
    pathByFloor[startRoom.floor] = path1.map((p: { x: number; y: number }, i: number) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_${i}_${p.x}_${p.y}`, floor: startRoom.floor, type: 'waypoint' }));
    // 4. Путь на втором этаже: от s2 до endRoom
    const floor2 = data.floors.find((f: FloorType) => f.number === endRoom.floor);
    if (!floor2) return;
    const grid2 = generateGrid(floor2.canvasJson, floor2.id, endRoom.floor ?? 1);
    const s2x = Math.round(s2.x / gridSize);
    const s2y = Math.round(s2.y / gridSize);
    const ex = Math.round(endRoom.x / gridSize);
    const ey = Math.round(endRoom.y / gridSize);
    const path2 = gridAStar(grid2.cells, { x: s2x, y: s2y }, { x: ex, y: ey });
    pathByFloor[endRoom.floor] = path2.map((p: { x: number; y: number }, i: number) => ({ x: p.x * gridSize + gridSize/2, y: p.y * gridSize + gridSize/2, id: `waypoint_${i}_${p.x}_${p.y}`, floor: endRoom.floor, type: 'waypoint' }));
    setResult({ pathByFloor });
  }

  function handleFindPath() {
    handleFindPathGrid();
  }

  return (
    <div className="flex flex-1 bg-white dark:bg-black">
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
                onLoadFloors={(data) => {
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
              <div className="flex flex-row gap-2 mb-4">
                <Button variant="outline" onClick={() => setExportModalOpen(true)}>
                  Создать вставку
                </Button>
              </div>
              <div className="flex-1 flex flex-col gap-6 min-h-0">
                <PathfindingVisualization
                  canvasJson={canvasJson}
                  pathPoints={pathPoints}
                  debugGrid={debugGrid}
                  grid={grid}
                  currentFloorNumber={getCurrentFloorNumber()}
                />
                <PathfindingResult result={result} currentFloorNumber={getCurrentFloorNumber()} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <InsertExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onCalculatePaths={() => generateAllRoomPathsEmbedCode(floorsData, rooms, floors, generateGrid, gridAStar)}
      />
    </div>
  );
}
