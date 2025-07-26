"use client";

import { useStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PromptSettings() {
  const characterPrompt = useStore((state) => state.characterPrompt);
  const motionPrompt = useStore((state) => state.motionPrompt);
  const framePrompts = useStore((state) => state.framePrompts);
  const selectedFrame = useStore((state) => state.selectedFrame);
  const setCharacterPrompt = useStore((state) => state.setCharacterPrompt);
  const setMotionPrompt = useStore((state) => state.setMotionPrompt);
  const setFramePrompt = useStore((state) => state.setFramePrompt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="character-prompt">Character Description</Label>
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
            <Label htmlFor="motion-prompt">Motion Description</Label>
            {!motionPrompt && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMotionPrompt("running at full speed, facing to the right")
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
          <Label htmlFor="frame-prompt">
            Frame {selectedFrame + 1} Custom Prompt (Optional)
          </Label>
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
      </CardContent>
    </Card>
  );
}
