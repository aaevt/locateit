export type CanvasObjectType = "wall" | "room" | "door" | "stair" | "point";

export interface BaseObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
}

export interface Wall extends BaseObject {
  type: "wall";
  x2: number;
  y2: number;
}

export interface Room extends BaseObject {
  type: "room";
  width: number;
  height: number;
  name: string;
}

export interface Door extends Wall {
  type: "door";
}

export interface Stair extends BaseObject {
  type: "stair";
  width: number;
  height: number;
  name: string;
  connectsTo: number[];
}

export interface Point extends BaseObject {
  type: "point";
}

export type CanvasObject = Wall | Room | Door | Stair | Point;
