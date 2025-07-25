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

const presets = Object.keys(PRESETS).map((key) => ({
  value: key,
  label: `${key} (${PRESETS[key].length} frame${
    PRESETS[key].length > 1 ? "s" : ""
  })`,
}));

export function AnimationPresets() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("Default");
  const loadSkeletons = useStore((state) => state.loadSkeletons);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-44 justify-between"
        >
          {value
            ? presets.find((preset) => preset.value === value)?.label
            : "Select a preset..."}
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
                    loadSkeletons(PRESETS[currentValue]);
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
