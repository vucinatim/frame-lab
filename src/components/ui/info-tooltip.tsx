"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface InfoTooltipProviderProps {
  children: React.ReactNode;
}

export function InfoTooltipProvider({ children }: InfoTooltipProviderProps) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
