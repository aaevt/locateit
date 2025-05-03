import { FabricObject } from "fabric";

export type Floor = {
  id: string;
  number: number;
  name?: string;
  canvasJson: string;
};
