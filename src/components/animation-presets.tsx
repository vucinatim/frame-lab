"use client";

import * as React from "react";
import { useStore } from "@/store";
import { PRESETS } from "@/lib/animation-presets";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const presets = PRESETS.map((preset) => ({
  value: preset.name,
  label: `${preset.name} (${preset.animation.length} frame${
    preset.animation.length > 1 ? "s" : ""
  })`,
}));

export function AnimationPresets() {
  const [open, setOpen] = React.useState(false);
  const skeletons = useStore((state) => state.skeletons);
  const loadSkeletons = useStore((state) => state.loadSkeletons);

  // Determine if current animation matches any preset
  const getCurrentPresetName = () => {
    const currentSkeletons = skeletons;
    for (const preset of PRESETS) {
      if (
        JSON.stringify(currentSkeletons) === JSON.stringify(preset.animation)
      ) {
        return preset.name;
      }
    }
    return "Custom";
  };

  const [value, setValue] = React.useState(getCurrentPresetName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-44 justify-between"
        >
          {value === "Custom"
            ? `Custom (${skeletons.length} frame${
                skeletons.length > 1 ? "s" : ""
              })`
            : presets.find((preset) => preset.value === value)?.label ||
              "Select a preset..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search presets..." className="h-9" />
          <CommandList>
            <CommandEmpty>No presets found.</CommandEmpty>
            <CommandGroup>
              {presets.map((preset) => (
                <CommandItem
                  key={preset.value}
                  value={preset.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    const selectedPreset = PRESETS.find(
                      (p) => p.name === currentValue
                    );
                    if (selectedPreset) {
                      loadSkeletons(selectedPreset.animation);
                    }
                    setOpen(false);
                  }}
                >
                  {preset.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === preset.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
