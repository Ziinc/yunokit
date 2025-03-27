
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ContentItemStatus } from "@/lib/contentSchema";

interface ContentStatusBadgeProps {
  status: ContentItemStatus;
}

export const ContentStatusBadge: React.FC<ContentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800">Published</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'pending_review':
      return <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
