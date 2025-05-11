"use client";
import { Separator } from "@/components/ui/separator";
import { PathfinderSVG } from "./PathfinderSVG";
import type { CanvasJson } from "./PathfinderSVG";
import { Card, CardContent } from "@/components/ui/card";

interface PathfindingVisualizationProps {
  canvasJson: CanvasJson | null;
  pathPoints: { x: number; y: number }[];
  walls: { x1: number; y1: number; x2: number; y2: number }[];
}

export function PathfindingVisualization({ canvasJson, pathPoints, walls }: PathfindingVisualizationProps) {
  let width = 1000;
  let height = 1000;
  if (canvasJson && Array.isArray(canvasJson.objects)) {
    const maxX = Math.max(...canvasJson.objects.map(obj => 'left' in obj ? (Math.round(obj.left) + (Math.round(obj.width) || 0)) : 0));
    const maxY = Math.max(...canvasJson.objects.map(obj => 'top' in obj ? (Math.round(obj.top) + (Math.round(obj.height) || 0)) : 0));
    width = Math.max(width, maxX + 50);
    height = Math.max(height, maxY + 50);
  }
  return (
    <Card className="my-6">
      <CardContent>
        <Separator className="mb-6" />
        <div className="flex flex-col items-center">
          {canvasJson ? (
            <PathfinderSVG canvasJson={canvasJson} path={pathPoints} walls={walls} width={width} height={height} />
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
