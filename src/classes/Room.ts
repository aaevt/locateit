import { fabric } from 'fabric';

export class Room extends fabric.Rect {
  public label: string;

  constructor(options: any = {}) {
    super({
      ...options,
      fill: options.fill || 'rgba(173, 216, 230, 0.5)', // Light blue with 50% opacity
      stroke: options.stroke || 'black',
      strokeWidth: options.strokeWidth || 1,
    });
    this.label = options.label || '';

    // Add text label
    const text = new fabric.Text(this.label, {
      left: this.left! + this.width! / 2,
      top: this.top! + this.height! / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fill: 'black',
    });

    // Create a group with rect and text
    const group = new fabric.Group([this, text], {
      ...options,
    });

    // Copy properties from group to this
    Object.assign(this, group);
  }

  toObject() {
    return {
      ...super.toObject(),
      label: this.label,
    };
  }

  toSVG() {
    return super.toSVG();
  }

  static fromObject(object: any, callback: (room: Room) => void) {
    const room = new Room(object);
    callback(room);
  }
} 