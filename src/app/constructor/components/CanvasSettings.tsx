import { useEffect, useState } from "react";
import { useCanvasSettingsStore } from "@/app/constructor/stores/useCanvasSettingsStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { canvasSettingsSchema } from "@/app/constructor/libs/zodSchemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CanvasSettings() {
  const {
    isOpen,
    close,
    setSettings,
    gridSize,
    backgroundColor,
    canvasWidth,
    canvasHeight,
    backgroundImage,
    backgroundOpacity,
    showGrid,
    removeBackgroundImage,
  } = useCanvasSettingsStore();

  const [imagePreview, setImagePreview] = useState<string | null>(backgroundImage);

  const form = useForm({
    resolver: zodResolver(canvasSettingsSchema),
    defaultValues: {
      gridSize,
      backgroundColor,
      canvasWidth,
      canvasHeight,
      backgroundImage,
      backgroundOpacity,
      showGrid,
    },
  });

  useEffect(() => {
    form.reset({
      gridSize,
      backgroundColor,
      canvasWidth,
      canvasHeight,
      backgroundImage,
      backgroundOpacity,
      showGrid,
    });
  }, [gridSize, backgroundColor, canvasWidth, canvasHeight, backgroundImage, backgroundOpacity, showGrid, form]);

  const onSubmit = (values: any) => {
    setSettings(values);
    close();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImagePreview(imageUrl);
        form.setValue("backgroundImage", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("backgroundImage", null);
    removeBackgroundImage();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки Канваса</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Показать сетку</Label>
            <Switch
              checked={form.watch("showGrid")}
              onCheckedChange={(checked) => form.setValue("showGrid", checked)}
            />
          </div>

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
            <Label>Фоновое изображение</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 w-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  Удалить
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Прозрачность фона</Label>
            <Input
              type="range"
              min="0"
              max="1"
              step="0.1"
              {...form.register("backgroundOpacity", { valueAsNumber: true })}
            />
            <span className="text-sm text-gray-500">
              {form.watch("backgroundOpacity")}
            </span>
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
