"use client";
import { Separator } from "@/components/ui/separator";
import { PathfinderSVG } from "./PathfinderSVG";
import type { CanvasJson } from "./PathfinderSVG";
import { Card, CardContent } from "@/components/ui/card";
import type { FloorGrid, GridCell } from "./PathfinderApp";

interface PathfindingVisualizationProps {
  canvasJson: CanvasJson | null;
  pathPoints: { x: number; y: number }[];
  debugGrid?: boolean;
  grid?: FloorGrid | null;
}

export function PathfindingVisualization({ canvasJson, pathPoints, debugGrid, grid }: PathfindingVisualizationProps) {
  let width = 1000;
  let height = 1000;
  if (canvasJson && Array.isArray(canvasJson.objects)) {
    const maxX = Math.max(...canvasJson.objects.map(obj => {
      if (obj.type === 'room' || obj.type === 'stairs') {
        return Math.round(obj.left) + (typeof obj.width === 'number' ? Math.round(obj.width) : 0);
      }
      if ('left' in obj) return Math.round(obj.left);
      return 0;
    }));
    const maxY = Math.max(...canvasJson.objects.map(obj => {
      if (obj.type === 'room' || obj.type === 'stairs') {
        return Math.round(obj.top) + (typeof obj.height === 'number' ? Math.round(obj.height) : 0);
      }
      if ('top' in obj) return Math.round(obj.top);
      return 0;
    }));
    width = Math.max(width, maxX + 50);
    height = Math.max(height, maxY + 50);
  }
  return (
    <Card className="my-6">
      <CardContent>
        <Separator className="mb-6" />
        <div className="flex flex-col items-center">
          {canvasJson ? (
            <div style={{ position: 'relative', width, height }}>
              <PathfinderSVG canvasJson={canvasJson} path={pathPoints} width={width} height={height} />
              {debugGrid && grid && (
                <svg
                  width={width}
                  height={height}
                  style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 10 }}
                >
                  {grid.cells.flat().map((cell: GridCell) => (
                    <rect
                      key={`cell-${cell.x}-${cell.y}`}
                      x={cell.x * 20}
                      y={cell.y * 20}
                      width={20}
                      height={20}
                      fill={cell.type === 'wall' ? 'rgba(255,0,0,0.25)' : cell.type === 'stairs' ? 'rgba(255,165,0,0.18)' : cell.type === 'room' ? 'rgba(30,144,255,0.10)' : 'none'}
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth={1}
                    />
                  ))}
                </svg>
              )}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center h-[400px] text-neutral-400 text-lg">
              Загрузите этажи и выберите этаж для визуализации плана
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
