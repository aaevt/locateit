"use client";
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas, Rect, Circle, FabricText, Line, Object as FabricObject, Group } from 'fabric';
import type { IObjectOptions, IGroupOptions } from 'fabric/fabric-impl';
import { Plus, ZoomIn, Minus } from 'lucide-react';

import Toolbar from './Toolbar'
import Downloadbar from './Downloadbar'
import Layersbar from "./Layersbar";
import Room from './Objects/Room';
import Wall from './Objects/Wall';
import Stairs from './Objects/Stairs';
import Door from './Objects/Door';
import Historybar from './Historybar';
import GridOverlay from './GridOverlay';

interface CanvasProps {
  width: number;
  height: number;
  backgroundColor?: string;
  showGrid: boolean;
  floorId: string;
  onFloorChange: (floorId: string) => void;
}

export interface CanvasRef {
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  getCanvas: () => Canvas | null;
  saveCurrentState: () => void;
}

interface CustomData {
  layerId?: string;
  type?: string;
  stairsData?: StairsData;
  [key: string]: any;
}

interface CustomObjectOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  data?: CustomData;
  [key: string]: any;
}

interface CustomGroupOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  data?: CustomData;
  [key: string]: any;
}

interface CustomRoomProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  data?: {
    layerId?: string;
  };
}

interface CustomWallProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  data?: {
    layerId?: string;
  };
}

interface CustomDoorProps {
  left: number;
  top: number;
  data?: {
    layerId?: string;
  };
}

interface StairsData {
  fromFloor: number;
  toFloor: number;
  direction: 'up' | 'down' | 'both';
}

interface HistoryAction {
  id: string;
  type: string;
  description: string;
  timestamp: number;
}

interface FloorData {
  id: string;
  name: string;
  canvasState: string;
  history: string[];
  historyIndex: number;
}

const CustomCanvas = forwardRef<CanvasRef, CanvasProps>(({
  width, height, backgroundColor, showGrid, floorId, onFloorChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string>("floor-0");
  const [actions, setActions] = useState<HistoryAction[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [isLayersCollapsed, setIsLayersCollapsed] = useState(false);

  const gridSize = 50;

  const addAction = (type: string, description: string) => {
    const newAction: HistoryAction = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: Date.now()
    };
    setActions(prev => [...prev, newAction]);
  };

  const saveCanvasState = (canvas: Canvas) => {
    try {
      const canvasState = canvas.toJSON();
      const savedFloors = localStorage.getItem('canvasFloors');
      if (savedFloors) {
        const floors = JSON.parse(savedFloors);
        const updatedFloors = floors.map((floor: FloorData) => {
          if (floor.id === floorId) {
            const newHistory = [...floor.history.slice(0, floor.historyIndex + 1), JSON.stringify(canvasState)];
            return {
              ...floor,
              canvasState: JSON.stringify(canvasState),
              history: newHistory,
              historyIndex: newHistory.length - 1
            };
          }
          return floor;
        });
        localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
      }
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new Canvas(canvasRef.current!, {
      width,
      height,
      backgroundColor,
    });

    // Устанавливаем размеры canvas в соответствии с размерами контейнера
    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        newCanvas.setWidth(containerWidth);
        newCanvas.setHeight(containerHeight);
      }
    };

    // Обновляем размеры при изменении размера окна
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    try {
      const savedFloors = localStorage.getItem('canvasFloors');
      if (savedFloors) {
        const floors = JSON.parse(savedFloors);
        const currentFloor = floors.find((floor: FloorData) => floor.id === floorId);
        if (currentFloor && currentFloor.canvasState) {
          try {
            const canvasState = JSON.parse(currentFloor.canvasState);
            if (typeof canvasState === 'object' && canvasState !== null) {
              newCanvas.loadFromJSON(canvasState, () => {
                newCanvas.renderAll();
              });
            } else {
              console.error('Invalid canvas state format');
              newCanvas.clear();
            }
          } catch (parseError) {
            console.error('Error parsing canvas state:', parseError);
            newCanvas.clear();
          }
        }
      }
    } catch (error) {
      console.error('Error loading canvas state:', error);
      newCanvas.clear();
    }

    newCanvas.on('object:added', () => {
      saveCanvasState(newCanvas);
    });
    newCanvas.on('object:modified', () => {
      saveCanvasState(newCanvas);
    });
    newCanvas.on('object:removed', () => {
      saveCanvasState(newCanvas);
    });

    newCanvas.on('object:moving', (e) => {
      const object = e.target;
      if (object && showGrid) {
        const gridX = Math.round(object.left! / gridSize) * gridSize;
        const gridY = Math.round(object.top! / gridSize) * gridSize;
        object.set({
          left: gridX,
          top: gridY,
        });
    
        let angle = object.angle || 0;
        angle = Math.round(angle / 90) * 90;
        object.set({ angle });
    
        const bounds = object.getBoundingRect();
        const canvasWidth = newCanvas.getWidth();
        const canvasHeight = newCanvas.getHeight();
    
        if (bounds.left < 0) object.set('left', object.left! - bounds.left);
        if (bounds.top < 0) object.set('top', object.top! - bounds.top);
        if (bounds.left + bounds.width > canvasWidth) {
          object.set('left', object.left! - (bounds.left + bounds.width - canvasWidth));
        }
        if (bounds.top + bounds.height > canvasHeight) {
          object.set('top', object.top! - (bounds.top + bounds.height - canvasHeight));
        }
    
        object.setCoords();
      }
    });

    newCanvas.on('object:scaling', (e) => {
      const object = e.target;
      if (object && showGrid) {
        const newWidth = Math.round(object.width! * object.scaleX! / gridSize) * gridSize;
        const newHeight = Math.round(object.height! * object.scaleY! / gridSize) * gridSize;

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
      window.removeEventListener('resize', updateCanvasSize);
      newCanvas.dispose();
    };
  }, [width, height, backgroundColor, showGrid, floorId]);

  const handleZoomIn = () => {
    if (canvas) {
      const newZoom = Math.min(zoom + 0.1, 3);
      canvas.setZoom(newZoom);
      setZoom(newZoom);
      canvas.requestRenderAll();
    }
  };

  const handleZoomOut = () => {
    if (canvas) {
      const newZoom = Math.max(zoom - 0.1, 1);
      canvas.setZoom(newZoom);
      setZoom(newZoom);
      canvas.requestRenderAll();
    }
  };

  const handleZoomReset = () => {
    if (canvas) {
      canvas.setZoom(1);
      setZoom(1);
      canvas.requestRenderAll();
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey && canvas) {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [canvas, zoom]);

  useEffect(() => {
    if (canvas) {
      handleZoomReset();
    }
  }, [canvas]);

  const handleUndo = () => {
    try {
      const savedFloors = localStorage.getItem('canvasFloors');
      if (savedFloors && canvas) {
        const floors = JSON.parse(savedFloors);
        const currentFloor = floors.find((floor: FloorData) => floor.id === floorId);
        if (currentFloor && currentFloor.historyIndex > 0) {
          const newHistoryIndex = currentFloor.historyIndex - 1;
          const canvasState = JSON.parse(currentFloor.history[newHistoryIndex]);
          canvas.loadFromJSON(canvasState, () => {
            canvas.renderAll();
            const updatedFloors = floors.map((floor: FloorData) => {
              if (floor.id === floorId) {
                return {
                  ...floor,
                  historyIndex: newHistoryIndex,
                  canvasState: floor.history[newHistoryIndex]
                };
              }
              return floor;
            });
            localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
          });
        }
      }
    } catch (error) {
      console.error('Error during undo:', error);
    }
  };

  const handleRedo = () => {
    try {
      const savedFloors = localStorage.getItem('canvasFloors');
      if (savedFloors && canvas) {
        const floors = JSON.parse(savedFloors);
        const currentFloor = floors.find((floor: FloorData) => floor.id === floorId);
        if (currentFloor && currentFloor.historyIndex < currentFloor.history.length - 1) {
          const newHistoryIndex = currentFloor.historyIndex + 1;
          const canvasState = JSON.parse(currentFloor.history[newHistoryIndex]);
          canvas.loadFromJSON(canvasState, () => {
            canvas.renderAll();
            const updatedFloors = floors.map((floor: FloorData) => {
              if (floor.id === floorId) {
                return {
                  ...floor,
                  historyIndex: newHistoryIndex,
                  canvasState: floor.history[newHistoryIndex]
                };
              }
              return floor;
            });
            localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
          });
        }
      }
    } catch (error) {
      console.error('Error during redo:', error);
    }
  };

  const exportCanvasJSON = () => {
    if (canvas) {
      const json = canvas.toJSON();
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.json';
      link.click();
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
            saveCanvasState(canvas);
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const exportCanvasSVG = () => {
    if (canvas) {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'canvas-export.svg';
      link.click();
    }
  };

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
      data: {
        layerId: activeLayerId
      }
    } as CustomObjectOptions);
    canvas.add(text);
    canvas.centerObject(text);
    addAction('add', 'Добавлен текст');
  };

  const addRoom = () => {
    if (!canvas) return;
    const room = Room({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "lightblue",
      data: {
        layerId: activeLayerId
      }
    } as CustomRoomProps);
    canvas.add(room);
    canvas.centerObject(room);
    addAction('add', 'Добавлена комната');
  };
  
  const addWall = () => {
    if (!canvas) return;
    const wall = Wall({
      left: 100,
      top: 300,
      width: 400,
      height: 20,
      fill: "gray",
      data: {
        layerId: activeLayerId
      }
    });
    canvas.add(wall);
    canvas.centerObject(wall);
    addAction('add', 'Добавлена стена');
  };

  const addStairs = () => {
    if (!canvas) return;
    const stairsGroup = new Group([], {
      left: 300,
      top: 500,
      width: 100,
      height: 200,
      fill: "brown",
      data: {
        layerId: activeLayerId,
        type: 'stairs',
        stairsData: {
          fromFloor: 1,
          toFloor: 2,
          direction: 'both'
        }
      }
    });
    
    const stairsRect = new Rect({
      width: 100,
      height: 200,
      fill: "brown",
      data: {
        layerId: activeLayerId
      }
    });
    
    const stairsText = new FabricText("1 → 2", {
      fontSize: 20,
      fill: "white",
      data: {
        layerId: activeLayerId
      }
    });
    
    stairsGroup.add(stairsRect, stairsText);
    
    stairsText.set({
      left: stairsGroup.width! / 2,
      top: stairsGroup.height! / 2,
      originX: 'center',
      originY: 'center'
    });
    
    canvas.add(stairsGroup);
    canvas.centerObject(stairsGroup);
    addAction('add', 'Добавлена лестница');
    
    stairsGroup.on('mousedblclick', () => {
      const customGroup = stairsGroup as unknown as { data?: CustomData };
      const data = customGroup.data?.stairsData;
      if (data) {
        console.log('Editing stairs data:', data);
      }
    });
  };

  const addDoor = () => {
    if (!canvas) return;
    const door = Door({
      left: 150,
      top: 150,
      data: {
        layerId: activeLayerId
      }
    });
    canvas.add(door);
    canvas.centerObject(door);
    addAction('add', 'Добавлена дверь');
  };

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    cut: () => {},
    copy: () => {},
    paste: () => {},
    getCanvas: () => canvas,
    saveCurrentState: () => {
      if (canvas) {
        saveCanvasState(canvas);
      }
    }
  }));

  return (
    <div className="flex h-full">
      <div className={`transition-all duration-300 ${isHistoryCollapsed ? 'w-12' : 'w-64'}`}>
        <Historybar 
          actions={actions}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={true}
          canRedo={true}
          isCollapsed={isHistoryCollapsed}
          onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
        />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          addText={addText}
          addRoom={addRoom}
          addWall={addWall}
          addStairs={addStairs}
          addDoor={addDoor}
          deleteSelected={deleteSelected}
          onExportJSON={exportCanvasJSON}
          onExportSVG={exportCanvasSVG}
          onImportJSON={importCanvasJSON}
        />
        <div className="h-full flex items-center justify-center">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 relative" style={{ width: '800px', height: '600px' }}>
            <div className="relative w-full h-full">
              <canvas 
                ref={canvasRef} 
                style={{ 
                  touchAction: 'none',
                  outline: 'none',
                  width: '100%',
                  height: '100%'
                }}
              />
              <GridOverlay
                width={width}
                height={height}
                gridSize={gridSize}
                showGrid={showGrid}
                zoom={zoom}
              />
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
              <button 
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Увеличить"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button 
                onClick={handleZoomReset}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Сбросить масштаб"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Уменьшить"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`transition-all duration-300 ${isLayersCollapsed ? 'w-12' : 'w-64'}`}>
        <Layersbar
          canvas={canvas}
          onLayerChange={() => {}}
          activeFloorId={floorId}
          onFloorChange={onFloorChange}
          isCollapsed={isLayersCollapsed}
          onToggleCollapse={() => setIsLayersCollapsed(!isLayersCollapsed)}
        />
      </div>
    </div>
  );
});

CustomCanvas.displayName = 'CustomCanvas';

export default CustomCanvas;
