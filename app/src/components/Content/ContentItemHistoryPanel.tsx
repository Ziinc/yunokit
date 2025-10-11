import React from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { hasItems } from "@/lib/guards";

interface Version {
  id: number;
  created_at: string;
  data: Record<string, unknown> | null;
}

interface ContentItemHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions?: Version[];
}

export const ContentItemHistoryPanel: React.FC<ContentItemHistoryPanelProps> = ({
  open,
  onOpenChange,
  versions,
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-[400px]">
      <SheetHeader>
        <SheetTitle>Version History</SheetTitle>
      </SheetHeader>
      <ScrollArea className="h-full pr-4 mt-4">
        <div className="space-content">
          {hasItems(versions) ? (
            versions.map((v) => (
              <div key={v.id}>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(v.created_at), "MMM d, yyyy h:mm a")}
                </p>
                <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">
                  {JSON.stringify(v.data, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No history found</p>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
);

export default ContentItemHistoryPanel;
