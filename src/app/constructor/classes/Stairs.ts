import {
  Group,
  Rect,
  Textbox,
  classRegistry,
  type SerializedGroupProps,
  type RectProps,
} from "fabric";

interface StairsExtraProps {
  label?: string;
  floors?: number[];
}

export interface SerializedStairsProps
  extends SerializedGroupProps,
    StairsExtraProps {}
export interface StairsProps extends SerializedStairsProps {}

export class Stairs extends Group {
  static type = "stairs";

  declare label?: string;
  declare floors?: number[];

  constructor(
    label: string = "",
    rectOptions: Partial<RectProps> & { floors?: number[] } = {},
  ) {
    const width = rectOptions.width || 100;
    const height = rectOptions.height || 60;
    const floors = rectOptions.floors || [];

    const rect = new Rect({
      width,
      height,
      fill: "rgba(255, 165, 0, 0.4)",
      stroke: rectOptions.stroke || "orange",
      strokeWidth: rectOptions.strokeWidth || 1,
    });

    const labelText =
      floors.length > 0 ? `Floors: ${floors.join(", ")}` : label;

    const text = new Textbox(labelText, {
      width,
      height,
      left: width / 2,
      top: height / 2,
      originX: "center",
      originY: "center",
      fontSize: 14,
      fill: "black",
      textAlign: "center",
      editable: false,
    });

    super([rect, text], {
      left: rectOptions.left,
      top: rectOptions.top,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    this.label = label;
    this.floors = floors;
  }

  override toObject(propertiesToInclude: string[] = []): SerializedStairsProps {
    return {
      ...super.toObject([
        ...propertiesToInclude,
        "label",
        "floors",
        "angle",
        "scaleX",
        "scaleY",
        "flipX",
        "flipY",
      ]),
      label: this.label,
      floors: this.floors,
    };
  }

  static override async fromObject(
    object: SerializedStairsProps,
  ): Promise<Stairs> {
    const {
      label = "",
      floors = [],
      left = 0,
      top = 0,
      width = 100,
      height = 60,
      stroke,
      strokeWidth,
      fill,
      angle,
      scaleX,
      scaleY,
      flipX,
      flipY,
    } = object;

    const stairs = new Stairs(label, {
      left,
      top,
      width,
      height,
      stroke,
      strokeWidth,
      fill,
      floors,
    });

    stairs.set({
      angle: angle ?? 0,
      scaleX: scaleX ?? 1,
      scaleY: scaleY ?? 1,
      flipX: flipX ?? false,
      flipY: flipY ?? false,
    });

    return stairs;
  }
}

classRegistry.setClass(Stairs, "stairs");
classRegistry.setSVGClass(Stairs, "stairs");

