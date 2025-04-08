import { Rect } from 'fabric';

const Room = (left: number, top: number, width: number, height: number) => {
  return new Rect({
    left,
    top,
    width,
    height,
    fill: 'lightblue',
    stroke: 'black',
    strokeWidth: 2,
  });
};

export default Room;
