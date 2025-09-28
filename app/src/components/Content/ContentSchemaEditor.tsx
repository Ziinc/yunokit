import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, FileText, List, Check, FileJson } from "lucide-react";
import { ContentFieldType } from "@/lib/contentSchema";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DocsButton } from "@/components/ui/DocsButton";
import { ContentSchemaRow, SchemaField, SchemaFieldType } from "@/lib/api/SchemaApi";
import { SchemaFieldDialog } from "./SchemaFieldDialog";
import { SchemaQuickstart } from "./SchemaQuickstart";

interface ContentSchemaEditorProps {
  initialSchema?: ContentSchemaRow;
  onSave: (schema: Partial<ContentSchemaRow>) => void;
}

export const ContentSchemaEditor: React.FC<ContentSchemaEditorProps> = ({
  initialSchema,
  onSave,
}) => {
  const { toast } = useToast();
  const [schema, setSchema] = useState<Partial<ContentSchemaRow>>(
    initialSchema || {
      name: "",
      description: "",
      fields: [],
      type: "collection" as const,
    }
  );

  const getFieldTypeIcon = (type: ContentFieldType) => {
    switch (type) {
      case SchemaFieldType.MARKDOWN:
        return <FileText size={18} className="text-cms-purple" />;
      case SchemaFieldType.JSON:
        return <FileJson size={18} className="text-cms-blue" />;
      case SchemaFieldType.BOOLEAN:
        return <Check size={18} className="text-green-500" />;
      case SchemaFieldType.ENUM:
        return <List size={18} className="text-amber-500" />;
      default:
        return <FileText size={18} />;
    }
  };

  const handleAddField = (field: SchemaField) => {
    setSchema({
      ...schema,
      fields: [...schema.fields, field],
    });

    toast({
      title: "Field added",
      description: `Added ${field.label} field to ${schema.name}`,
    });
  };

  const removeField = (id: string) => {
    setSchema({
      ...schema,
      fields: schema.fields.filter((f) => f.id !== id),
    });

    toast({
      title: "Field removed",
      description: "The field has been removed",
    });
  };

  const handleSave = () => {
    if (!schema.name) {
      toast({
        title: "Schema name required",
        description: "Please provide a name for the content schema",
        variant: "destructive",
      });
      return;
    }

    onSave(schema);
    
    toast({
      title: "Schema created",
      description: schema.fields.length === 0 
        ? `${schema.name} schema has been created successfully. Don't forget to add fields to make it useful!`
        : `${schema.name} schema has been saved successfully`,
    });
  };

  const handleApplyQuickstart = (fields: SchemaField[]) => {
    setSchema((s) => ({ ...s, fields }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {initialSchema ? "Edit Content Schema" : "Create Content Schema"}
            </CardTitle>
            <DocsButton href="https://yunokit.com/docs/schemas" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schema Name</Label>
              <Input
                id="name"
                value={schema.name}
                onChange={(e) => setSchema({ ...schema, name: e.target.value })}
                placeholder="e.g., Blog Post, Product, Page"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={schema.description || ""}
                onChange={(e) => setSchema({ ...schema, description: e.target.value })}
                placeholder="Describe what this content type is for"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isCollection"
                checked={schema.type === "collection"}
                onCheckedChange={(checked) => setSchema({ 
                  ...schema, 
                  type: checked ? "collection" : "single"
                })}
              />
              <Label htmlFor="isCollection">Collection Type</Label>
              <p className="text-sm text-muted-foreground ml-2">
                {schema.type === "collection" 
                  ? "Will contain multiple content items" 
                  : "Will contain a single content item"}
              </p>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fields</h3>
              <SchemaFieldDialog onAddField={handleAddField} />
            </div>

            {schema.fields.length === 0 ? (
              <SchemaQuickstart onApply={handleApplyQuickstart} />
            ) : (
              <div className="space-y-2">
                {schema.fields.map((field) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getFieldTypeIcon(field.type)}
                        <div className="ml-3">
                          <h4 className="font-medium">{field.label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {field.type} {field.required && "• required"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Schema
        </Button>
      </div>
    </div>
  );
};
