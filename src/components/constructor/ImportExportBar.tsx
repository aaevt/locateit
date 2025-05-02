"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import ExportModal from "./ExportModal";

export default function ImportExportBar() {
  const handleImport = () => {
    // TODO: Implement import functionality
    console.log("Import clicked");
  };

  return (
    <TooltipProvider>
      <div className="w-full h-12 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border z-40 transition-all duration-300">
        <div className="flex items-center justify-end gap-4 h-full">
          <Button
            variant="ghost"
            onClick={handleImport}
            className="transition-all duration-300"
          >
            <Upload className="h-5 w-5 mr-2" />
            Импортировать
          </Button>

          <ExportModal />
        </div>
      </div>
    </TooltipProvider>
  );
} 