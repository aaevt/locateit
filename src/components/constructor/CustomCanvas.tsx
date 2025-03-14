"use client";
import React, { useEffect, useState, useRef } from "react";
import { Canvas } from 'fabric'

interface CanvasProps {
  width: number;
  height: number;
  backgroundColor?: string;
}

const CustomCanvas: React.FC<CanvasProps> = ({ width, height, backgroundColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    const newCanvas = new Canvas(canvasRef.current!, {
      width,
      height,
      backgroundColor,
    });

    setCanvas(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, [width, height, backgroundColor]  );

  return (
    <div className="relative">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CustomCanvas;
