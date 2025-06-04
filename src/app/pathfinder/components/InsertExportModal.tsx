import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InsertExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculatePaths: () => string;
}

export const InsertExportModal: React.FC<InsertExportModalProps> = ({ open, onOpenChange, onCalculatePaths }) => {
  const [embedCode, setEmbedCode] = useState<string>("");

  const handleCalculate = () => {
    const code = onCalculatePaths();
    if (!code) {
      setEmbedCode("");
      if (open) alert("Сначала загрузите план этажей!");
      return;
    }
    setEmbedCode(code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать вставку для HTML-страницы</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
        <input
            className="w-full p-2 border rounded bg-muted text-xs"
            value={embedCode}
            readOnly
            placeholder="Здесь появится код для вставки после расчёта пути"
            onFocus={e => e.target.select()}
            style={{ minHeight: 40 }}
          />
          <Button onClick={handleCalculate}>
            Просчитать пути
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
