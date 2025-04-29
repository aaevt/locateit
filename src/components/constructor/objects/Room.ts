import { Rect, Textbox, Group } from "fabric";

export const createRoom = (
  x: number,
  y: number,
  width: number = 1,
  height: number = 1,
  label: string = "Комната",
) => {
  const rect = new Rect({
    width,
    height,
    fill: "rgba(0, 0, 255, 0.1)",
    stroke: "blue",
    strokeWidth: 2,
  });

  const text = new Textbox(label, {
    fontSize: 14,
    fill: "black",
    originX: "center",
    originY: "center",
    editable: true,
  });

  const group = new Group([rect, text], {
    left: x,
    top: y,
    selectable: true,
  });

  return group;
};
