import React, { useState, useEffect } from "react";
import { Canvas, Object as FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Building,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Edit2,
  X,
  Check
} from "lucide-react";

interface CustomData {
  layerId?: string;
  type?: string;
  [key: string]: any;
}

interface CustomFabricObject extends FabricObject {
  data?: CustomData;
}

interface Floor {
  id: string;
  name: string;
  locked: boolean;
  objects: CustomFabricObject[];
  canvasState: string;
  history: string[];
  historyIndex: number;
}

interface LayersbarProps {
  canvas: Canvas | null;
  onLayerChange?: () => void;
  activeFloorId: string;
  onFloorChange: (floorId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Layersbar: React.FC<LayersbarProps> = ({
  canvas,
  onLayerChange,
  activeFloorId,
  onFloorChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [newFloorName, setNewFloorName] = useState('');
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingFloorName, setEditingFloorName] = useState('');
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [draggedFloorId, setDraggedFloorId] = useState<string | null>(null);

  useEffect(() => {
    const savedFloors = localStorage.getItem('canvasFloors');
    const savedExpandedFloors = localStorage.getItem('expandedFloors');
    if (savedFloors) {
      const parsedFloors = JSON.parse(savedFloors);
      setFloors(parsedFloors);
    }
    if (savedExpandedFloors) {
      setExpandedFloors(new Set(JSON.parse(savedExpandedFloors)));
    }
  }, []);

  const handleAddFloor = () => {
    if (!newFloorName.trim()) return;

    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      name: newFloorName.trim(),
      locked: false,
      objects: [],
      canvasState: '{}',
      history: ['{}'],
      historyIndex: 0
    };

    const updatedFloors = [...floors, newFloor];
    localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
    setFloors(updatedFloors);
    setNewFloorName('');
    setIsAddingFloor(false);
    onFloorChange(newFloor.id);
  };

  const handleDeleteFloor = (floorId: string) => {
    if (floorId === 'floor-0') return; // Prevent deleting the ground floor

    const updatedFloors = floors.filter(floor => floor.id !== floorId);
    localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
    setFloors(updatedFloors);
    
    if (activeFloorId === floorId) {
      onFloorChange('floor-0');
    }
  };

  const toggleFloorLock = (floorId: string) => {
    const updatedFloors = floors.map(floor => {
      if (floor.id === floorId) {
        return { ...floor, locked: !floor.locked };
      }
      return floor;
    });
    localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
    setFloors(updatedFloors);
  };

  const toggleFloorExpand = (floorId: string) => {
    setExpandedFloors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(floorId)) {
        newSet.delete(floorId);
      } else {
        newSet.add(floorId);
      }
      localStorage.setItem('expandedFloors', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleObjectSelect = (object: FabricObject) => {
    if (canvas && object) {
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
      setSelectedObject(object);
      if (onLayerChange) {
        onLayerChange();
      }
    }
  };

  const handleObjectDelete = (object: FabricObject) => {
    if (canvas && object) {
      canvas.remove(object);
      canvas.requestRenderAll();
      setSelectedObject(null);
      if (onLayerChange) {
        onLayerChange();
      }
    }
  };

  const getObjectName = (object: FabricObject) => {
    const customObject = object as CustomFabricObject;
    if (customObject.data?.type) {
      return `${customObject.data.type} ${customObject.data.id || ''}`;
    }
    return object.type || 'Unknown';
  };

  const startEditingFloor = (floor: Floor) => {
    setEditingFloorId(floor.id);
    setEditingFloorName(floor.name);
  };

  const saveFloorName = (floorId: string) => {
    if (!editingFloorName.trim()) return;

    const updatedFloors = floors.map(floor => {
      if (floor.id === floorId) {
        return { ...floor, name: editingFloorName.trim() };
      }
      return floor;
    });
    localStorage.setItem('canvasFloors', JSON.stringify(updatedFloors));
    setFloors(updatedFloors);
    setEditingFloorId(null);
  };

  const handleDragStart = (e: React.DragEvent, floorId: string) => {
    setDraggedFloorId(floorId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFloorId: string) => {
    e.preventDefault();
    if (!draggedFloorId || draggedFloorId === targetFloorId) return;

    const draggedIndex = floors.findIndex(f => f.id === draggedFloorId);
    const targetIndex = floors.findIndex(f => f.id === targetFloorId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFloors = [...floors];
    const [draggedFloor] = newFloors.splice(draggedIndex, 1);
    newFloors.splice(targetIndex, 0, draggedFloor);

    setFloors(newFloors);
    localStorage.setItem('canvasFloors', JSON.stringify(newFloors));
    setDraggedFloorId(null);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed ? (
          <h3 className="text-lg font-medium flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Этажи
          </h3>
        ) : (
          <Building className="h-5 w-5" />
        )}
        <div className="flex space-x-1">
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsAddingFloor(true)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed ? (
        <>
          {isAddingFloor && (
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                placeholder="Название этажа"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddFloor}
                disabled={!newFloorName.trim()}
                size="sm"
              >
                Добавить
              </Button>
            </div>
          )}

          <Separator className="my-2" />
          
          <div className="flex-1 overflow-y-auto">
            {floors.map((floor) => (
              <div
                key={floor.id}
                className="mb-4"
                draggable
                onDragStart={(e) => handleDragStart(e, floor.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, floor.id)}
              >
                <div 
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    floor.id === activeFloorId 
                      ? 'bg-primary/10 dark:bg-primary/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onFloorChange(floor.id)}
                >
                  <div className="flex items-center">
                    <div className="mr-2 cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFloorLock(floor.id);
                      }}
                      className="h-8 w-8 mr-1"
                    >
                      {floor.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    {editingFloorId === floor.id ? (
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={editingFloorName}
                          onChange={(e) => setEditingFloorName(e.target.value)}
                          className="h-8 mr-1"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveFloorName(floor.id);
                          }}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm">{floor.name}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingFloor(floor);
                      }}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {floor.id !== 'floor-0' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFloor(floor.id);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFloorExpand(floor.id);
                      }}
                      className="h-8 w-8"
                    >
                      {expandedFloors.has(floor.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                
                {floor.id === activeFloorId && canvas && expandedFloors.has(floor.id) && (
                  <div className="mt-2 pl-4">
                    {canvas.getObjects().map((object, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                          canvas.getActiveObject() === object
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div 
                          className="flex-1"
                          onClick={() => handleObjectSelect(object)}
                        >
                          {getObjectName(object)}
                        </div>
                        {canvas.getActiveObject() === object && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleObjectDelete(object)}
                            className="h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="mb-2"
              onClick={() => onFloorChange(floor.id)}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${floor.id === activeFloorId ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
              >
                {floor.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Layersbar;
