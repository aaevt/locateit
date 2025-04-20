import React from "react";
import { Button } from "@/components/ui/button";
import { History, Undo, Redo, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HistoryAction {
  id: string;
  type: string;
  description: string;
  timestamp: number;
}

interface HistorybarProps {
  actions: HistoryAction[];
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Historybar: React.FC<HistorybarProps> = ({
  actions,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed ? (
          <h3 className="text-lg font-medium flex items-center">
            <History className="mr-2 h-5 w-5" />
            История
          </h3>
        ) : (
          <History className="h-5 w-5" />
        )}
        <div className="flex space-x-1">
          {!isCollapsed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-8 w-8"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-8 w-8"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed ? (
        <>
          <Separator className="my-2" />
          <div className="flex-1 overflow-y-auto space-y-2">
            {actions.map((action) => (
              <div
                key={action.id}
                className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm">{action.description}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Historybar; 