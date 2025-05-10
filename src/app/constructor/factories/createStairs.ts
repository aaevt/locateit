import { Stairs } from '../classes/Stairs';

export const createStairs = (
  left: number,
  top: number,
  width: number,
  height: number,
  floors: number[] = []
) => {
  return new Stairs('', {
    left,
    top,
    width,
    height,
    floors,
  });
};
