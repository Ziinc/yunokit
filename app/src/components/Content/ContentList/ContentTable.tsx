import React, { useState } from "react";
import { FileText, MessageSquare, Calendar, User } from "lucide-react";
import { ContentItem, ContentSchema } from "@/lib/contentSchema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { formatDate } from "@/utils/formatDate";
import { PaginationControls } from "./PaginationControls";
import { Checkbox } from "@/components/ui/checkbox";

interface ContentTableProps {
  items: ContentItem[];
  schemas: ContentSchema[];
  onRowClick: (item: ContentItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onSelectionChange?: (selectedItems: ContentItem[]) => void;
}

export const ContentTable: React.FC<ContentTableProps> = ({ 
  items, 
  schemas, 
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  onSelectionChange
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const handleSelectItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent row click handler
    
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
        
      // Notify parent about selection change
      if (onSelectionChange) {
        const selectedContentItems = items.filter(item => newSelection.includes(item.id));
        onSelectionChange(selectedContentItems);
      }
      
      return newSelection;
    });
  };
  
  const handleSelectAll = () => {
    const newSelection = !isAllSelected ? items.map(item => item.id) : [];
    setSelectedItems(newSelection);
    
    // Notify parent about selection change
    if (onSelectionChange) {
      const selectedContentItems = items.filter(item => newSelection.includes(item.id));
      onSelectionChange(selectedContentItems);
    }
  };
  
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;
  
  return (
    <div>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox 
              checked={isAllSelected || isPartiallySelected}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary square-checkbox rounded-none"
            />
          </TableHead>
          <TableHead className="w-[300px]">Title</TableHead>
          <TableHead>Schema</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              Last Updated
            </span>
          </TableHead>
          <TableHead>
            <span className="flex items-center gap-2">
              <User size={14} />
              Author
            </span>
          </TableHead>
          <TableHead>
            <span className="flex items-center gap-2">
              <MessageSquare size={14} />
              Comments
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No content items found.
            </TableCell>
          </TableRow>
        ) : (
          items.map(item => {
            const schema = schemas.find(s => s.id === item.schemaId);
            return (
              <TableRow 
                key={item.id} 
                className="cursor-pointer hover:bg-muted"
                data-selected={selectedItems.includes(item.id)}
              >
                <TableCell className="p-2">
                  <div onClick={(e) => handleSelectItem(e, item.id)} className="h-full flex items-center justify-center">
                    <Checkbox 
                      checked={selectedItems.includes(item.id)} 
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium" onClick={() => onRowClick(item)}>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground" />
                    {item.title}
                  </div>
                </TableCell>
                <TableCell onClick={() => onRowClick(item)}>{schema?.name || 'Unknown'}</TableCell>
                <TableCell onClick={() => onRowClick(item)}><ContentStatusBadge status={item.status} /></TableCell>
                <TableCell onClick={() => onRowClick(item)}>{formatDate(item.updatedAt)}</TableCell>
                <TableCell onClick={() => onRowClick(item)}>{item.updatedBy?.split('@')[0] || 'Unknown'}</TableCell>
                <TableCell onClick={() => onRowClick(item)}>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-muted-foreground" />
                    {item.comments?.length || 0}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
    <div className="p-4 border-t">
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
    </div>
  );
};
