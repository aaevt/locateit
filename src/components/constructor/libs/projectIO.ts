import { useFloorStore } from "@/stores/floorStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useHistoryStore } from "@/stores/historyStore";

export function exportProject() {
  const floors = useFloorStore.getState().floors;
  const currentFloorId = useFloorStore.getState().currentFloorId;
  const objects = useCanvasStore.getState().objects;
  const history = useHistoryStore.getState();

  const data = {
    floors,
    currentFloorId,
    objects,
    history,
  };

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "project.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importProject(file: File) {
  const reader = new FileReader();
  reader.onload = (event) => {
    if (!event.target?.result) return;

    const data = JSON.parse(event.target.result as string);

    const { floors, currentFloorId, objects, history } = data;

    useFloorStore.setState({ floors, currentFloorId });
    useCanvasStore.setState({ objects });
    useHistoryStore.setState(history);

    localStorage.setItem(
      "canvas_state",
      JSON.stringify({ [currentFloorId]: { objects } }),
    );
  };

  reader.readAsText(file);
}
