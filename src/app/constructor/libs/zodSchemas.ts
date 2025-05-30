import * as z from "zod";

export const canvasSettingsSchema = z.object({
  gridSize: z.number().min(10).max(500),
  backgroundColor: z.string().min(1),
  canvasWidth: z.number().min(500).max(5000),
  canvasHeight: z.number().min(500).max(5000),
  backgroundImage: z.string().nullable(),
  backgroundOpacity: z.number().min(0).max(1),
  showGrid: z.boolean(),
});
