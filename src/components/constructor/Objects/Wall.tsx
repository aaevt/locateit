import React from 'react';
import { Line } from 'fabric';

interface WallProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
}

const Wall: React.FC<WallProps> = ({ x1, y1, x2, y2, stroke }) => {
  return (
    <Line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={4}
    />
  );
};

export default Wall;
