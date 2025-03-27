
import React from "react";
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
import { ContentPagination } from "./ContentPagination";
import { formatDate } from "@/utils/formatDate";

interface ContentTableProps {
  items: ContentItem[];
  schemas: ContentSchema[];
  onRowClick: (item: ContentItem) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ContentTable: React.FC<ContentTableProps> = ({ 
  items, 
  schemas, 
  onRowClick,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Title</TableHead>
          <TableHead>Type</TableHead>
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
            <TableCell colSpan={6} className="h-24 text-center">
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
                onClick={() => onRowClick(item)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground" />
                    {item.title}
                  </div>
                </TableCell>
                <TableCell>{schema?.name || 'Unknown'}</TableCell>
                <TableCell><ContentStatusBadge status={item.status} /></TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                <TableCell>{item.updatedBy?.split('@')[0] || 'Unknown'}</TableCell>
                <TableCell>
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
      <ContentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={onPageChange}
      />
    </div>
    </div>
  );
};
