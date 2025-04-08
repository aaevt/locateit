import React from 'react';
import { Line } from 'fabric';

interface StairsProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stepCount: number;
  stepHeight: number;
}

const Stairs: React.FC<StairsProps> = ({ startX, startY, endX, endY, stepCount, stepHeight }) => {
  const stepLines = [];
  const stepWidth = (endX - startX) / stepCount;
  
  for (let i = 0; i < stepCount; i++) {
    const x1 = startX + i * stepWidth;
    const y1 = startY + i * stepHeight;
    const x2 = x1 + stepWidth;
    const y2 = y1 + stepHeight;

    stepLines.push(
      <Line
        key={`step-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="gray"
        strokeWidth={2}
      />
    );
  }

  return <>{stepLines}</>;
};

export default Stairs;
