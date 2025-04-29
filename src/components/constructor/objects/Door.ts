import { Line } from "fabric";

export const createDoor = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) => {
  return new Line([startX, startY, endX, endY], {
    stroke: "brown",
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    selectable: true,
    hasControls: false,
    hasBorders: false,
    objectCaching: false,
    originX: "center",
    originY: "center",
  });
};
