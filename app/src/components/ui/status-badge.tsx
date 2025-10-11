import { Badge } from "@/components/ui/badge";

type StatusVariant = "default" | "destructive" | "secondary" | "outline";

interface StatusBadgeProps {
  status: string;
  variantMap?: Record<string, StatusVariant>;
}

const defaultVariantMap: Record<string, StatusVariant> = {
  "visible": "default",
  "published": "default",
  "active": "default",
  "flagged": "destructive",
  "destructive": "destructive",
  "hidden": "secondary",
  "draft": "secondary",
  "archived": "secondary",
  "private": "outline"
};

export const StatusBadge = ({ 
  status, 
  variantMap = defaultVariantMap 
}: StatusBadgeProps) => {
  const variant = variantMap[status] || "secondary";
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}; 