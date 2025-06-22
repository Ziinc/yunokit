import React from "react";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

interface DocsButtonProps {
  href?: string;
}

export const DocsButton: React.FC<DocsButtonProps> = ({ 
  href = "https://yunokit.com/docs" 
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="px-2 py-0.5 h-5 text-xs font-normal text-muted-foreground hover:text-primary"
      asChild
    >
      <a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <Book size={4} className="mr-0.5" />
        Docs
      </a>
    </Button>
  );
}; 