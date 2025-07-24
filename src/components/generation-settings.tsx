"use client";

import { useStore, OutputSize } from "@/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const OUTPUT_SIZES: OutputSize[] = [
  "256x256",
  "512x512",
  "768x768",
  "1024x1024",
];

export function GenerationSettings() {
  const { outputSize, setOutputSize } = useStore();

  return (
    <div className="space-y-2">
      <Label htmlFor="output-size">Output Size</Label>
      <Select
        value={outputSize}
        onValueChange={(value) => setOutputSize(value as OutputSize)}
      >
        <SelectTrigger id="output-size">
          <SelectValue placeholder="Select a size" />
        </SelectTrigger>
        <SelectContent>
          {OUTPUT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
