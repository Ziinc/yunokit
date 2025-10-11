import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface SharedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const SharedPagination = ({ currentPage, totalPages, onPageChange }: SharedPaginationProps) => {
  const handlePrevious = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {isPreviousDisabled ? (
            <PaginationPrevious
              className="pointer-events-none opacity-50"
              tabIndex={-1}
              aria-disabled="true"
            />
          ) : (
            <PaginationPrevious onClick={handlePrevious} />
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
          {isNextDisabled ? (
            <PaginationNext
              className="pointer-events-none opacity-50"
              tabIndex={-1}
              aria-disabled="true"
            />
          ) : (
            <PaginationNext onClick={handleNext} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}; 