import * as fabric from "fabric";

export const snapToGrid = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

export const limitPan = (
  canvas: fabric.Canvas,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform;
  if (!vpt) return;

  const canvasWidthScaled = canvasWidth * zoom;
  const canvasHeightScaled = canvasHeight * zoom;
  const containerWidth = canvas.getWidth();
  const containerHeight = canvas.getHeight();

  const maxPanX = (canvasWidthScaled - containerWidth) / 2;
  const minPanX = -maxPanX;
  const maxPanY = (canvasHeightScaled - containerHeight) / 2;
  const minPanY = -maxPanY;

  vpt[4] = Math.max(minPanX, Math.min(vpt[4], maxPanX));
  vpt[5] = Math.max(minPanY, Math.min(vpt[5], maxPanY));
};

export const updateStore = (
  canvas: fabric.Canvas,
  setObjects: (objects: fabric.Object[]) => void,
  currentFloorId: string,
): void => {
  const json = canvas.toJSON();
  if (json) {
    setObjects(json.objects || []);
    localStorage.setItem("canvas", JSON.stringify({ [currentFloorId]: json }));
  }
};
