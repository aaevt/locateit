import { Wall, WallSerializedProps } from "./Wall";
import { classRegistry } from "fabric";

type DoorSerializedProps = WallSerializedProps & {
  type: "door";
};

export class Door extends Wall {
  static type = "door";

  constructor(
    points: [number, number, number, number],
    options?: Partial<WallSerializedProps>,
  ) {
    super(points, {
      ...options,
      type: Door.type,
      strokeDashArray: [5, 5],
      stroke: "brown",
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Door.type,
    };
  }

  static fromObject(object: DoorSerializedProps, callback: (door: Door) => void) {
    callback(new Door(object.points, object));
  }
}

classRegistry.setClass(Door);
classRegistry.setSVGClass(Door);
