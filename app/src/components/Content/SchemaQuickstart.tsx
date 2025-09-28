import React from "react";
import { Button } from "@/components/ui/button";
import { SchemaField, SchemaFieldType } from "@/lib/api/SchemaApi";

interface SchemaQuickstartProps {
  onApply: (fields: SchemaField[]) => void;
}

export const SchemaQuickstart: React.FC<SchemaQuickstartProps> = ({ onApply }) => {
  const templates: Record<"article" | "product" | "event", Omit<SchemaField, "id">[]> = {
    article: [
      { label: "Title", type: SchemaFieldType.TEXT, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Summary", type: SchemaFieldType.TEXT, required: false, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Tags", type: SchemaFieldType.ENUM, required: false, options: ["General", "Update", "Opinion"], description: "", default_value: null, relation_schema_id: null },
      { label: "Content", type: SchemaFieldType.MARKDOWN, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
    ],
    product: [
      { label: "Name", type: SchemaFieldType.TEXT, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Price", type: SchemaFieldType.NUMBER, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Image", type: SchemaFieldType.IMAGE, required: false, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Description", type: SchemaFieldType.MARKDOWN, required: false, options: [], description: "", default_value: null, relation_schema_id: null },
    ],
    event: [
      { label: "Name", type: SchemaFieldType.TEXT, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Date", type: SchemaFieldType.DATE, required: true, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Location", type: SchemaFieldType.TEXT, required: false, options: [], description: "", default_value: null, relation_schema_id: null },
      { label: "Description", type: SchemaFieldType.MARKDOWN, required: false, options: [], description: "", default_value: null, relation_schema_id: null },
    ],
  };

  const handleApply = (template: keyof typeof templates) => {
    const fields = templates[template].map((field) => ({ id: crypto.randomUUID(), ...field }));
    onApply(fields);
  };

  return (
    <div className="text-center p-6 border border-dashed rounded-md space-y-4">
      <p className="text-muted-foreground">
        No fields added yet. Use a quickstart or click "Add Field" to build your schema.
      </p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => handleApply("article")}>Article</Button>
        <Button variant="outline" size="sm" onClick={() => handleApply("product")}>Product</Button>
        <Button variant="outline" size="sm" onClick={() => handleApply("event")}>Event</Button>
      </div>
    </div>
  );
};

