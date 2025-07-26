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
import { InfoTooltip, InfoTooltipProvider } from "@/components/ui/info-tooltip";

const OUTPUT_SIZES: OutputSize[] = [
  "256x256",
  "512x512",
  "768x768",
  "1024x1024",
];

export function GenerationSettings() {
  const outputSize = useStore((state) => state.outputSize);
  const setOutputSize = useStore((state) => state.setOutputSize);

  return (
    <InfoTooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <InfoTooltip content="Choose the resolution for generated animation frames. Higher resolutions take longer to generate but provide more detail." />
          <Label htmlFor="output-size">Output Size</Label>
        </div>
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
    </InfoTooltipProvider>
  );
}
