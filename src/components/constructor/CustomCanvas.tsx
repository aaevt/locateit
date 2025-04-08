"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas, Rect, Circle, FabricText, Line } from 'fabric'
import Toolbar from './Toolbar'
import Downloadbar from './Downloadbar'
import Layersbar from "./Layersbar";
import Room from './Objects/Room';
import Wall from './Objects/Wall';
import Stairs from './Objects/Stairs';

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
        // Snap to grid
        object.set({
          left: Math.round(object.left / gridSize) * gridSize,
          top: Math.round(object.top / gridSize) * gridSize,
          angle: 0,
          lockRotation: true // Блокируем возможность вращ
        });
    
        let angle = object.angle || 0;
        angle = Math.round(angle / 90) * 90; // Округляем угол
        object.set({
          angle: angle,
        });
        object.setCoords();
    
        // Prevent the object from going out of bounds
        const canvasWidth = newCanvas.getWidth();
        const canvasHeight = newCanvas.getHeight();
    
        if (object.left < 0) object.set('left', 0);
        if (object.top < 0) object.set('top', 0);
        if (object.left + object.width > canvasWidth) object.set('left', canvasWidth - object.width);
        if (object.top + object.height > canvasHeight) object.set('top', canvasHeight - object.height);
    
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
          angle: 0, // Фиксируем угол
          lockRotation: true
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
      // Удаляем объекты сетки перед экспортом
      clearGrid();

      const json = canvas.toJSON();
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.json';
      link.click();

      // Восстанавливаем сетку после экспорта
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
            canvas.renderAll();  // Рендерим канвас после загрузки
          });
        }
      };

      reader.readAsText(file);
    }
  };


  const exportCanvasSVG = () => {
    if (canvas) {
      // Удалить все линии (сетка)
      clearGrid();

      // Экспортировать канвас в SVG
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.svg'; // Название файла
      link.click();

      // Возвращаем сетку обратно после экспорта
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

  // Add Stairs to canvas
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




return (
  <div className="flex flex-col h-full">
    {/* Toolbar at the top */}
    <Toolbar
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      addText={addText}
      addRoom={addRoom}
      addWall={addWall}
      addStairs={addStairs}
      deleteSelected={deleteSelected}
    />

    {/* Main area: canvas + layers bar */}
    <div className="flex flex-grow overflow-hidden">
      {/* Canvas section */}
      <div className="p-4 flex-grow overflow-auto">
        <canvas id="canvas" ref={canvasRef} />
      </div>

      {/* Layers bar on the right */}
      <div className="w-64 border-l border-gray-300">
        <Layersbar />
      </div>
    </div>

    {/* Download bar at the bottom */}
    <Downloadbar
      exportCanvasJSON={exportCanvasJSON}
      exportCanvasSVG={exportCanvasSVG}
      importCanvasJSON={importCanvasJSON}
    />
  </div>
);
};

export default CustomCanvas;
