import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface ModerationSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  filterPlaceholder: string;
  filterOptions: FilterOption[];
  additionalActions?: React.ReactNode;
}

export const ModerationSearchBar = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  currentFilter,
  onFilterChange,
  filterPlaceholder,
  filterOptions,
  additionalActions
}: ModerationSearchBarProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Input 
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={currentFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={filterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {additionalActions}
    </div>
  );
}; 