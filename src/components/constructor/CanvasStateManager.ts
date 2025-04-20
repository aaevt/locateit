import { Canvas } from 'fabric';
import Room from './objects/Room';
import Wall from './objects/Wall';
import Door from './objects/Door';
import Stairs from './objects/Stairs';

interface CanvasObjectData {
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  data: any;
}

export class CanvasStateManager {
  static saveState(canvas: Canvas): string {
    const objects = canvas.getObjects().map(obj => {
      const baseData: CanvasObjectData = {
        type: obj.type || 'unknown',
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width || 0,
        height: obj.height || 0,
        angle: obj.angle || 0,
        data: (obj as any).data || {}
      };
      return baseData;
    });

    return JSON.stringify({
      objects,
      viewportTransform: canvas.viewportTransform,
      zoom: canvas.getZoom()
    });
  }

  static loadState(canvas: Canvas, state: string): void {
    try {
      const parsedState = JSON.parse(state);
      
      // Очищаем canvas
      canvas.clear();
      
      // Создаем объекты
      parsedState.objects.forEach((objData: CanvasObjectData) => {
        let fabricObject;
        
        switch (objData.type) {
          case 'room':
            fabricObject = new Room({
              ...objData,
              data: objData.data
            });
            break;
          case 'wall':
            fabricObject = new Wall({
              ...objData,
              data: objData.data
            });
            break;
          case 'door':
            fabricObject = new Door({
              ...objData,
              data: objData.data
            });
            break;
          case 'stairs':
            fabricObject = new Stairs({
              ...objData,
              data: objData.data
            });
            break;
          default:
            console.warn(`Unknown object type: ${objData.type}`);
            return;
        }
        
        if (fabricObject) {
          canvas.add(fabricObject);
        }
      });
      
      // Восстанавливаем viewport и zoom
      if (parsedState.viewportTransform) {
        canvas.setViewportTransform(parsedState.viewportTransform);
      }
      if (parsedState.zoom) {
        canvas.setZoom(parsedState.zoom);
      }
      
      canvas.renderAll();
    } catch (error) {
      console.error('Error loading canvas state:', error);
    }
  }
} 