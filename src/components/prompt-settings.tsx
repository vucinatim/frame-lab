"use client";

import { useStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InfoTooltip, InfoTooltipProvider } from "@/components/ui/info-tooltip";

export function PromptSettings() {
  const characterPrompt = useStore((state) => state.characterPrompt);
  const motionPrompt = useStore((state) => state.motionPrompt);
  const framePrompts = useStore((state) => state.framePrompts);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const setCharacterPrompt = useStore((state) => state.setCharacterPrompt);
  const setMotionPrompt = useStore((state) => state.setMotionPrompt);
  const setFramePrompt = useStore((state) => state.setFramePrompt);

  return (
    <InfoTooltipProvider>
      <div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InfoTooltip content="Describe the visual appearance of your character. This defines the overall look, style, clothing, and aesthetic that will be consistent across all animation frames." />
                <Label htmlFor="character-prompt">Character Description</Label>
              </div>
              {!characterPrompt && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCharacterPrompt(
                      "fantasy warrior character, detailed armor and equipment"
                    )
                  }
                >
                  Add Example
                </Button>
              )}
            </div>
            <Textarea
              id="character-prompt"
              placeholder="e.g., fantasy warrior character, red heroic outfit, black cape, warrior helmet"
              value={characterPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCharacterPrompt(e.target.value)
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InfoTooltip content="Describe the movement or action you want your character to perform. This guides the overall motion and behavior across the animation sequence." />
                <Label htmlFor="motion-prompt">Motion Description</Label>
              </div>
              {!motionPrompt && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMotionPrompt(
                      "running at full speed, facing to the right"
                    )
                  }
                >
                  Add Example
                </Button>
              )}
            </div>
            <Textarea
              id="motion-prompt"
              placeholder="e.g., running at full speed, facing to the right"
              value={motionPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMotionPrompt(e.target.value)
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <InfoTooltip
                content={`Optional: Add specific details for this individual frame. For example, describe the exact pose, limb positions, or unique characteristics for frame ${
                  selectedFrame + 1
                }.`}
              />
              <Label htmlFor="frame-prompt">
                Frame {selectedFrame + 1} Custom Prompt (Optional)
              </Label>
            </div>
            <Textarea
              id="frame-prompt"
              placeholder="e.g., mid-stride with right foot forward"
              value={framePrompts[selectedFrame] || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFramePrompt(selectedFrame, e.target.value || null)
              }
              rows={2}
            />
          </div>
        </div>
      </div>
    </InfoTooltipProvider>
  );
}
