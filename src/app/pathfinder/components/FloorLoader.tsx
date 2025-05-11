"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from 'react';

interface FloorLoaderProps {
  onLoad: (data: unknown) => void;
}

export function FloorLoader({ onLoad }: FloorLoaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        onLoad(json);
      } catch {
        alert('Ошибка чтения файла!');
      }
    };
    reader.readAsText(file);
  }

  function handleButtonClick() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor="floor-upload">Загрузить этажи (JSON)</Label>
      <input
        id="floor-upload"
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button type="button" onClick={handleButtonClick} className="bg-black hover:bg-neutral-800 text-white font-semibold rounded-md px-4 py-2 transition shadow">
        Выбрать файл
      </Button>
    </div>
  );
}
