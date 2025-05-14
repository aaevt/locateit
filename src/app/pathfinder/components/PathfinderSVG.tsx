"use client";
import { Stars } from "lucide-react";

interface RoomObj {
  type: "room";
  left: number;
  top: number;
  width?: number;
  height?: number;
  label?: string;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';
}

interface StairsObj {
  type: "stairs";
  left: number;
  top: number;
  width?: number;
  height?: number;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';
}

interface LineObj {
  type: "Line";
  left: number;
  top: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
}

export interface CanvasJson {
  objects: (RoomObj | StairsObj | LineObj)[];
}

interface PathfinderSVGProps {
  canvasJson: CanvasJson;
  path: { x: number; y: number }[];
  width?: number;
  height?: number;
}

function round(value: number, step = 1) {
  return Math.round(value / step) * step;
}

function adjustPosition(
  left: number,
  top: number,
  width = 0,
  height = 0,
  originX: 'left' | 'center' | 'right' = 'left',
  originY: 'top' | 'center' | 'bottom' = 'top'
) {
  let x = left;
  let y = top;

  if (originX === 'center') x -= width / 2;
  else if (originX === 'right') x -= width;

  if (originY === 'center') y -= height / 2;
  else if (originY === 'bottom') y -= height;

  return {
    x: round(x),
    y: round(y),
  };
}

export function PathfinderSVG({
  canvasJson,
  path,
  width = 1000,
  height = 1000,
}: PathfinderSVGProps) {
  return (
    <svg
      width={width}
      height={height}
      className="rounded-xl border shadow bg-neutral-50 dark:bg-neutral-900"
      style={{ maxWidth: '100%', height: '100%' }}
    >
      {/* Комнаты */}
      {canvasJson.objects
        ?.filter((o): o is RoomObj => o.type === 'room')
        .map((room, i) => {
          const w = round(room.width ?? 100, 10);
          const h = round(room.height ?? 100, 10);
          const { x, y } = adjustPosition(room.left, room.top, w, h, room.originX, room.originY);
          return (
            <g key={`room-${i}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="#e3eafe"
                stroke="#1976d2"
                strokeWidth={2}
                rx={12}
              />
              <text
                x={x + w / 2}
                y={y + 20}
                textAnchor="middle"
                fontSize={18}
                fill="#1976d2"
                fontWeight={700}
              >
                {room.label || 'Кабинет'}
              </text>
            </g>
          );
        })}

      {/* Стены */}
{canvasJson.objects
  ?.filter((o): o is LineObj => o.type === 'Line' && o.stroke === 'black')
  .map((line, i) => {
    const x1 = round(line.left, 10);
    const y1 = round(line.top, 10);
    const w = round(line.width ?? 0, 10);
    const h = round(line.height ?? 0, 10);

    const isHorizontal = w > h;

    const x2 = isHorizontal ? x1 + w : x1;
    const y2 = isHorizontal ? y1 : y1 + h;

    return (
      <line
        key={`wall-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#000"
        strokeWidth={line.strokeWidth ?? 4}
      />
    );
  })}


      {/* Двери */}
{canvasJson.objects
  ?.filter((o): o is LineObj => o.type === 'Line' && o.stroke === 'brown')
  .map((line, i) => {
    const x1 = round(line.left, 10);
    const y1 = round(line.top, 10);
    const w = round(line.width ?? 0, 10);
    const h = round(line.height ?? 0, 10);

    const isHorizontal = w > h;
    const x2 = isHorizontal ? x1 + w : x1;
    const y2 = isHorizontal ? y1 : y1 + h;

    return (
      <line
        key={`door-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#8d6e63"
        strokeWidth={line.strokeWidth ?? 4}
        strokeDasharray={line.strokeDashArray?.join(',') ?? '10,5'}
      />
    );
  })}

      {/* Лестницы */}
      {canvasJson.objects
        ?.filter((o): o is StairsObj => o.type === 'stairs')
        .map((stairs, i) => {
          const w = round(stairs.width ?? 60, 10);
          const h = round(stairs.height ?? 60, 10);
          const { x, y } = adjustPosition(stairs.left, stairs.top, w, h, stairs.originX, stairs.originY);
          return (
            <g key={`stairs-${i}`}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="#fff3e0"
                stroke="#ffa726"
                strokeWidth={2}
                rx={8}
              />
              <Stars
                x={x + w / 2 - 12}
                y={y + h / 2 - 12}
                width={24}
                height={24}
                color="#ffa726"
              />
            </g>
          );
        })}

      {/* Путь */}
      {path.length > 1 && (
        <polyline
          points={path.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')}
          fill="none"
          stroke="red"
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.9}
          strokeDasharray="12,8"
        />
      )}
    </svg>
  );
}
