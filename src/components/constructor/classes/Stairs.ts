import { Group, classRegistry, IGroupOptions, Object as FabricObject } from "fabric";

type StairsSerializedProps = IGroupOptions & {
  type: "stairs";
  objects: FabricObject[];
};

export class Stairs extends Group {
  static type = "stairs";

  constructor(objects: FabricObject[], options: IGroupOptions = {}) {
    super(objects, {
      ...options,
      type: Stairs.type,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      objectCaching: false,
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Stairs.type,
    };
  }

  static fromObject(object: StairsSerializedProps, callback: (stairs: Stairs) => void) {
    const objects = object.objects;
    if (!Array.isArray(objects)) {
      throw new Error("Invalid objects array for Stairs.");
    }
    callback(new Stairs(objects, object));
  }
}

classRegistry.setClass(Stairs);
classRegistry.setSVGClass(Stairs);
