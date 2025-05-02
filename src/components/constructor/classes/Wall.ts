import { Line, classRegistry, SerializedLineProps } from "fabric";
import { BaseObject } from "./BaseObject";

type WallSerializedProps = SerializedLineProps & {
  points: [number, number, number, number];
  type: "wall";
};

export class Wall extends Line {
  static type = "wall";

  constructor(
    points: [number, number, number, number],
    options?: Partial<SerializedLineProps>,
  ) {
    super(points, {
      ...options,
      type: Wall.type,
      strokeWidth: 2,
      stroke: "black",
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Wall.type,
    };
  }

  static fromObject(
    object: WallSerializedProps,
    callback: (wall: Wall) => void,
  ) {
    const points = object.points;
    if (!Array.isArray(points) || points.length !== 4) {
      throw new Error("Invalid points array for Wall.");
    }
    callback(new Wall(points, object));
  }
}

classRegistry.setClass(Wall);
classRegistry.setSVGClass(Wall);
