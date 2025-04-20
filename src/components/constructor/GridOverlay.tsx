import React, { useEffect, useRef } from 'react';

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  zoom: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ width, height, gridSize, showGrid, zoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!showGrid) return;

    // Set grid style
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;

    // Apply zoom transformation
    ctx.save();
    ctx.scale(zoom, zoom);

    // Calculate grid size with zoom
    const scaledGridSize = gridSize;

    // Draw vertical lines
    for (let x = 0; x <= width / zoom; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height / zoom);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height / zoom; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width / zoom, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [width, height, gridSize, showGrid, zoom]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default GridOverlay; 