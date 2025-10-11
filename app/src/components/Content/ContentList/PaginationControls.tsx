import { SharedPagination } from "@/components/ui/shared-pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100]
}: PaginationControlsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Select 
          value={String(itemsPerPage)} 
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue>{`${itemsPerPage} per page`}</SelectValue>
          </SelectTrigger>
          <SelectContent align="start">
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={String(size)}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center">
        <SharedPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}; 