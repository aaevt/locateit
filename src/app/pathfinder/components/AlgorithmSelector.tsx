"use client";

import { Select } from "@/components/ui/select";

const ALGORITHMS = [
  { label: 'A* (A-star)', value: 'astar' },
  { label: 'Дейкстра', value: 'dijkstra' },
];

interface AlgorithmSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={ALGORITHMS}
      label="Алгоритм"
      placeholder="Выберите алгоритм..."
    />
  );
}
