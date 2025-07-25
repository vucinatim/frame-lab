"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  PlusSquare,
  Trash2,
  Copy,
  ClipboardPaste,
  ClipboardCopy,
  Download,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnimationPlayback } from "@/hooks/use-animation-playback";
import { AnimationPresets } from "./animation-presets";
import { AnimationExportDialog } from "./animation-export-dialog";

export function Toolbar() {
  const {
    selectedFrame,
    setSelectedFrame,
    isPlaying,
    toggleIsPlaying,
    fps,
    setFps,
    skeletons,
    addFrame,
    deleteFrame,
    copyPose,
    pastePose,
    poseClipboard,
    duplicateFrame,
    viewMode,
    setViewMode,
  } = useStore();

  const [showExportDialog, setShowExportDialog] = useState(false);

  useAnimationPlayback();

  const frameCount = skeletons.length;

  const handleNextFrame = () => {
    setSelectedFrame(Math.min(selectedFrame + 1, frameCount - 1));
  };

  const handlePrevFrame = () => {
    setSelectedFrame(Math.max(selectedFrame - 1, 0));
  };

  return (
    <Card className="py-3">
      <CardContent className="flex items-center gap-2">
        <AnimationPresets />

        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying}
                  onClick={addFrame}
                >
                  <PlusSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Frame</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying}
                  onClick={duplicateFrame}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate Frame</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying || frameCount <= 1}
                  onClick={deleteFrame}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Frame</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying}
                  onClick={copyPose}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Pose</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying || !poseClipboard}
                  onClick={pastePose}
                >
                  <ClipboardPaste className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste Pose</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPlaying || frameCount === 0}
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Animation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevFrame}
                  disabled={isPlaying || selectedFrame === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous Frame</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleIsPlaying}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? "Pause" : "Play"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextFrame}
                  disabled={isPlaying || selectedFrame === frameCount - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Frame</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="text-sm font-mono opacity-50">
            Frame: {selectedFrame + 1} / {frameCount}
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pose-only">Pose Only</SelectItem>
                <SelectItem value="image-only">Image Only</SelectItem>
                <SelectItem value="stack">Stack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-32">
            <Slider
              min={1}
              max={60}
              step={1}
              value={[fps]}
              onValueChange={(value) => setFps(value[0])}
              disabled={isPlaying}
            />
            <div className="text-sm flex w-32">{fps} FPS</div>
          </div>
        </div>
      </CardContent>

      <AnimationExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        skeletons={skeletons}
        fps={fps}
      />
    </Card>
  );
}
