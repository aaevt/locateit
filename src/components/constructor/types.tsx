export interface CanvasLayer {
    id: string;
    name: string;
    objects: fabric.Object[];
    visible: boolean;
    locked: boolean;
  }