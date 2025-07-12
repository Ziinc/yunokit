import React from "react";
import { SortSelect, SortOption } from "./SortSelect";
import { ArrowUpDown, Info } from "lucide-react";

interface ResultsBarProps {
  totalItems: number;
  sortField: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
}

export const ResultsBar: React.FC<ResultsBarProps> = ({
  totalItems,
  sortField,
  onSortChange,
  sortOptions
}) => {
  return (
    <div className="flex w-full h-[3.75rem] items-center justify-between px-4 border-b">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Info size={14} />
        <span>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} found
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Sort by:</span>
        <SortSelect 
          value={sortField}
          onChange={onSortChange}
          options={sortOptions}
        />
      </div>
    </div>
  );
} 