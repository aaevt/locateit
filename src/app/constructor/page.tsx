"use client";

import React, { useState, useEffect, useRef } from "react";
import ConstructorHeader from "@/components/constructor/ConstructorHeader";
import Footer from "@/components/Footer";
import CanvasBuilder from "@/components/constructor/CanvasBuilder";
import CustomCanvas, { CanvasRef } from "@/components/constructor/CustomCanvas";
import { Skeleton } from "@/components/ui/skeleton"

export default function Constructor() {
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLayersbar, setShowLayersbar] = useState(true);
  const [activeFloorId, setActiveFloorId] = useState<string>("floor-0");
  const canvasRef = useRef<CanvasRef>(null);

  const handleCanvasSubmit = (
    width: number,
    height: number,
    backgroundColor: string,
    showGrid: boolean,
  ) => {
    setCanvasDimensions({ width, height });
    setShowGrid(showGrid);
    localStorage.setItem("canvasCreated", "true");
    localStorage.setItem("canvasBackgroundColor", backgroundColor);
    localStorage.setItem("canvasShowGrid", showGrid.toString());

    // Initialize the ground floor
    const groundFloor = {
      id: "floor-0",
      name: "Ground Floor",
      canvasState: "{}",
      history: ["{}"],
      historyIndex: 0
    };
    localStorage.setItem("canvasFloors", JSON.stringify([groundFloor]));
  };

  useEffect(() => {
    const canvasData = localStorage.getItem("canvasCreated");
    if (canvasData) {
      const savedWidth = localStorage.getItem("canvasWidth");
      const savedHeight = localStorage.getItem("canvasHeight");
      const savedShowGrid = localStorage.getItem("canvasShowGrid");
      if (savedWidth && savedHeight) {
        setCanvasDimensions({
          width: parseInt(savedWidth),
          height: parseInt(savedHeight),
        });
        setShowGrid(savedShowGrid === "true");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (canvasDimensions) {
      localStorage.setItem("canvasWidth", canvasDimensions.width.toString());
      localStorage.setItem("canvasHeight", canvasDimensions.height.toString());
    }
  }, [canvasDimensions]);

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    setScale((prevScale) => {
      const newScale = prevScale + event.deltaY * -0.001;
      return Math.min(Math.max(newScale, 0.5), 2);
    });
  };

  const handleNewCanvas = () => {
    setCanvasDimensions(null);
    localStorage.removeItem("canvasCreated");
    localStorage.removeItem("canvasWidth");
    localStorage.removeItem("canvasHeight");
    localStorage.removeItem("canvasBackgroundColor");
    localStorage.removeItem("canvasShowGrid");
    localStorage.removeItem("canvasFloors");
  };

  const handleFloorChange = (floorId: string) => {
    if (canvasRef.current) {
      canvasRef.current.saveCurrentState();
    }
    setActiveFloorId(floorId);
  };

  const handleSave = () => {
    // Save functionality is handled by the canvas component
  };

  const handleExportJSON = () => {
    // Export functionality is handled by the canvas component
  };

  const handleExportSVG = () => {
    // Export functionality is handled by the canvas component
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleCut = () => {
    canvasRef.current?.cut();
  };

  const handleCopy = () => {
    canvasRef.current?.copy();
  };

  const handlePaste = () => {
    canvasRef.current?.paste();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <ConstructorHeader />
        <main className="flex flex-grow flex-col items-center justify-center">
          <div className="flex space-x-2 justify-center items-center bg-white h-screen dark:invert">
            <Skeleton className="h-[600px] w-[800px]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <ConstructorHeader
        onNewCanvas={handleNewCanvas}
        onSave={handleSave}
        onExportJSON={handleExportJSON}
        onExportSVG={handleExportSVG}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleLayersbar={() => setShowLayersbar(!showLayersbar)}
      />
      <main className="flex flex-grow flex-col items-center m-10 overflow-hidden">
        {!canvasDimensions ? (
          <CanvasBuilder onSubmit={handleCanvasSubmit} />
        ) : (
          <div className="flex w-full h-full">
            <div className="flex-1">
              <CustomCanvas
                ref={canvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                backgroundColor={
                  localStorage.getItem("canvasBackgroundColor") || "#ffffff"
                }
                showGrid={showGrid}
                floorId={activeFloorId}
                onFloorChange={handleFloorChange}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
