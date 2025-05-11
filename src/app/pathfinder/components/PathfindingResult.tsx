"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PathfindingResultProps {
  result: { path: { id: string; label?: string; floor?: number }[] } | null;
}

export function PathfindingResult({ result }: PathfindingResultProps) {
  if (!result) return null;
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Путь</CardTitle>
      </CardHeader>
      <CardContent>
        <Separator className="mb-2" />
        <ol className="list-decimal list-inside space-y-1">
          {result.path.map(node => (
            <li key={node.id} className="text-base">
              {node.label || node.id} <span className="text-xs text-neutral-500">(этаж {node.floor ?? '?'})</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
