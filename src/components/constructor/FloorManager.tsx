import { CanvasStateManager } from './CanvasStateManager';

const handleFloorChange = (floorId: string) => {
  if (canvas) {
    // Save current floor state
    const currentState = CanvasStateManager.saveState(canvas);
    localStorage.setItem(`canvasState_${currentFloorId}`, currentState);

    // Load new floor state
    const newState = localStorage.getItem(`canvasState_${floorId}`);
    if (newState) {
      CanvasStateManager.loadState(canvas, newState);
    } else {
      canvas.clear();
    }

    setCurrentFloorId(floorId);
  }
}; 