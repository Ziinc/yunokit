import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listContentItemsBySchema } from "@/lib/api/ContentApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { ContentItem } from "@/lib/contentSchema";

interface RelationFieldProps {
  id: string;
  name: string;
  relationSchemaId: string;
  value: string[];
  onChange: (value: string[]) => void;
  description?: string;
  isMultiple?: boolean;
}

export const RelationField: React.FC<RelationFieldProps> = ({
  id,
  name,
  relationSchemaId,
  value = [],
  onChange,
  description,
  isMultiple = false,
}) => {
  const [open, setOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState<ContentItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();
  
  // Load available items when component mounts or relationSchemaId changes
  useEffect(() => {
    const loadAvailableItems = async () => {
      if (!relationSchemaId) return;
      
      setIsLoading(true);
      try {
        if (!currentWorkspace) return;
        const items = await listContentItemsBySchema(
          Number(relationSchemaId),
          currentWorkspace.id
        );
        // Filter out already selected items and only show published items
        const filteredItems = items.filter(item => 
          item.status === 'published' && !value.includes(item.id)
        );
        setAvailableItems(filteredItems);
      } catch (error) {
        console.error('Error loading relation items:', error);
        setAvailableItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableItems();
  }, [relationSchemaId, value]);

  // Load selected items details when value changes
  useEffect(() => {
    const loadSelectedItems = async () => {
      if (value.length === 0) {
        setSelectedItems([]);
        return;
      }

      try {
        if (!currentWorkspace) return;
        const items = await listContentItemsBySchema(
          Number(relationSchemaId),
          currentWorkspace.id
        );
        const selected = items.filter(item => value.includes(item.id));
        setSelectedItems(selected);
      } catch (error) {
        console.error('Error loading selected items:', error);
        setSelectedItems([]);
      }
    };

    loadSelectedItems();
  }, [value, relationSchemaId]);
  
  const handleSelect = (itemId: string) => {
    if (isMultiple) {
      const newValue = [...value, itemId];
      onChange(newValue);
    } else {
      onChange([itemId]);
      setOpen(false);
    }
  };
  
  const handleRemove = (itemId: string) => {
    const newValue = value.filter(id => id !== itemId);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium" htmlFor={id}>
          {name}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedItems.map(item => (
            <Badge key={item.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {item.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 rounded-full"
                onClick={() => handleRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Relation selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isMultiple ? "Select items..." : selectedItems.length > 0 ? selectedItems[0].title : "Select an item..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search items..." />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {availableItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item.id)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value.includes(item.id) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {item.title}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
