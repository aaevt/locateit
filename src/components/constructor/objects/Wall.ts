import { Line } from "fabric";

export const createWall = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string = "black",
) => {
  return new Line([startX, startY, endX, endY], {
    stroke: color,
    strokeWidth: 3,
    selectable: true,
    hasControls: false,
    hasBorders: false,
    objectCaching: false,
    originX: "center",
    originY: "center",
  });
};
