import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PaginationControls } from "./Content/ContentList/PaginationControls";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  header: React.ReactNode;
  accessorKey: string;
  cell?: (item: T) => React.ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  items: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
  showSelection?: boolean;
  showPagination?: boolean;
}

export const DataTable = <T extends object>({ 
  items, 
  columns,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  onSelectionChange,
  getItemId,
  emptyMessage = "No items found.",
  className,
  rowClassName,
  showSelection = true,
  showPagination = true,
}: DataTableProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const handleSelectItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent row click handler
    
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
        
      // Notify parent about selection change
      if (onSelectionChange) {
        const selectedItems = items.filter(item => newSelection.includes(getItemId(item)));
        onSelectionChange(selectedItems);
      }
      
      return newSelection;
    });
  };
  
  const handleSelectAll = () => {
    const newSelection = !isAllSelected ? items.map(item => getItemId(item)) : [];
    setSelectedItems(newSelection);
    
    // Notify parent about selection change
    if (onSelectionChange) {
      const selectedItems = items.filter(item => newSelection.includes(getItemId(item)));
      onSelectionChange(selectedItems);
    }
  };
  
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;
  
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={isAllSelected || isPartiallySelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary square-checkbox rounded-none"
                />
              </TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={cn(column.width && `w-[${column.width}]`, column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showSelection ? columns.length + 1 : columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            items.map(item => {
              const itemId = getItemId(item);
              return (
                <TableRow 
                  key={itemId} 
                  className={cn(
                    "cursor-pointer hover:bg-muted",
                    rowClassName
                  )}
                  data-selected={selectedItems.includes(itemId)}
                  onClick={() => onRowClick?.(item)}
                >
                  {showSelection && (
                    <TableCell className="p-2">
                      <div onClick={(e) => handleSelectItem(e, itemId)} className="h-full flex items-center justify-center">
                        <Checkbox 
                          checked={selectedItems.includes(itemId)} 
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>
                    </TableCell>
                  )}
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {column.cell ? column.cell(item) : (item as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {showPagination && items.length > 0 && (
        <div className="p-4 border-t">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
