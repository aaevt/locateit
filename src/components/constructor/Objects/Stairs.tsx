import { Circle } from 'fabric';

interface StairsProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
}

export default function Stairs(props: StairsProps) {
  const radius = props.width / 2;

  return new Circle({
    left: props.left,
    top: props.top,
    radius: radius,
    fill: props.fill,
    selectable: true,
  });
}
