import { Room } from '../classes/Room';

export const createRoom = (
  left: number,
  top: number,
  width = 1,
  height = 1,
  label = 'Room',
  roomNumber?: number
) => {
  return new Room(label, {
    left,
    top,
    width,
    height,
    roomNumber,
  });
};
