import { Circle, classRegistry, ICircleOptions } from "fabric";

type PointSerializedProps = ICircleOptions & {
  type: "point";
};

export class Point extends Circle {
  static type = "point";

  constructor(options: ICircleOptions) {
    super({
      ...options,
      type: Point.type,
      radius: 5,
      fill: "black",
      stroke: "black",
      strokeWidth: 1,
      selectable: true,
      hasControls: false,
      hasBorders: true,
    });
  }

  toObject(propertiesToInclude?: string[]) {
    return {
      ...super.toObject(propertiesToInclude),
      type: Point.type,
    };
  }

  static fromObject(object: PointSerializedProps, callback: (point: Point) => void) {
    callback(new Point(object));
  }
}

classRegistry.setClass(Point);
classRegistry.setSVGClass(Point);
