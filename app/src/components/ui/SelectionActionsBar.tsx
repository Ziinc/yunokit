import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface SelectionAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
}

interface SelectionActionsBarProps {
  selectedCount: number;
  actions: SelectionAction[];
  className?: string;
}

export const SelectionActionsBar: React.FC<SelectionActionsBarProps> = ({
  selectedCount,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-4 border-b",
        "transition-all duration-200 ease-in-out",
        "animate-in slide-in-from-top fade-in",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=closed]:fade-out",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{selectedCount} items selected</span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "ghost"}
            size="sm"
            onClick={action.onClick}
            className={cn(
              "h-8",
              action.variant === "destructive" && "text-destructive"
            )}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}; 