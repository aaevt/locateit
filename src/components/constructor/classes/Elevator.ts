import { Stairs, StairsSerializedProps } from "./Stairs";
import { classRegistry } from "fabric";

type ElevatorSerializedProps = StairsSerializedProps & {
  type: "elevator";
};

export class Elevator extends Stairs {
  static type = "elevator";

  constructor(objects: any[], options: any = {}) {
    super(objects, {
      ...options,
      type: Elevator.type,
      fill: "rgba(128, 128, 128, 0.2)",
      stroke: "gray",
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Elevator.type,
    };
  }

  static fromObject(object: ElevatorSerializedProps, callback: (elevator: Elevator) => void) {
    const objects = object.objects;
    if (!Array.isArray(objects)) {
      throw new Error("Invalid objects array for Elevator.");
    }
    callback(new Elevator(objects, object));
  }
}

classRegistry.setClass(Elevator);
classRegistry.setSVGClass(Elevator);
