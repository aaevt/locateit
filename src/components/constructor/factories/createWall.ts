import { Line } from 'fabric';

export const createWall = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  id?: string
) => {
  return new Line([x1, y1, x2, y2], {
    stroke: 'black',
    strokeWidth: 2,
    selectable: true,
    hasControls: false,
    hasBorders: false,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    id,
  });
};
