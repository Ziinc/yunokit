import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, AlignLeft } from 'lucide-react';

interface ContentDividerProps {
  onAddParagraph: () => void;
  onAddField: () => void;
}

export const ContentDivider: React.FC<ContentDividerProps> = ({ onAddParagraph, onAddField }) => {
  return (
    <div className="group relative my-2">
      <div className="h-px bg-border"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm px-2 py-1">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/80 rounded-sm"
                  onClick={onAddParagraph}
                  data-testid="add-paragraph-button"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add paragraph</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px h-4 bg-border"></div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/80 rounded-sm"
                  onClick={onAddField}
                  data-testid="add-field-button"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};