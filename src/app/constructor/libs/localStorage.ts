const STORAGE_KEY = "canvas_state";

export function saveToStorage(data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function loadFromStorage() {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}
