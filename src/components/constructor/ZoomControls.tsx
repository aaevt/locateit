"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"; // Иконки увеличения/уменьшения/reset

interface ZoomControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  fabricCanvas: fabric.Canvas | null;
  limitPan: () => void;
  drawGrid: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

export default function ZoomControls({
  zoom,
  setZoom,
  fabricCanvas,
  limitPan,
  drawGrid,
}: ZoomControlsProps) {
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, MAX_ZOOM);
    fabricCanvas?.setZoom(newZoom);
    limitPan();
    fabricCanvas?.requestRenderAll();
    drawGrid();
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, MIN_ZOOM);
    fabricCanvas?.setZoom(newZoom);
    limitPan();
    fabricCanvas?.requestRenderAll();
    drawGrid();
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    const newZoom = 1;
    fabricCanvas?.setZoom(newZoom);
    limitPan();
    fabricCanvas?.requestRenderAll();
    drawGrid();
    setZoom(newZoom);
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Увеличить</TooltipContent>
        </Tooltip>

        <div className="text-xs font-medium">{Math.round(zoom * 100)}%</div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Уменьшить</TooltipContent>
        </Tooltip>
        {/**/}
        {/* <Tooltip> */}
        {/*   <TooltipTrigger asChild> */}
        {/*     <Button size="icon" variant="ghost" onClick={handleResetZoom}> */}
        {/*       <Maximize className="h-4 w-4" /> */}
        {/*     </Button> */}
        {/*   </TooltipTrigger> */}
        {/*   <TooltipContent side="left">Сбросить масштаб</TooltipContent> */}
        {/* </Tooltip> */}
      </div>
    </TooltipProvider>
  );
}
