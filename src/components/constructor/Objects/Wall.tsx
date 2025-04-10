import { Rect } from 'fabric';

interface WallProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
}

export default function Wall({
  left,
  top,
  width,
  height,
  fill = 'gray',
}: WallProps) {
  const rect = new Rect({
    left,
    top,
    width,
    height,
    fill,
    originX: 'left',
    originY: 'top',
    stroke: 'black',
    strokeWidth: 1,
    hasControls: true,
    objectCaching: false,
  });

  rect.on('scaling', () => {
    const scaleX = rect.scaleX ?? 1;
    const scaleY = rect.scaleY ?? 1;

    const newWidth = Math.round(rect.width * scaleX);
    const newHeight = Math.round(rect.height * scaleY);

    rect.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });

    rect.setCoords();
    rect.canvas?.renderAll();
  });

  return rect;
}
