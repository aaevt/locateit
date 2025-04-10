import { Rect } from 'fabric';

interface DoorProps {
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
}

export default function Door({
  left,
  top,
  width = 40,
  height = 10,
  fill = 'darkred',
}: DoorProps) {
  return new Rect({
    left,
    top,
    width,
    height,
    fill,
    selectable: true,
  });
}
