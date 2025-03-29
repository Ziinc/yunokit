import React from "react";
import { ArrowUpDown } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}

export const SortSelect: React.FC<SortSelectProps> = ({ 
  value, 
  onChange, 
  options 
}) => {
  return (
    <Select value={value || "title"} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-9 bg-background border border-input rounded-md shadow-sm focus:ring-0 focus:ring-offset-0">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <SelectValue placeholder="Sort by..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(option => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}; 