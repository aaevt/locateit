"use client";
import { Select } from "@/components/ui/select";
import { PathNode } from '../types/graph';

interface RoomSelectorProps {
  rooms: PathNode[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function RoomSelector({ rooms, value, onChange, label }: RoomSelectorProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={rooms.map(r => ({ value: r.id, label: `${r.label} (этаж ${r.floor})` }))}
      label={label}
      placeholder="Выберите..."
    />
  );
}
