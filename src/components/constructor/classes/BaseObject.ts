import { Object as FabricObject, classRegistry } from "fabric";

export class BaseObject extends FabricObject {
  static type = "base";

  constructor(options: any) {
    super({
      ...options,
      type: this.constructor.name.toLowerCase(),
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: this.constructor.name.toLowerCase(),
    };
  }

  static fromObject(object: any, callback: (obj: BaseObject) => void) {
    callback(new this(object));
  }
}

classRegistry.setClass(BaseObject);
classRegistry.setSVGClass(BaseObject); 