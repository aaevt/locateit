import { Group, classRegistry, IGroupOptions, Object as FabricObject } from "fabric";

type RoomSerializedProps = IGroupOptions & {
  type: "room";
  objects: FabricObject[];
};

export class Room extends Group {
  static type = "room";

  constructor(objects: FabricObject[], options: IGroupOptions = {}) {
    super(objects, {
      ...options,
      type: Room.type,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      objectCaching: false,
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Room.type,
    };
  }

  static fromObject(object: RoomSerializedProps, callback: (room: Room) => void) {
    const objects = object.objects;
    if (!Array.isArray(objects)) {
      throw new Error("Invalid objects array for Room.");
    }
    callback(new Room(objects, object));
  }
}

classRegistry.setClass(Room);
classRegistry.setSVGClass(Room);
