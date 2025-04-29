"use client";

import { useHistoryStore } from "@/components/constructor/stores/useHistoryStore";
import { Button } from "@/components/ui/button";

export default function HistoryPanel() {
  const { historyStack, currentIndex, goToIndex, undo, redo } =
    useHistoryStore();

  return (
    <div className="absolute top-0 left-full ml-4 w-48 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border flex flex-col gap-2 max-h-[400px] overflow-y-auto z-50">
      <div className="flex justify-between mb-2">
        <Button size="sm" onClick={undo}>
          Назад
        </Button>
        <Button size="sm" onClick={redo}>
          Вперед
        </Button>
      </div>
      {historyStack.map((_, index) => (
        <Button
          key={index}
          variant={index === currentIndex ? "default" : "ghost"}
          onClick={() => goToIndex(index)}
          className="w-full"
        >
          Шаг {index + 1}
        </Button>
      ))}
    </div>
  );
}
