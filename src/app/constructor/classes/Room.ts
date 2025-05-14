import {
  Group,
  Rect,
  Textbox,
  classRegistry,
  type SerializedGroupProps,
  type TClassProperties,
  type TOptions,
  type ObjectEvents,
  type RectProps,
} from "fabric";

interface RoomExtraProps {
  label?: string;
  roomNumber?: number;
}

export interface SerializedRoomProps
  extends SerializedGroupProps,
    RoomExtraProps {}
export interface RoomProps extends SerializedRoomProps {}

export class Room<
  Props extends TOptions<RoomProps> = Partial<RoomProps>,
  SProps extends SerializedRoomProps = SerializedRoomProps,
  EventSpec extends ObjectEvents = ObjectEvents,
> extends Group {
  static type = "room";
  declare label?: string;
  declare roomNumber?: number;

  constructor(
    label: string = "",
    rectOptions: Partial<RectProps> & { roomNumber?: number } = {},
  ) {
    const width = rectOptions.width ?? 50;
    const height = rectOptions.height ?? 50;

    const rect = new Rect({
      width: width,
      height: height,
      fill: "rgba(0, 0, 255, 0.5)",
      stroke: undefined,
      strokeWidth: 0,
    });

    const text = new Textbox(label, {
      width: width - 1,
      height,
      left: width / 2,
      top: height / 2,
      originX: "center",
      originY: "center",
      fontSize: 16,
      fill: "white",
      textAlign: "center",
    });

    super([rect, text], {
      left: rectOptions.left,
      top: rectOptions.top,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    this.label = label;
    this.roomNumber = rectOptions.roomNumber;
  }

  override toObject<
    T extends Omit<Props & TClassProperties<this>, keyof SProps>,
    K extends keyof T = never,
  >(propertiesToInclude: K[] = []): Pick<T, K> & SProps {
    return {
      ...super.toObject([
        ...propertiesToInclude,
        "label",
        "roomNumber",
        "angle",
        "scaleX",
        "scaleY",
        "flipX",
        "flipY",
      ]),
      label: this.label,
      roomNumber: this.roomNumber,
    };
  }

  static override async fromObject(object: SerializedRoomProps): Promise<Room> {
    const {
      label = "",
      roomNumber,
      left = 0,
      top = 0,
      width = 100,
      height = 100,
      stroke,
      strokeWidth,
      fill,
      angle,
      scaleX,
      scaleY,
      flipX,
      flipY,
    } = object;

    const room = new Room(label, {
      left,
      top,
      width,
      height,
      roomNumber,
      stroke,
      strokeWidth,
      fill,
    });

    room.set({
      angle: angle ?? 0,
      scaleX: scaleX ?? 1,
      scaleY: scaleY ?? 1,
      flipX: flipX ?? false,
      flipY: flipY ?? false,
    });

    return room;
  }
}

classRegistry.setClass(Room, "room");
classRegistry.setSVGClass(Room, "room");

