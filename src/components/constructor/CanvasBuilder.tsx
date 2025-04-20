"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  width: z.coerce.number().min(100).max(1000),
  height: z.coerce.number().min(100).max(1000),
  backgroundColor: z.string(),
  showGrid: z.boolean(),
});

interface CanvasBuilderProps {
  onSubmit: (width: number, height: number, backgroundColor: string, showGrid: boolean) => void;
}

const CanvasBuilder: React.FC<CanvasBuilderProps> = ({ onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      showGrid: true,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ width, height, backgroundColor, showGrid }) => onSubmit(width, height, backgroundColor, showGrid))}
        className="space-y-8 p-5 border-1 rounded-sm"
      >
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width</FormLabel>
              <FormControl>
                <Input
                  id="width"
                  type="number"
                  {...field}
                  value={field.value || 0}
                  placeholder="Width"
                />
              </FormControl>
              <FormDescription>Width of the map (between 100 and 1000).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height</FormLabel>
              <FormControl>
                <Input
                  id="height"
                  type="number"
                  {...field}
                  value={field.value || 0}
                  placeholder="Height"
                />
              </FormControl>
              <FormDescription>Height of the map (between 100 and 1000).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormControl>
                <Input
                  id="backgroundColor"
                  type="color"
                  {...field}
                  value={field.value || "#ffffff"}
                  placeholder="Background Color"
                />
              </FormControl>
              <FormDescription>Canvas bg color.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showGrid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg ">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show grid</FormLabel>
                <FormDescription>Use grid system or plain.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button variant="outline" type="submit" className="ml-auto">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default CanvasBuilder;
