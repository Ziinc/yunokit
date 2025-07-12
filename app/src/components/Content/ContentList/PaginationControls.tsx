import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
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

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {currentPage === 1 ? (
                <PaginationPrevious
                  className="pointer-events-none opacity-50"
                  tabIndex={-1}
                  aria-disabled="true"
                />
              ) : (
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                />
              )}
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => onPageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              {currentPage === totalPages ? (
                <PaginationNext
                  className="pointer-events-none opacity-50"
                  tabIndex={-1}
                  aria-disabled="true"
                />
              ) : (
                <PaginationNext
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}; 