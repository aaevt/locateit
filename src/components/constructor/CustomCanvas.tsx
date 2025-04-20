"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas, Rect, Circle, FabricText, Line } from 'fabric'

import Toolbar from './Toolbar'
import Downloadbar from './Downloadbar'
import Layersbar from "./Layersbar";
import Room from './Objects/Room';
import Wall from './Objects/Wall';
import Stairs from './Objects/Stairs';
import Door from './Objects/Door';

interface CanvasProps {
  width: number;
  height: number;
  backgroundColor?: string | "ffffff";
  showGrid: boolean;
}

const CustomCanvas: React.FC<CanvasProps> = ({
  width, height, backgroundColor, showGrid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const gridSize = 50;

  const saveCanvasState = (canvas: Canvas) => {
    const canvasState = canvas.toJSON();
    localStorage.setItem("canvasState", JSON.stringify(canvasState));
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new Canvas(canvasRef.current!, {
      width,
      height,
      backgroundColor,
      showGrid,
    });


    const savedCanvasState = localStorage.getItem("canvasState");
    if (savedCanvasState) {
      newCanvas.loadFromJSON(JSON.parse(savedCanvasState), () => {
        newCanvas.renderAll();
      });
    }

    newCanvas.on('object:moving', (e) => {
      const object = e.target;
      if (object && showGrid) {
        const gridX = Math.round(object.left / gridSize) * gridSize;
        const gridY = Math.round(object.top / gridSize) * gridSize;
        object.set({
          left: gridX,
          top: gridY,
        });
    
        let angle = object.angle || 0;
        angle = Math.round(angle / 90) * 90;
        object.set({ angle });
    
        const bounds = object.getBoundingRect(true);
        const canvasWidth = newCanvas.getWidth();
        const canvasHeight = newCanvas.getHeight();
    
        if (bounds.left < 0) object.set('left', object.left - bounds.left);
        if (bounds.top < 0) object.set('top', object.top - bounds.top);
        if (bounds.left + bounds.width > canvasWidth) {
          object.set('left', object.left - (bounds.left + bounds.width - canvasWidth));
        }
        if (bounds.top + bounds.height > canvasHeight) {
          object.set('top', object.top - (bounds.top + bounds.height - canvasHeight));
        }
    
        object.setCoords();
      }
    });
    

    newCanvas.on('object:scaling', (e) => {
      const object = e.target;
      if (object && showGrid) {
        const newWidth = Math.round(object.width * object.scaleX / gridSize) * gridSize;
        const newHeight = Math.round(object.height * object.scaleY / gridSize) * gridSize;

        object.set({
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
        });

        object.setCoords();
      }
    });

    newCanvas.on('object:modified', () => {
      saveCanvasState(newCanvas);
      console.log(newCanvas, saveCanvasState(newCanvas));
    });

    setCanvas(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, [width, height, backgroundColor, showGrid]);

  const exportCanvasJSON = () => {
    if (canvas) {
      clearGrid();

      const json = canvas.toJSON();
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.json';
      link.click();

      if (showGrid) {
        drawGrid(canvas, gridSize);
      }
    }
  };


  const importCanvasJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files) return;

    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          const json = JSON.parse(event.target.result as string);
          canvas.loadFromJSON(json, () => {
            canvas.renderAll();
          });
        }
      };

      reader.readAsText(file);
    }
  };


  const exportCanvasSVG = () => {
    if (canvas) {
      clearGrid();

      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.svg';
      link.click();

      if (showGrid) {
        drawGrid(canvas, gridSize);
      }
    }
  };


  const drawGrid = (canvas: Canvas, gridSize: number) => {
    const lines: Line[] = [];

    for (let x = 0; x < width; x += gridSize) {
      lines.push(new Line([x, 0, x, height], {
        stroke: "#ccc",
        strokeWidth: 0.5,
        selectable: false,
      }));
    }

    for (let y = 0; y < height; y += gridSize) {
      lines.push(new Line([0, y, width, y], {
        stroke: "#ccc",
        strokeWidth: 0.5,
        selectable: false,
      }));
    }

    canvas.add(...lines);
  };

  const clearGrid = () => {
    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj instanceof Line) {
          canvas.remove(obj);
        }
      });
    }
  };

  useEffect(() => {
    if (canvas && showGrid) {
      clearGrid();
      drawGrid(canvas, gridSize);
    } else {
      clearGrid();
    }
  }, [canvas, showGrid]);


  const deleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        saveCanvasState(canvas);
      }
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new FabricText("Hello world!", {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: "black",
    });
    canvas.add(text);
    canvas.centerObject(text);
  };

  const addRoom = () => {
    if (!canvas) return;
    const room = new Room({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "lightblue",
    });
    canvas.add(room);
    canvas.centerObject(room);
  };
  
  const addWall = () => {
    if (!canvas) return;
    const wall = new Wall({
      left: 100,
      top: 300,
      width: 400,
      height: 20,
      fill: "gray",
    });
    canvas.add(wall);
    canvas.centerObject(wall);
  };

  const addStairs = () => {
    if (!canvas) return;
    const stairs = new Stairs({
      left: 300,
      top: 500,
      width: 100,
      height: 200,
      fill: "brown",
    });
    canvas.add(stairs);
    canvas.centerObject(stairs);
  };

  const addDoor = () => {
    if (!canvas) return;
    const door = new Door({
      left: 150,
      top: 150,
    });
    canvas.add(door);
    canvas.centerObject(door);
  };


return (
  <div className="flex flex-col h-full">
    <Toolbar
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      addText={addText}
      addRoom={addRoom}
      addWall={addWall}
      addStairs={addStairs}
      addDoor={addDoor}
      deleteSelected={deleteSelected}
    />

    <div className="flex flex-grow overflow-hidden">
      <div className="p-4 flex-grow overflow-auto">
        <canvas id="canvas" ref={canvasRef} />
      </div>

      <div className=" p-4 border-l border-gray-300">
        <Layersbar />
      </div>
    </div>

    <Downloadbar
      exportCanvasJSON={exportCanvasJSON}
      exportCanvasSVG={exportCanvasSVG}
      importCanvasJSON={importCanvasJSON}
    />
  </div>
);
};

export default CustomCanvas;
