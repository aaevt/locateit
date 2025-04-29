import { Rect, Text, Group } from "fabric";

export const createStairs = (
  x: number,
  y: number,
  width: number,
  height: number,
  fromFloor: number,
  toFloor: number,
) => {
  const rect = new Rect({
    left: x,
    top: y,
    width,
    height,
    fill: "rgba(255,165,0,0.2)",
    stroke: "orange",
    strokeWidth: 2,
  });

  const text = new Text(`Лестница\n${fromFloor} → ${toFloor}`, {
    fontSize: 14,
    fill: "black",
    originX: "center",
    originY: "center",
    left: x + width / 2,
    top: y + height / 2,
    textAlign: "center",
  });

  return new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
  });
};
