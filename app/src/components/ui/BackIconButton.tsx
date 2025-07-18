import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BackIconButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const BackIconButton: React.FC<BackIconButtonProps> = ({ label, onClick, className }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} className={className}>
          <ChevronLeft size={16} />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
