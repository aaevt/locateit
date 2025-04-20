import React from "react";
import { 
  MousePointer, 
  Trash2, 
  Type, 
  Square, 
  Circle, 
  ArrowUpDown, 
  DoorOpen, 
  Ruler,
  Layers,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string) => void;
  addText: () => void;
  addRoom: () => void; 
  addWall: () => void;
  addStairs: () => void;
  addDoor: () => void;
  deleteSelected: () => void;
  onExportJSON?: () => void;
  onExportSVG?: () => void;
  onImportJSON?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  setActiveTool, 
  addText, 
  addRoom, 
  addWall, 
  addStairs, 
  addDoor, 
  deleteSelected,
  onExportJSON,
  onExportSVG,
  onImportJSON
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
      <div className="flex items-center space-x-2">
        {/* Selection Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant={activeTool === "select" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool("select")}
            className="h-9 w-9"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActiveTool("delete");
              deleteSelected();
            }}
            onDoubleClick={() => {
              localStorage.clear();
              alert("Canvas cleared!");
            }}
            className="h-9 w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-9" />

        {/* Drawing Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant={activeTool === "text" ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setActiveTool("text");
              addText();
            }}
            className="h-9 w-9"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "Room" ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setActiveTool("Room");
              addRoom();
            }}
            className="h-9 w-9"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "Wall" ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setActiveTool("Wall");
              addWall();
            }}
            className="h-9 w-9"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "Stairs" ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setActiveTool("Stairs");
              addStairs();
            }}
            className="h-9 w-9"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "Door" ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              setActiveTool("Door");
              addDoor();
            }}
            className="h-9 w-9"
          >
            <DoorOpen className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-9" />

        {/* Measurement Tool */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {}}
          className="h-9 w-9"
        >
          <Ruler className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-9" />

        {/* Export/Import Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExportJSON}
            className="h-9 w-9"
          >
            <Download className="h-4 w-4" />
          </Button>
          <label htmlFor="file-upload">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImportJSON}
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
