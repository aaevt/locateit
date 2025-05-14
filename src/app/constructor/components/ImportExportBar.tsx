"use client";

import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useCanvasStore } from "@/app/constructor/stores/useCanvasStore";
import { useFloorStore } from "@/app/constructor/stores/useFloorStore";
import ExportModal from "./ExportModal";

export default function ImportExportBar() {
  const { canvas } = useCanvasStore();
  const { currentFloorId } = useFloorStore();

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Импорт нескольких этажей
          if (data.floors && Array.isArray(data.floors)) {
            if (data.floors.length === 1) {
              // Если только один этаж, импортируем его как canvasJson
              const floor = data.floors[0];
              if (!canvas) return;
              canvas.loadFromJSON(floor.canvasJson, () => {
                canvas.renderAll();
                const jsonData = canvas.toJSON();
                localStorage.setItem(
                  `floor_${currentFloorId}`,
                  JSON.stringify(jsonData),
                );
              });
              return;
            }
            if (confirm("Обнаружен файл с несколькими этажами. Импортировать все этажи? Это заменит текущие этажи.")) {
              localStorage.setItem("floor-store", JSON.stringify({
                state: {
                  floors: data.floors,
                  currentFloorId: data.floors[0]?.id || null
                }
              }));
              alert("Этажи успешно импортированы. Страница будет перезагружена.");
              window.location.reload();
            }
            return;
          }

          // Импорт одного этажа: если есть canvasJson, используем его
          let canvasJson = data;
          if (data.canvasJson && typeof data.canvasJson === "object") {
            canvasJson = data.canvasJson;
          }

          if (!canvas) return;
          canvas.loadFromJSON(canvasJson, () => {
            canvas.renderAll();
            const jsonData = canvas.toJSON();
            localStorage.setItem(
              `floor_${currentFloorId}`,
              JSON.stringify(jsonData),
            );
          });
        } catch (error) {
          console.error("Error importing file:", error);
          alert(
            "Ошибка при импорте файла. Пожалуйста, убедитесь, что файл корректный."
          );
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center justify-end gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const modalTrigger = document.querySelector(
            "[data-export-modal-trigger]",
          );
          if (modalTrigger) {
            (modalTrigger as HTMLElement).click();
          }
        }}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Экспорт</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleImport}
        className="flex items-center gap-1"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Импорт</span>
      </Button>
      <ExportModal />
    </div>
  );
}

