import { Circle } from 'fabric';

export const createPoint = (x: number, y: number, id?: string) => {
  return new Circle({
    left: x - 5,
    top: y - 5,
    radius: 5,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 1,
    selectable: true,
    hasControls: false,
    hasBorders: false,
    id,
  });
};
