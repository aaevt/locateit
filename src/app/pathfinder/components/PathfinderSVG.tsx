"use client";
import { Stars } from "lucide-react";

interface RoomObj {
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  label?: string;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';
}

interface StairsObj {
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';
}

interface LineObj {
  type: string;
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

interface CanvasJson {
  objects: (RoomObj | StairsObj | LineObj)[];
}

interface PathfinderSVGProps {
  canvasJson: CanvasJson;
  path: { x: number; y: number }[];
  walls: { x1: number; y1: number; x2: number; y2: number }[];
  width?: number;
  height?: number;
}

function roundToNearest(value: number, step = 10) {
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
    x: roundToNearest(x),
    y: roundToNearest(y),
  };
}

const getLineCoordinates = (line: LineObj) => ({
  x1: line.left + line.x1,
  y1: line.top + line.y1,
  x2: line.left + line.x2,
  y2: line.top + line.y2,
});

export function PathfinderSVG({
  canvasJson,
  path,
  walls,
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
          const w = roundToNearest(room.width ?? 100);
          const h = roundToNearest(room.height ?? 100);
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
                x={x + roundToNearest(w / 2)}
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
{/* {walls.map((wall, i) => (
  <line
    key={`wall-${i}`}
    x1={Math.abs(wall.x1)}
    y1={Math.abs(wall.y1)}
    x2={Math.abs(wall.x2)}
    y2={Math.abs(wall.y2)}
    stroke="#222"
    strokeWidth={2}
  />
))} */}

      {/* Двери и линии */}
      {/* {canvasJson.objects?.map((obj, i) => {
        if (obj.type === 'Line') {
          const line = obj as LineObj;
          const isDoor = line.stroke === 'brown';
          const { x1, y1, x2, y2 } = getLineCoordinates(line);

          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={line.stroke || (isDoor ? '#8d6e63' : '#222')}
              strokeWidth={line.strokeWidth || (isDoor ? 4 : 2)}
              strokeDasharray={
                isDoor ? line.strokeDashArray?.join(',') || '10,5' : undefined
              }
            />
          );
        }
        return null;
      })} */}

      {/* Лестницы */}
      {canvasJson.objects
        ?.filter((o): o is StairsObj => o.type === 'stairs')
        .map((stairs, i) => {
          const w = roundToNearest(stairs.width ?? 60);
          const h = roundToNearest(stairs.height ?? 60);
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
                x={x + roundToNearest(w / 2) - 12}
                y={y + roundToNearest(h / 2) - 12}
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
          points={path.map((p) => `${roundToNearest(p.x)},${roundToNearest(p.y)}`).join(' ')}
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