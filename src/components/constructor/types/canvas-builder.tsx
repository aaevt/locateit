import { z } from "zod";

export const canvasBuilderSchema = z.object({
  width: z.coerce.number().min(100).max(1000),
  height: z.coerce.number().min(100).max(1000),
  backgroundColor: z.string(),
  showGrid: z.boolean(),
});

export type CanvasBuilderFormValues = z.infer<typeof canvasBuilderSchema>;

export interface CanvasBuilderProps {
  onSubmit: (data: CanvasBuilderFormValues) => void;
}
