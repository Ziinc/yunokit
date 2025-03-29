import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentSchema } from "@/lib/contentSchema";
import { DocsButton } from "@/components/ui/DocsButton";

interface ContentListHeaderProps {
  handleCreateNew: (schemaId: string) => void;
  schemas: ContentSchema[];
}

export const ContentListHeader: React.FC<ContentListHeaderProps> = ({
  handleCreateNew,
  schemas,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <DocsButton href="https://docs.supacontent.tznc.net/content-management" />
        </div>
        <p className="text-muted-foreground">
          Manage and organize all your content items
        </p>
      </div>
      <div className="flex gap-2">
        <Select onValueChange={(value) => handleCreateNew(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Create new content" />
          </SelectTrigger>
          <SelectContent>
            {schemas.map(schema => (
              <SelectItem key={schema.id} value={schema.id}>
                {schema.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => navigate('/schemas')}>
          Manage Schemas
        </Button>
      </div>
    </div>
  );
};
