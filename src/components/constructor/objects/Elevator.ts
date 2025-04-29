import { Rect, Text, Group } from "fabric";

export const createElevator = (
  x: number,
  y: number,
  width: number,
  height: number,
  floorRange: string,
) => {
  const rect = new Rect({
    left: x,
    top: y,
    width,
    height,
    fill: "lightyellow",
    selectable: true,
    stroke: "orange",
    strokeWidth: 2,
  });

  const text = new Text(`Elevator\n${floorRange}`, {
    fontSize: 12,
    fill: "black",
    originX: "center",
    originY: "center",
    left: x + width / 2,
    top: y + height / 2,
    textAlign: "center",
  });

  return new group([rect, text], {
    selectable: true,
  });
};
