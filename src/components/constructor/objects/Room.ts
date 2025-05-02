import { Rect, Textbox, Group } from "fabric";

export const createRoom = (x: number, y: number, width: number, height: number): fabric.Group => {
  const rect = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: "rgba(0, 0, 255, 0.1)",
    stroke: "blue",
    strokeWidth: 2,
    selectable: false,
    hasBorders: false,
    hasControls: false,
  });

  const text = new Textbox("Room", {
    left: width / 2,
    top: height / 2,
    width: width,
    height: height,
    fontSize: 16,
    fill: "blue",
    textAlign: "center",
    originX: "center",
    originY: "center",
    selectable: false,
    transparentCorners: true,
    backgroundColor: "",
  });

  const group = new Group([rect, text], {
    left: x,
    top: y,
    hasControls: true,
    hasBorders: true,
    selectable: true,
    objectCaching: false,
  });

  return group;
};