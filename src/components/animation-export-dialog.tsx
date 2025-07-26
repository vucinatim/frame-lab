import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OpenPoseSkeleton } from "@/lib/pose-data";
import { type Animation } from "@/lib/animation-presets";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface AnimationExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skeletons: OpenPoseSkeleton[];
  fps: number;
}

export function AnimationExportDialog({
  open,
  onOpenChange,
  skeletons,
  fps,
}: AnimationExportDialogProps) {
  const [animationName, setAnimationName] = useState("My Animation");

  const exportData: Animation = {
    name: animationName,
    fps,
    frames: skeletons,
    frameCount: skeletons.length,
    exportDate: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${animationName.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Animation exported successfully!");
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      toast.success("Animation JSON copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
          <DialogDescription>
            Export your animation as a JSON file that can be imported later or
            used as a preset.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="animation-name" className="text-right">
              Animation Name
            </Label>
            <Input
              id="animation-name"
              type="text"
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              className="col-span-3"
              placeholder="Enter animation name"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Frame Count</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {skeletons.length} frames
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">FPS</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {fps} FPS
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Duration</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {((skeletons.length - 1) / fps).toFixed(2)} seconds
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy JSON
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
