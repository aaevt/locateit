import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, label, id, placeholder, className }: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
