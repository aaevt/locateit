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

        // Stairs
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
      if (stairA.id !== stairB.id && stairA.x === stairB.x && stairA.y === stairB.y && Math.abs(stairA.floor - stairB.floor) === 1) {
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
          graph.addEdge(roomA.id, doorBetween.id, Math.hypot(roomA.x - doorBetween.x, roomA.y - doorBetween.y));
          graph.addEdge(doorBetween.id, roomB.id, Math.hypot(roomB.x - doorBetween.x, roomB.y - doorBetween.y));
        } else {
          graph.addEdge(roomA.id, roomB.id, Math.hypot(roomA.x - roomB.x, roomA.y - roomB.y));
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

export function PathfinderApp() {
  const [algorithm, setAlgorithm] = useState('astar');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<{ path: PathNode[]; visitedNodes: PathNode[] } | null>(null);
  const [floorsData, setFloorsData] = useState<unknown>(null);
  const [rooms, setRooms] = useState<PathNode[]>([]);
  const [floors, setFloors] = useState<{ id: string, number: number, name?: string }[]>([]);
  const [currentFloorId, setCurrentFloorId] = useState<string>('');

  let graph: Graph;
  let canvasJson: CanvasJson | null = null;
  let walls: { x1: number, y1: number, x2: number, y2: number, floor: number }[] = [];

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
    }
  } else {
    graph = new Graph();
  }

  const pathPoints = result?.path ? buildPathPoints(result.path) : [];

function handleFindPath() {
  if (!start || !end) return;

  const startNode = graph.nodes[start];
  const endNode = graph.nodes[end];
  if (!startNode || !endNode) return;

  const algo = algorithm === 'astar' ? new AStar(graph) : new Dijkstra(graph);

  if (startNode.floor === endNode.floor) {
    setResult(algo.findPath(start, end));
    return;
  }

  const stairsStart = Object.values(graph.nodes).filter(n => n.type === 'stairs' && n.floor === startNode.floor);
  const stairsEnd = Object.values(graph.nodes).filter(n => n.type === 'stairs' && n.floor === endNode.floor);

  if (!stairsStart.length || !stairsEnd.length) {
    setResult(null);
    return;
  }

  const bestStairStart = stairsStart.reduce((closest, stair) => {
    const d = Math.hypot(stair.x - startNode.x, stair.y - startNode.y);
    const dc = Math.hypot(closest.x - startNode.x, closest.y - startNode.y);
    return d < dc ? stair : closest;
  }, stairsStart[0]);

  const bestStairEnd = stairsEnd.reduce((closest, stair) => {
    const d = Math.hypot(stair.x - endNode.x, stair.y - endNode.y);
    const dc = Math.hypot(closest.x - endNode.x, closest.y - endNode.y);
    return d < dc ? stair : closest;
  }, stairsEnd[0]);

  const part1 = algo.findPath(start, bestStairStart.id);
  const part2 = algo.findPath(bestStairStart.id, bestStairEnd.id);
  const part3 = algo.findPath(bestStairEnd.id, end);

  if (part1.path.length && part2.path.length && part3.path.length) {
    const fullPath = [
      ...part1.path,
      ...part2.path.slice(1),
      ...part3.path.slice(1)
    ];
    const allVisited = [
      ...part1.visitedNodes,
      ...part2.visitedNodes,
      ...part3.visitedNodes
    ];
    setResult({ path: fullPath, visitedNodes: allVisited });
  } else {
    setResult(null);
  }
}


  return (
    <div className="flex flex-1 bg-white dark:bg-black">
      <FloorSidebar
        floors={floors}
        currentFloorId={currentFloorId}
        onChange={setCurrentFloorId}
        className="h-full min-w-[260px] max-w-[320px] border-r-0 rounded-l-xl shadow-md bg-white dark:bg-neutral-900"
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
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
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
              <div className="flex-1 flex flex-col gap-6 min-h-0">
                <PathfindingVisualization
                  canvasJson={canvasJson}
                  pathPoints={pathPoints}
                  walls={walls.filter(w => {
                    const floor = floors.find(f => f.id === currentFloorId);
                    return floor && w.floor === floor.number;
                  })}
                />
                <PathfindingResult result={result} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
