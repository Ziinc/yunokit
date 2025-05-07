import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  Type, 
  Hash, 
  Calendar, 
  ToggleLeft, 
  List, 
  Link as LinkIcon,
  Image,
  FileText,
  Code,
  Trash2,
  GripVertical,
  AlertCircle,
  Table,
  X,
  Pencil
} from "lucide-react";
import { ContentSchema, ContentField, ContentFieldType } from "@/lib/contentSchema";
import { SchemaApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StrictModeDroppable } from "@/components/StrictModeDroppable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getContentItemsBySchema, saveContentItem } from '@/lib/api/ContentApi';
import { ContentItem } from "@/lib/contentSchema";

// Field type definitions with their icons and labels
const FIELD_TYPES = {
  text: { icon: Type, label: "Text", defaultValue: "" },
  number: { icon: Hash, label: "Number", defaultValue: 0 },
  date: { icon: Calendar, label: "Date", defaultValue: new Date().toISOString() },
  boolean: { icon: ToggleLeft, label: "Boolean", defaultValue: false },
  enum: { icon: List, label: "Enum", defaultValue: "" },
  relation: { icon: LinkIcon, label: "Relation", defaultValue: null },
  image: { icon: Image, label: "Image", defaultValue: null },
  markdown: { icon: FileText, label: "Markdown", defaultValue: "" },
  json: { icon: Code, label: "JSON", defaultValue: {} }
} as const;

interface FieldMigrationOptions {
  action: "delete" | "keep";
}

interface NewFieldData {
  name: string;
  type: keyof typeof FIELD_TYPES;
  required: boolean;
  defaultValue: any;
  relationSchemaId?: string;
  options?: string[];
}

const SchemaEditorPage: React.FC = () => {
  const { schemaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schema, setSchema] = useState<ContentSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [showDeleteField, setShowDeleteField] = useState(false);
  const [selectedField, setSelectedField] = useState<ContentField | null>(null);
  const [showRenameField, setShowRenameField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [migrationOptions, setMigrationOptions] = useState<FieldMigrationOptions>({
    action: "delete"
  });
  const [newField, setNewField] = useState<NewFieldData>({
    name: "",
    type: "text",
    required: false,
    defaultValue: "",
  });
  const [newOption, setNewOption] = useState("");
  const [availableSchemas, setAvailableSchemas] = useState<ContentSchema[]>([]);
  const [contentCount, setContentCount] = useState<number>(0);
  const [singleContentItem, setSingleContentItem] = useState<ContentItem | null>(null);

  // Load schemas for relation fields
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const schemas = await SchemaApi.getSchemas();
        setAvailableSchemas(schemas.filter(s => s.id !== schemaId));
      } catch (error) {
        console.error("Error loading schemas:", error);
      }
    };
    loadSchemas();
  }, [schemaId]);

  // Load schema
  useEffect(() => {
    const loadSchema = async () => {
      if (!schemaId) return;
      
      try {
        setIsLoading(true);
        const schemas = await SchemaApi.getSchemas();
        const schema = schemas.find(s => s.id === schemaId);
        if (schema) {
          setSchema(schema);
        }
      } catch (error) {
        console.error("Error loading schema:", error);
        toast({
          title: "Error loading schema",
          description: "There was a problem loading the schema.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, [schemaId, toast]);

  // Load content count or single content item
  useEffect(() => {
    const loadContentData = async () => {
      if (!schema) return;
      
      try {
        const items = await getContentItemsBySchema(schema.id);
        if (schema.isCollection) {
          setContentCount(items.length);
        } else {
          setSingleContentItem(items[0] || null);
        }
      } catch (error) {
        console.error("Error loading content data:", error);
      }
    };

    loadContentData();
  }, [schema]);

  const handleDragEnd = async (result: DropResult) => {
    if (!schema || !result.destination) return;

    try {
      // Get the new order of field IDs after drag and drop
      const fieldIds = Array.from(schema.fields.map(f => f.id));
      const [movedId] = fieldIds.splice(result.source.index, 1);
      fieldIds.splice(result.destination.index, 0, movedId);

      // Create new fields array in the new order
      const reorderedFields = fieldIds.map(id => schema.fields.find(f => f.id === id)!);
      
      // Update UI optimistically
      setSchema({
        ...schema,
        fields: reorderedFields
      });

      // Call the API to reorder fields
      const updatedSchema = await SchemaApi.reorderFields(schema.id, fieldIds);
      setSchema(updatedSchema);
    } catch (error) {
      console.error("Error reordering fields:", error);
      // Revert to original order on error
      setSchema(schema);
      toast({
        title: "Error reordering fields",
        description: "There was a problem saving the new field order.",
        variant: "destructive"
      });
    }
  };

  const handleAddField = async () => {
    if (!schema || !newField.name.trim()) return;

    try {
      const field: ContentField = {
        id: crypto.randomUUID(),
        name: newField.name,
        type: newField.type,
        required: newField.required,
        defaultValue: newField.defaultValue,
        ...(newField.type === "relation" && {
          relationSchemaId: newField.relationSchemaId
        })
      };

      const updatedSchema = {
        ...schema,
        fields: [...schema.fields, field]
      };

      await SchemaApi.saveSchema(updatedSchema);
      setSchema(updatedSchema);
      setShowAddField(false);
      setNewField({
        name: "",
        type: "text",
        required: false,
        defaultValue: "",
      });
      
      toast({
        title: "Field added",
        description: `${field.name} field has been added successfully.`
      });
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        title: "Error adding field",
        description: "There was a problem adding the field.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteField = async (field: ContentField) => {
    if (!schema) return;

    try {
      const updatedFields = schema.fields.filter(f => f.id !== field.id);
      const updatedSchema = { ...schema, fields: updatedFields };

      await SchemaApi.saveSchema(updatedSchema);
      setSchema(updatedSchema);
      setShowDeleteField(false);
      setSelectedField(null);
      
      toast({
        title: "Field deleted",
        description: `${field.name} field has been deleted successfully.`
      });
    } catch (error) {
      console.error("Error deleting field:", error);
      toast({
        title: "Error deleting field",
        description: "There was a problem deleting the field.",
        variant: "destructive"
      });
    }
  };

  const handleRenameField = async () => {
    if (!schema || !selectedField || !newFieldName.trim()) return;

    try {
      const updatedSchema = await SchemaApi.renameField(schema.id, selectedField.id, newFieldName.trim());
      setSchema(updatedSchema);
      setShowRenameField(false);
      setSelectedField(null);
      setNewFieldName("");
      
      toast({
        title: "Field renamed",
        description: `Field has been renamed to "${newFieldName}" successfully.`
      });
    } catch (error) {
      console.error("Error renaming field:", error);
      toast({
        title: "Error renaming field",
        description: "There was a problem renaming the field.",
        variant: "destructive"
      });
    }
  };

  const renderDefaultValueInput = () => {
    switch (newField.type) {
      case "text":
      case "markdown":
        return (
          <Input
            value={newField.defaultValue}
            onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
            placeholder="Enter default text..."
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={newField.defaultValue}
            onChange={(e) => setNewField({ ...newField, defaultValue: parseFloat(e.target.value) || 0 })}
            placeholder="Enter default number..."
          />
        );
      case "date":
        return (
          <Input
            type="datetime-local"
            value={newField.defaultValue.split(".")[0]} // Remove milliseconds
            onChange={(e) => setNewField({ ...newField, defaultValue: new Date(e.target.value).toISOString() })}
          />
        );
      case "boolean":
        return (
          <Switch
            checked={newField.defaultValue}
            onCheckedChange={(checked) => setNewField({ ...newField, defaultValue: checked })}
          />
        );
      case "enum":
        return (
          <Select
            value={newField.defaultValue}
            onValueChange={(value) => setNewField({ ...newField, defaultValue: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default value" />
            </SelectTrigger>
            <SelectContent>
              {newField.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "json":
        return (
          <Textarea
            value={typeof newField.defaultValue === 'string' ? newField.defaultValue : JSON.stringify(newField.defaultValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setNewField({ ...newField, defaultValue: parsed });
              } catch {
                setNewField({ ...newField, defaultValue: e.target.value });
              }
            }}
            placeholder="Enter default JSON..."
            className="font-mono"
          />
        );
      case "relation":
        return (
          <Select
            value={newField.relationSchemaId}
            onValueChange={(value) => setNewField({ ...newField, relationSchemaId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a schema" />
            </SelectTrigger>
            <SelectContent>
              {availableSchemas.map((schema) => (
                <SelectItem key={schema.id} value={schema.id}>
                  {schema.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const handleCreateSingleContent = async () => {
    if (!schema) return;
    
    try {
      const newItem: ContentItem = {
        id: crypto.randomUUID(),
        schemaId: schema.id,
        title: schema.name,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {}
      };
      
      await saveContentItem(newItem);
      setSingleContentItem(newItem);
      
      toast({
        title: "Content created",
        description: "Single content item has been created successfully."
      });
    } catch (error) {
      console.error("Error creating content:", error);
      toast({
        title: "Error creating content",
        description: "There was a problem creating the content item.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!schema) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Schema Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The schema you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{schema.name}</h1>
            <Badge variant={schema.isCollection ? "default" : "outline"}>
              {schema.isCollection ? "Collection" : "Single"}
            </Badge>
            <Badge variant="secondary" className="ml-2">
              <Table className="h-4 w-4 mr-1" />
              {schema.fields.length} Fields
            </Badge>
            {schema.isCollection ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 -mr-2 h-auto px-0 font-normal"
                onClick={() => navigate(`/manager?schema-id=${schema.id}`)}
              >
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  <Pencil className="h-3 w-3 mr-1" />
                  {contentCount} Items
                </Badge>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={singleContentItem ? () => navigate(`/content/${singleContentItem.id}`) : handleCreateSingleContent}
              >
                {singleContentItem ? (
                  <Badge variant="secondary">View Content</Badge>
                ) : (
                  <Badge variant="outline">Create Content</Badge>
                )}
              </Button>
            )}
          </div>
          {schema.description && (
            <p className="text-muted-foreground">{schema.description}</p>
          )}
        </div>

        <Dialog open={showAddField} onOpenChange={setShowAddField}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Field Name</Label>
                <Input
                  id="name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="Enter field name..."
                />
              </div>

              <div className="space-y-2">
                <Label>Field Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FIELD_TYPES).map(([type, { icon: Icon, label }]) => (
                    <Button
                      key={type}
                      variant={newField.type === type ? "default" : "outline"}
                      className={`justify-start text-left ${newField.type === type ? "" : "border-dashed"}`}
                      onClick={() => setNewField({ ...newField, type: type as keyof typeof FIELD_TYPES })}
                    >
                      <div className="flex items-center">
                        <Icon size={16} />
                        <span className="ml-2">{label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {newField.type === "enum" && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add option..."
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOption.trim()) {
                          e.preventDefault();
                          setNewField({
                            ...newField,
                            options: [...(newField.options || []), newOption.trim()],
                            defaultValue: newField.defaultValue || newOption.trim()
                          });
                          setNewOption("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newOption.trim()) {
                          setNewField({
                            ...newField,
                            options: [...(newField.options || []), newOption.trim()],
                            defaultValue: newField.defaultValue || newOption.trim()
                          });
                          setNewOption("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {newField.options && newField.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newField.options.map((option) => (
                        <Badge
                          key={option}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            setNewField({
                              ...newField,
                              options: newField.options?.filter((o) => o !== option),
                              defaultValue: newField.defaultValue === option ? "" : newField.defaultValue
                            });
                          }}
                        >
                          {option}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {newField.type === "relation" && (
                <div className="space-y-2">
                  <Label>Related Schema</Label>
                  <Select
                    value={newField.relationSchemaId}
                    onValueChange={(value) => setNewField({ ...newField, relationSchemaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSchemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Default Value</Label>
                {renderDefaultValueInput()}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={newField.required || false}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                />
                <Label htmlFor="required">Required Field</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddField(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddField}>Add Field</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {schema?.fields.map((field, index) => {
                const fieldType = FIELD_TYPES[field.type as keyof typeof FIELD_TYPES];
                const Icon = fieldType?.icon || Type;

                return (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border-b last:border-b-0 rounded-md"
                      >
                        <CardContent className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-2 cursor-move"
                                  {...provided.dragHandleProps}
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  <Icon size={20} className="text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Drag to reorder</p>
                              </TooltipContent>
                            </Tooltip>
                            <div>
                              <div className="font-medium">{field.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {fieldType?.label || field.type}
                                {field.required && (
                                  <Badge variant="secondary">Required</Badge>
                                )}
                                {field.type === "relation" && field.relationSchemaId && (
                                  <Badge variant="outline">
                                    {availableSchemas.find(s => s.id === field.relationSchemaId)?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedField(field);
                                    setNewFieldName(field.name);
                                    setShowRenameField(true);
                                  }}
                                >
                                  <Type size={16} className="text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Rename field</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedField(field);
                                    setShowDeleteField(true);
                                  }}
                                >
                                  <Trash2 size={16} className="text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete field</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>

      <AlertDialog open={showDeleteField} onOpenChange={setShowDeleteField}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedField?.name}" field? This action cannot be undone.
              Choose how to handle the existing data:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <Select
              value={migrationOptions.action}
              onValueChange={(value: "delete" | "keep") => 
                setMigrationOptions({ ...migrationOptions, action: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Delete field data</SelectItem>
                <SelectItem value="keep">Keep data (hidden)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground space-y-2">
              {migrationOptions.action === "delete" ? (
                <p>
                  This will permanently delete the field and all its data from existing content items.
                  This cannot be undone.
                </p>
              ) : (
                <p>
                  This will hide the field from the schema but keep its data in existing content items.
                  You can add the field back later to restore access to the data.
                </p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedField && handleDeleteField(selectedField)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Field
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRenameField} onOpenChange={setShowRenameField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Field</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newName">New Field Name</Label>
              <Input
                id="newName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Enter new field name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameField(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameField}>Rename Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemaEditorPage; 