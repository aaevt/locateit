"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCanvasSettingsStore } from "@/components/constructor/stores/useCanvasSettingsStore";
import { canvasSettingsSchema } from "@/components/constructor/libs/zodSchemas";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function CanvasSettings() {
  const {
    isOpen,
    close,
    setSettings,
    gridSize,
    backgroundColor,
    canvasWidth,
    canvasHeight,
  } = useCanvasSettingsStore();

  const form = useForm({
    resolver: zodResolver(canvasSettingsSchema),
    defaultValues: {
      gridSize,
      backgroundColor,
      canvasWidth,
      canvasHeight,
    },
  });

  const onSubmit = (values: any) => {
    setSettings(values);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки Канваса</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Размер сетки (px)</Label>
            <Input
              type="number"
              {...form.register("gridSize", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Цвет фона</Label>
            <Input type="color" {...form.register("backgroundColor")} />
          </div>

          <div className="space-y-2">
            <Label>Ширина канваса (px)</Label>
            <Input
              type="number"
              {...form.register("canvasWidth", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Высота канваса (px)</Label>
            <Input
              type="number"
              {...form.register("canvasHeight", { valueAsNumber: true })}
            />
          </div>

          <Button type="submit" className="w-full">
            Применить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
