"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CanvasBuilder from "@/components/constructor/CanvasBuilder";
import CustomCanvas from "@/components/constructor/CustomCanvas";
import Toolbar from "@/components/constructor/Toolbar";

export default function Constructor() {
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const handleCanvasSubmit = (
    width: number,
    height: number,
    backgroundColor: string,
    showGrid: boolean,
  ) => {
    setCanvasDimensions({ width, height });
    localStorage.setItem("canvasCreated", "true");
    localStorage.setItem("canvasBackgroundColor", backgroundColor);
    localStorage.setItem("canvasShowGrid", showGrid.toString());
  };

  useEffect(() => {
    const canvasData = localStorage.getItem("canvasCreated");
    if (canvasData) {
      const savedWidth = localStorage.getItem("canvasWidth");
      const savedHeight = localStorage.getItem("canvasHeight");
      if (savedWidth && savedHeight) {
        setCanvasDimensions({
          width: parseInt(savedWidth),
          height: parseInt(savedHeight),
        });
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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="flex flex-grow flex-col items-center justify-center">
          <div className="flex space-x-2 justify-center items-center bg-white h-screen dark:invert">
            <span className="sr-only">Loading...</span>
            <div className="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-8 w-8 bg-black rounded-full animate-bounce"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="flex flex-grow flex-col items-center justify-center overflow-hidden">
        {!canvasDimensions ? (
          <CanvasBuilder onSubmit={handleCanvasSubmit} />
        ) : (
          <CustomCanvas
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            backgroundColor={
              localStorage.getItem("canvasBackgroundColor") || "#ffffff"
            }
            showGrid={localStorage.getItem("canvasShowGrid") === "true"}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
