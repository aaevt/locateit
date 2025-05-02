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
    left: 0,
    top: 0,
    width,
    height,
    fill: "rgba(255,165,0,0.2)",
    stroke: "orange",
    strokeWidth: 2,
    selectable: false,
    hasBorders: false,
    hasControls: false,
  });

  const text = new Text(`Лестница\n${fromFloor} → ${toFloor}`, {
    fontSize: 14,
    fill: "black",
    originX: "center",
    originY: "center",
    left: width / 2,
    top: height / 2,
    textAlign: "center",
    width: width,
    height: height,
  });

  const group = new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    objectCaching: false,
  });

  return group;
};
