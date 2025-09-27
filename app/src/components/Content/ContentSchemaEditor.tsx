import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, FileText, List, Check, FileJson } from "lucide-react";
// ContentFieldType is now SchemaFieldType from SchemaApi
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DocsButton } from "@/components/ui/DocsButton";
import { ContentSchemaRow, SchemaField, SchemaFieldType  } from "@/lib/api/SchemaApi";

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
      strict: true, // Default to strict mode
    }
  );

  const [newFieldDialogOpen, setNewFieldDialogOpen] = useState(false);
  const [newField, setNewField] = useState<SchemaField>({
    label: "",
    type: SchemaFieldType.TEXT,
    required: false,
    options: [],
    description: "",
    default_value: null,
    relation_schema_id: null,
  });
  
  const [newOption, setNewOption] = useState("");

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

  const addField = () => {
    if (!newField.label) {
      toast({
        title: "Field label required",
        description: "Please provide a label for the field",
        variant: "destructive",
      });
      return;
    }

    setSchema({
      ...schema,
      fields: [...schema.fields, { ...newField }],
    });

    // Reset new field
    setNewField({
      label: "",
      type: SchemaFieldType.TEXT,
      required: false,
      options: [],
      description: "",
      default_value: null,
      relation_schema_id: null,
    });

    setNewFieldDialogOpen(false);
    
    toast({
      title: "Field added",
      description: `Added ${newField.label} field to ${schema.name}`,
    });
  };

  const removeField = (field: SchemaField) => {
    setSchema({
      ...schema,
      fields: schema.fields.filter((f) => f !== field),
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

  const addOption = () => {
    if (!newOption) return;
    if (newField.options?.includes(newOption)) {
      toast({
        title: "Duplicate option",
        description: "This option already exists",
        variant: "destructive",
      });
      return;
    }
    
    setNewField({
      ...newField,
      options: [...(newField.options || []), newOption],
    });
    setNewOption("");
  };

  const removeOption = (option: string) => {
    setNewField({
      ...newField,
      options: newField.options?.filter(o => o !== option),
    });
  };

  const applyQuickstart = (
    template: 'article' | 'product' | 'event'
  ) => {
    const templates: Record<string, SchemaField[]> = {
      article: [
        { label: 'Title', type: SchemaFieldType.TEXT, required: true },
        { label: 'Summary', type: SchemaFieldType.TEXT },
        {
          label: 'Tags',
          type: SchemaFieldType.ENUM,
          options: ['General', 'Update', 'Opinion'],
        },
        { label: 'Content', type: SchemaFieldType.MARKDOWN, required: true },
      ],
      product: [
        { label: 'Name', type: SchemaFieldType.TEXT, required: true },
        { label: 'Price', type: SchemaFieldType.NUMBER, required: true },
        { label: 'Image', type: SchemaFieldType.IMAGE },
        { label: 'Description', type: SchemaFieldType.MARKDOWN },
      ],
      event: [
        { label: 'Name', type: SchemaFieldType.TEXT, required: true },
        { label: 'Date', type: SchemaFieldType.DATE, required: true },
        { label: 'Location', type: SchemaFieldType.TEXT },
        { label: 'Description', type: SchemaFieldType.MARKDOWN },
      ],
    };

    setSchema((s) => ({ ...s, fields: templates[template] }));
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

            <div className="flex items-center space-x-2">
              <Switch
                id="strictMode"
                checked={schema.strict !== false}
                onCheckedChange={(checked) => setSchema({
                  ...schema,
                  strict: checked
                })}
              />
              <Label htmlFor="strictMode">Strict Schema Mode</Label>
              <p className="text-sm text-muted-foreground ml-2">
                {schema.strict !== false
                  ? "Only predefined fields allowed"
                  : "Allow adding custom fields dynamically"}
              </p>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fields</h3>
              <Dialog open={newFieldDialogOpen} onOpenChange={setNewFieldDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus size={16} />
                    Add Field
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Field</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldName">Field Name</Label>
                      <Input
                        id="fieldName"
                        value={newField.label}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                        placeholder="e.g., Title, Content, IsPublished"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["text", "number", "date", "boolean", "enum", "relation", "image", "markdown", "json"] as ContentFieldType[]).map((type) => (
                          <Button
                            key={type}
                            variant={newField.type === type ? "default" : "outline"}
                            className={`justify-start text-left ${newField.type === type ? "" : "border-dashed"}`}
                            onClick={() => setNewField({ ...newField, type: type as SchemaFieldType })}
                          >
                            <div className="flex items-center">
                              {getFieldTypeIcon(type)}
                              <span className="ml-2 capitalize">{type}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="required"
                        checked={newField.required || false}
                        onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                      />
                      <Label htmlFor="required">Required Field</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newField.description || ""}
                        onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                        placeholder="Instructions for content editors"
                      />
                    </div>
                    
                    {newField.type === "enum" && (
                      <div className="space-y-3">
                        <Label>Options</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Add option..."
                            className="flex-1"
                          />
                          <Button type="button" onClick={addOption} size="sm">
                            Add
                          </Button>
                        </div>
                        
                        {newField.options && newField.options.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {newField.options.map((option) => (
                              <div key={option} className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span>{option}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(option)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={addField}>
                      Add Field
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {schema.fields.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md space-y-4">
                <p className="text-muted-foreground">
                  No fields added yet. Use a quickstart or click "Add Field" to
                  build your schema.
                </p>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickstart('article')}
                  >
                    Article
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickstart('product')}
                  >
                    Product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickstart('event')}
                  >
                    Event
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {schema.fields.map((field) => (
                  <Card key={field.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getFieldTypeIcon(field.type)}
                        <div className="ml-3">
                          <h4 className="font-medium">{field.name}</h4>
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
