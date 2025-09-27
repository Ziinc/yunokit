import React from "react";
import { Badge } from "@/components/ui/badge";
import { ContentItemStatus } from "@/lib/api/SchemaApi";

interface ContentStatusBadgeProps {
  status: ContentItemStatus;
}

export const ContentStatusBadge: React.FC<ContentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800 max-w-[120px] truncate">Published</Badge>;
    case 'draft':
      return <Badge variant="outline" className="max-w-[120px] truncate">Draft</Badge>;
    case 'pending_review':
      return <Badge className="bg-amber-100 text-amber-800 max-w-[120px] truncate">Pending Review</Badge>;
    default:
      return <Badge variant="outline" className="max-w-[120px] truncate">{status}</Badge>;
  }
};
