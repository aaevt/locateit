"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas, Rect, Circle, FabricText, Line } from 'fabric'
import Toolbar from './Toolbar'

interface CanvasProps {
  width: number;
  height: number;
  backgroundColor?: string | "ffffff";
  showGrid: boolean;
}

const CustomCanvas: React.FC<CanvasProps> = ({ width, height, backgroundColor, showGrid }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const gridSize = 50;

  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new Canvas(canvasRef.current!, {
      width,
      height,
      backgroundColor,
      showGrid,
    });

    newCanvas.on('object:moving', (e) => {
      const object = e.target;
      if (object && showGrid) {
        object.set({
          left: Math.round(object.left / gridSize) * gridSize,
          top: Math.round(object.top / gridSize) * gridSize,
        });
        let angle = object.angle || 0;
        angle = Math.round(angle / 90) * 90; // Округляем угол
        object.set({
          angle: angle,
        });
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

    setCanvas(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, [width, height, backgroundColor, showGrid]  );

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
      canvas.clear();
      drawGrid(canvas, gridSize);
    } else {
      clearGrid();
    }
  }, [canvas, showGrid]);


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

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 50,
      fill: "blue",
    });
    canvas.add(rect);
  };


  return (
    <div className="flex">
      {/* Панель инструментов */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        addText={addText}
        addRectangle={addRectangle}
      />

      {/* Канвас */}
      <div className="p-4 flex-grow">
        <canvas id="canvas" ref={canvasRef} />
      </div>
    </div>
  );
};

export default CustomCanvas;
