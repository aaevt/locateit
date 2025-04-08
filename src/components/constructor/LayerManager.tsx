  import { Canvas } from 'fabric';
  import { CanvasLayer } from './types';
  
  export class LayerManager {
    private canvas: Canvas;
    private layers: CanvasLayer[] = [];
    private activeLayerId: string | null = null;
  
    constructor(canvas: Canvas) {
      this.canvas = canvas;
      this.addLayer('Base Layer'); // Создаем базовый слой по умолчанию
    }
  
    // Добавление нового слоя
    addLayer(name: string = `Layer ${this.layers.length + 1}`): CanvasLayer {
      const newLayer: CanvasLayer = {
        id: this.generateId(),
        name,
        objects: [],
        visible: true,
        locked: false,
      };
  
      this.layers.push(newLayer);
      this.setActiveLayer(newLayer.id);
      return newLayer;
    }
  
    // Удаление слоя
    removeLayer(layerId: string): void {
      if (this.layers.length <= 1) return;
  
      const layerIndex = this.layers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return;
  
      // Удаляем объекты слоя с холста
      this.layers[layerIndex].objects.forEach(obj => this.canvas.remove(obj));
      
      // Удаляем слой
      this.layers.splice(layerIndex, 1);
  
      // Если удалили активный слой, выбираем другой
      if (this.activeLayerId === layerId) {
        this.setActiveLayer(this.layers[Math.max(0, layerIndex - 1)].id);
      }
    }
  
    // Переключение видимости слоя
    toggleLayerVisibility(layerId: string): void {
      const layer = this.layers.find(l => l.id === layerId);
      if (!layer) return;
  
      layer.visible = !layer.visible;
      layer.objects.forEach(obj => {
        obj.set({ visible: layer.visible });
        obj.setCoords();
      });
      this.canvas.renderAll();
    }
  
    // Переключение блокировки слоя
    toggleLayerLock(layerId: string): void {
      const layer = this.layers.find(l => l.id === layerId);
      if (!layer) return;
  
      layer.locked = !layer.locked;
      layer.objects.forEach(obj => {
        obj.set({ selectable: !layer.locked, evented: !layer.locked });
      });
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  
    // Изменение порядка слоев
    moveLayer(layerId: string, direction: 'up'|'down'): void {
      const index = this.layers.findIndex(l => l.id === layerId);
      if (index === -1) return;
  
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= this.layers.length) return;
  
      // Меняем слои местами в массиве
      [this.layers[index], this.layers[newIndex]] = [this.layers[newIndex], this.layers[index]];
  
      // Обновляем z-index объектов на холсте
      this.layers.forEach((layer, i) => {
        layer.objects.forEach(obj => {
          this.canvas.moveTo(obj, i);
        });
      });
  
      this.canvas.renderAll();
    }
  
    // Добавление объекта на активный слой
    addObjectToActiveLayer(obj: fabric.Object): void {
      if (!this.activeLayerId) return;
  
      this.canvas.add(obj);
      this.canvas.setActiveObject(obj);
      this.canvas.renderAll();
  
      const activeLayer = this.layers.find(l => l.id === this.activeLayerId);
      if (activeLayer) {
        activeLayer.objects.push(obj);
      }
    }
  
    // Установка активного слоя
    setActiveLayer(layerId: string): void {
      this.activeLayerId = layerId;
    }
  
    // Получение текущих слоев
    getLayers(): CanvasLayer[] {
      return [...this.layers];
    }
  
    // Получение активного слоя
    getActiveLayer(): CanvasLayer | null {
      return this.layers.find(l => l.id === this.activeLayerId) || null;
    }
  
    // Сохранение состояния слоев
    saveState(): any {
      return {
        layers: this.layers.map(layer => ({
          ...layer,
          objects: layer.objects.map(obj => obj.toJSON())
        })),
        activeLayerId: this.activeLayerId
      };
    }
  
    // Загрузка состояния слоев
    async loadState(state: any): Promise<void> {
      if (!state?.layers) return;
  
      // Очищаем текущие слои
      this.layers = [];
      this.canvas.clear();
  
      // Восстанавливаем слои
      for (const layerState of state.layers) {
        const layer: CanvasLayer = {
          ...layerState,
          objects: []
        };
  
        // Восстанавливаем объекты слоя
        if (layerState.objects?.length) {
          const objects = await fabric.util.enlivenObjects(layerState.objects);
          objects.forEach(obj => {
            this.canvas.add(obj);
            obj.set({ visible: layer.visible });
            if (layer.locked) {
              obj.set({ selectable: false, evented: false });
            }
            layer.objects.push(obj);
          });
        }
  
        this.layers.push(layer);
      }
  
      this.activeLayerId = state.activeLayerId || this.layers[0]?.id || null;
      this.canvas.renderAll();
    }
  
    private generateId(): string {
      return Math.random().toString(36).substr(2, 9);
    }
  }