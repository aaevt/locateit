import { fabric } from 'fabric';

export class Point extends fabric.Circle {
  public identifier: string;

  constructor(options: any = {}) {
    super({
      ...options,
      radius: options.radius || 5,
      fill: options.fill || 'red',
      stroke: options.stroke || 'black',
      strokeWidth: options.strokeWidth || 1,
    });
    this.identifier = options.identifier || '';
  }

  toObject() {
    return {
      ...super.toObject(),
      identifier: this.identifier,
    };
  }

  toSVG() {
    return super.toSVG();
  }

  static fromObject(object: any, callback: (point: Point) => void) {
    const point = new Point(object);
    callback(point);
  }
} 