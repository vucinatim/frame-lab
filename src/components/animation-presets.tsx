"use client";

import * as React from "react";
import { useStore } from "@/store";
import {
  animationPresets,
  loadAllAnimations,
  type Animation,
} from "@/lib/animation-presets";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimationPreview } from "./animation-preview";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AnimationPresets() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [availableAnimations, setAvailableAnimations] =
    React.useState<Animation[]>(animationPresets);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadSkeletons = useStore((state) => state.loadSkeletons);
  const setFps = useStore((state) => state.setFps);

  // Load animations dynamically when component mounts
  React.useEffect(() => {
    async function loadDynamicAnimations() {
      setIsLoading(true);
      try {
        const dynamicAnimations = await loadAllAnimations();
        setAvailableAnimations(dynamicAnimations);
      } catch (error) {
        console.error(
          "Failed to load dynamic animations, using static fallback:",
          error
        );
        // Keep using the static animations as fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadDynamicAnimations();
  }, []);

  const handleSelect = (animation: Animation) => {
    setValue(animation.name);
    setOpen(false);
    loadSkeletons(animation.frames);
    setFps(animation.fps);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start gap-2"
            disabled={isLoading}
          >
            {value && !isLoading && (
              <AnimationPreview
                animation={
                  availableAnimations.find(
                    (animation) => animation.name === value
                  )!
                }
                size="xs"
              />
            )}
            <span className="flex-1 text-left">
              {value
                ? availableAnimations.find(
                    (animation) => animation.name === value
                  )?.name
                : isLoading
                ? "Loading animations..."
                : "Select animation..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search animations..." />
            <CommandEmpty>No animations found.</CommandEmpty>
            <CommandGroup>
              {availableAnimations.map((animation) => (
                <CommandItem
                  key={animation.id || animation.name}
                  value={animation.name}
                  onSelect={() => handleSelect(animation)}
                  className="flex items-center gap-3 p-3"
                >
                  <AnimationPreview animation={animation} size="md" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{animation.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {animation.frames.length} frames • {animation.fps} FPS
                      {animation.filename && ` • ${animation.filename}`}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 ml-auto",
                      value === animation.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
