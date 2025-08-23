import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface SelectionAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  customButton?: React.ReactNode;
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
        "flex w-full h-[3.75rem] items-center justify-between px-4 border-b bg-accent/5",
        "transition-all duration-200 ease-in-out",
        "animate-in fade-in",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{selectedCount} items selected</span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.customButton || (
              <Button
                variant={action.variant || "ghost"}
                size="sm"
                onClick={action.onClick}
                className="h-8"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 