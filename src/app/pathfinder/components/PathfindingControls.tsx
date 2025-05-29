"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FloorLoader } from "./FloorLoader";
import { RoomSelector } from "./RoomSelector";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { PathNode } from "../types/graph";

interface PathfindingControlsProps {
  start: string;
  setStart: (id: string) => void;
  end: string;
  setEnd: (id: string) => void;
  rooms: PathNode[];
  floors: { id: string; number: number; name?: string }[];
  currentFloorId: string;
  onFindPath: () => void;
  onLoadFloors: (data: unknown) => void;
}

export function PathfindingControls({
  start,
  setStart,
  end,
  setEnd,
  rooms,
  floors,
  currentFloorId,
  onFindPath,
  onLoadFloors,
  allowAllRooms,
}: PathfindingControlsProps & { allowAllRooms?: boolean }) {
  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Параметры поиска пути</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end md:gap-8 gap-4">
          <div className="flex-1">
            <FloorLoader onLoad={onLoadFloors} />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col md:flex-row md:items-end md:gap-8 gap-4">
          <div className="flex-1">
            <RoomSelector
              rooms={allowAllRooms ? rooms : rooms.filter(r => {
                if (!currentFloorId) return true;
                const floor = floors.find(f => f.id === currentFloorId);
                return r.floor === (floor?.number ?? 1);
              })}
              value={start}
              onChange={setStart}
              label="Откуда"
            />
          </div>
          <div className="flex-1">
            <RoomSelector
              rooms={allowAllRooms ? rooms : rooms.filter(r => {
                if (!currentFloorId) return true;
                const floor = floors.find(f => f.id === currentFloorId);
                return r.floor === (floor?.number ?? 1);
              })}
              value={end}
              onChange={setEnd}
              label="Куда"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={onFindPath}
              className="w-full md:w-auto"
            >
              <Search className="inline w-4 h-4 mr-2 -mt-1" /> Найти путь
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
