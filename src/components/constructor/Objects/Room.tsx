import { Group, Rect, Text } from 'fabric';

interface RoomProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  label?: string;
}

export default function Room({
  left,
  top,
  width,
  height,
  fill,
  label = 'Room',
}: RoomProps) {
  const rect = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill,
    originX: 'left',
    originY: 'top',
    selectable: false,
    stroke: 'black',
    strokeWidth: 2,
  });

  const text = new Text(label, {
    fontSize: 20,
    fill: '#000',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2,
    selectable: false,
    evented: true,
  });

  const group = new Group([rect, text], {
    left,
    top,
    scaleX: 1,
    scaleY: 1,
    hasControls: true,
    hasBorders: true,
    lockScalingFlip: true,
    objectCaching: false,
    subTargetCheck: true,
  });

  // 🔁 Обновление размеров и текста после масштабирования
  group.on('scaled', () => {
    const scaleX = group.scaleX ?? 1;
    const scaleY = group.scaleY ?? 1;

    const newWidth = width * scaleX;
    const newHeight = height * scaleY;

    rect.set({
      width: newWidth,
      height: newHeight,
    });

    text.set({
      left: newWidth / 2,
      top: newHeight / 2,
    });

    group.set({
      scaleX: 1,
      scaleY: 1,
      width: newWidth,
      height: newHeight,
    });

    group.canvas?.renderAll();
  });

  // ✍️ Обновление текста
  group.on('mousedblclick', (e) => {
    if (e.subTargets && e.subTargets[0] === text) {
      const newLabel = prompt('Введите новое имя комнаты:', text.text || '');
      if (newLabel) {
        text.set({ text: newLabel });
        group.canvas?.renderAll();
      }
    }
  });

  return group;
}
