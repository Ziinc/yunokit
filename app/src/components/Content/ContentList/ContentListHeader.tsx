import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentSchemaRow } from "@/lib/api/SchemaApi";
import { DocsButton } from "@/components/ui/DocsButton";

interface ContentListHeaderProps {
  handleCreateNew: (schemaId: string) => void;
  schemas: ContentSchemaRow[];
}

export const ContentListHeader: React.FC<ContentListHeaderProps> = ({
  handleCreateNew,
  schemas  = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
          <DocsButton href="https://yunokit.com/docs/content-management" />
        </div>
        <p className="text-muted-foreground mt-1">
          Create, edit and manage your content items
        </p>
      </div>
      <div className="flex gap-2">
        <Select onValueChange={(value) => handleCreateNew(value)}>
          <SelectTrigger className="w-[180px] bg-primary text-primary-foreground hover:bg-primary/90">
            <SelectValue placeholder="Create new content" />
          </SelectTrigger>
          <SelectContent>
            {schemas.map(schema => (
              <SelectItem key={schema.id} value={schema.id.toString()}>
                {schema.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
