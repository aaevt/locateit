"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCanvasStore } from "@/app/constructor/stores/useCanvasStore";
import { useFloorStore } from "@/app/constructor/stores/useFloorStore";
import { Download } from "lucide-react";

export default function ExportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const { canvas } = useCanvasStore();
  const { floors } = useFloorStore();

  const handleSimpleExport = (format: "svg" | "json") => {
    if (!canvas) {
      console.error("Canvas is not initialized");
      return;
    }

    try {
      if (format === "svg") {
        const svg = canvas.toSVG({
          viewBox: {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
          }
        });
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'canvas.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      } else {
        // Экспорт одного этажа всегда в формате floors: [ ... ]
        let currentFloor = null;
        if (floors && floors.length > 0) {
          currentFloor = floors.find(f => f.canvasJson && f.id) || floors[0];
        }
        const exportData = {
          floors: [
            {
              id: currentFloor?.id || 'floor1',
              number: currentFloor?.number || 1,
              name: currentFloor?.name || '',
              canvasJson: currentFloor?.canvasJson || canvas.toJSON()
            }
          ]
        };
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = jsonUrl;
        downloadLink.download = 'floor.json';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(jsonUrl);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Ошибка при экспорте файла. Пожалуйста, попробуйте еще раз.");
    }
  };

  const generateEmbedCode = () => {
    if (!canvas) {
      console.error("Canvas is not initialized");
      return;
    }

    try {
      const json = canvas.toJSON();
      const base64 = window.btoa(JSON.stringify(json));
      const embedCode = `<iframe 
        src="/viewer?data=${base64}" 
        width="100%" 
        height="600px" 
        frameborder="0"
        allowfullscreen
      ></iframe>`;
      
      setEmbedCode(embedCode);
    } catch (error) {
      console.error("Embed code generation error:", error);
      alert("Ошибка при генерации кода для вставки. Пожалуйста, попробуйте еще раз.");
    }
  };

  const saveEmbedCode = () => {
    try {
      const blob = new Blob([embedCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "embed-code.txt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Save embed code error:", error);
      alert("Ошибка при сохранении кода для вставки. Пожалуйста, попробуйте еще раз.");
    }
  };
  
  const handleExportAllFloors = () => {
    try {
      const allFloorsData = {
        floors: floors.map(floor => ({
          id: floor.id,
          name: floor.name,
          number: floor.number,
          canvasJson: floor.canvasJson
        }))
      };
      
      const jsonBlob = new Blob([JSON.stringify(allFloorsData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = jsonUrl;
      downloadLink.download = 'all-floors.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(jsonUrl);
      setIsOpen(false);
    } catch (error) {
      console.error("Export all floors error:", error);
      alert("Ошибка при экспорте всех этажей. Пожалуйста, попробуйте еще раз.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="hidden" 
          data-export-modal-trigger
        >
          <Download className="h-5 w-5 mr-2" />
          Экспортировать
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Экспорт</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Простой экспорт</TabsTrigger>
            <TabsTrigger value="advanced">Продвинутый экспорт</TabsTrigger>
          </TabsList>
          <TabsContent value="simple" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Выберите формат для экспорта:
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSimpleExport("svg")}
                  className="w-full"
                >
                  Экспорт в SVG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSimpleExport("json")}
                  className="w-full"
                >
                  Экспорт этажа
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportAllFloors}
                  className="w-full"
                >
                  Экспорт всех этажей
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Предпросмотр:
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                {canvas && (
                  <canvas
                    ref={(node) => {
                      if (node && canvas) {
                        const ctx = node.getContext("2d");
                        if (ctx) {
                          node.width = canvas.width;
                          node.height = canvas.height;
                          canvas.renderAll();
                          const dataURL = canvas.toDataURL();
                          const img = new Image();
                          img.src = dataURL;
                          img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                          };
                        }
                      }
                    }}
                    className="w-full h-auto"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder="Код для вставки"
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateEmbedCode}
                    className="w-full"
                  >
                    Сгенерировать
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveEmbedCode}
                    className="w-full"
                  >
                    Сохранить код
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}