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
  Pencil,
} from "lucide-react";
import { ContentSchema, ContentField } from "@/lib/contentSchema";
import { listSchemas, SchemaField, SchemaFieldType } from "@/lib/api/SchemaApi";
import { useToast } from "@/hooks/use-toast";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
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
import {
  ContentItemRow,
  listContentItemsBySchema,
  saveContentItem,
} from "@/lib/api/ContentApi";
import { ContentItem } from "@/lib/contentSchema";
import useSWR from "swr";
import { getSchema, updateSchema } from "@/lib/api/SchemaApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

// Field type definitions with their icons and labels
const FIELD_TYPES = {
  [SchemaFieldType.TEXT]: { icon: Type, label: "Text", defaultValue: "" },
  [SchemaFieldType.NUMBER]: { icon: Hash, label: "Number", defaultValue: 0 },
  [SchemaFieldType.DATE]: {
    icon: Calendar,
    label: "Date",
    defaultValue: new Date().toISOString(),
  },
  [SchemaFieldType.BOOLEAN]: {
    icon: ToggleLeft,
    label: "Boolean",
    defaultValue: false,
  },
  [SchemaFieldType.ENUM]: { icon: List, label: "Enum", defaultValue: "" },
  [SchemaFieldType.RELATION]: {
    icon: LinkIcon,
    label: "Relation",
    defaultValue: null,
  },
  [SchemaFieldType.IMAGE]: { icon: Image, label: "Image", defaultValue: null },
  [SchemaFieldType.MARKDOWN]: {
    icon: FileText,
    label: "Markdown",
    defaultValue: "",
  },
  [SchemaFieldType.JSON]: { icon: Code, label: "JSON", defaultValue: {} },
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
  const { schemaId: schemaIdString } = useParams();
  const schemaId = Number(schemaIdString);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddField, setShowAddField] = useState(false);
  const [showDeleteField, setShowDeleteField] = useState(false);
  const [selectedField, setSelectedField] = useState<SchemaField | null>(null);
  const [showRenameField, setShowRenameField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [migrationOptions, setMigrationOptions] =
    useState<FieldMigrationOptions>({
      action: "delete",
    });
  const [newField, setNewField] = useState<SchemaField>({
    id: "",
    label: "",
    description: "",
    type: SchemaFieldType.TEXT,
    required: false,
    default_value: "",
    relation_schema_id: null,
    options: null,
  });
  const [newOption, setNewOption] = useState("");
  const [availableSchemas, setAvailableSchemas] = useState<ContentSchema[]>([]);

  const { currentWorkspace } = useWorkspace();

  const {
    data: schemaResponse,
    error: schemaError,
    isLoading: isLoading,
    mutate: mutateSchema,
  } = useSWR(
    currentWorkspace && schemaId ? `schema-${schemaId}` : null,
    () => getSchema(schemaId!, currentWorkspace!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const {
    data: contentItemsResponse,
    error: contentItemsError,
    isLoading: isLoadingContentItems,
  } = useSWR(
    currentWorkspace && schemaId ? `content-items-${schemaId}` : null,
    async () => {
      const response = await listContentItemsBySchema(schemaId.toString());
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const schema = schemaResponse?.data;
  const contentItems = contentItemsResponse || [];
  const contentCount = contentItems.length;

  console.log('schema', schema);

  const handleDragEnd = async (result: DropResult) => {
    if (!schema || !result.destination) return;

    try {
      // Get the current fields array
      let fields = Array.from(schema.fields || []);
      const [movedField] = fields.splice(result.source.index, 1);
      fields.splice(result.destination.index, 0, movedField);

      // Create new fields array in the new order
      const reorderedFields = fields;

      // Update UI optimistically
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            fields: reorderedFields,
          },
        },
        false
      );

      // Call the API to reorder fields
      const updatedSchemaResponse = await updateSchema(
        schema.id,
        {
          fields: reorderedFields,
        },
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        console.error("Error reordering fields: ", updatedSchemaResponse.error);
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error reordering fields",
          description:  "There was a problem saving the new field order.",
          variant: "destructive",
        });
        return;
      }

      if (updatedSchemaResponse.data) {
        mutateSchema({
          ...schemaResponse,
          data: updatedSchemaResponse.data,
        });
        
        toast({
          title: "Fields reordered",
          description: "The field order has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error reordering fields:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error reordering fields",
        description: "There was a problem saving the new field order.",
        variant: "destructive",
      });
    }
  };

  const handleAddField = async () => {
    if (!schema || !newField.label.trim()) return;

    try {
      const field: SchemaField = {
        id: crypto.randomUUID(),
        label: newField.label,
        description: newField.description,
        options: newField.options,
        type: newField.type as SchemaFieldType,
        required: newField.required,
        default_value: newField.default_value,
        relation_schema_id: newField.relation_schema_id,
      };

      const updatedFields = [...(schema.fields || []), field];
      
      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            fields: updatedFields,
          },
        },
        false
      );

      // Close dialog and reset form immediately
      setShowAddField(false);
      setNewField({
        id: "",
        label: "",
        description: "",
        type: SchemaFieldType.TEXT,
        required: false,
        default_value: "",
        relation_schema_id: null,
        options: null,
      });

      const updatedSchema = {
        fields: updatedFields,
      };
      console.log("updatedSchema", updatedSchema);

      const updatedSchemaResponse = await updateSchema(schema.id, updatedSchema, currentWorkspace!.id);
      
      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error adding field",
          description: updatedSchemaResponse.error.message || "There was a problem adding the field.",
          variant: "destructive",
        });
        return;
      }
      
      // Update with actual response
      if (updatedSchemaResponse.data) {
        mutateSchema({
          ...schemaResponse,
          data: updatedSchemaResponse.data,
        });
      }

      toast({
        title: "Field added",
        description: `${field.label} field has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding field:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error adding field",
        description: "There was a problem adding the field.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (field: SchemaField) => {
    if (!schema) return;

    try {
      const updatedFields = schema.fields.filter((f) => f !== field);
      
      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            fields: updatedFields,
          },
        },
        false
      );

      // Close dialog immediately
      setShowDeleteField(false);
      setSelectedField(null);

      const updatedSchema = { fields: updatedFields };
      const updatedSchemaResponse = await updateSchema(schema.id, updatedSchema, currentWorkspace!.id);
      
      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error deleting field",
          description: updatedSchemaResponse.error.message || "There was a problem deleting the field.",
          variant: "destructive",
        });
        return;
      }
      
      // Update with actual response
      if (updatedSchemaResponse.data) {
        mutateSchema({
          ...schemaResponse,
          data: updatedSchemaResponse.data,
        });
      }

      toast({
        title: "Field deleted",
        description: `${field.label} field has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting field:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error deleting field",
        description: "There was a problem deleting the field.",
        variant: "destructive",
      });
    }
  };

  const handleRenameField = async () => {
    if (!schema || !selectedField || !newFieldName.trim()) return;

    try {
      const updatedFields = schema.fields.map((f) =>
        f === selectedField ? { ...f, label: newFieldName.trim() } : f
      );
      
      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            fields: updatedFields,
          },
        },
        false
      );

      // Close dialog and reset form immediately
      setShowRenameField(false);
      setSelectedField(null);
      setNewFieldName("");

      const updatedSchemaResponse = await updateSchema(
        schema.id,
        {
          fields: updatedFields,
        },
        currentWorkspace!.id
      );
      
      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error renaming field",
          description: updatedSchemaResponse.error.message || "There was a problem renaming the field.",
          variant: "destructive",
        });
        return;
      }
      
      // Update with actual response
      if (updatedSchemaResponse.data) {
        mutateSchema({
          ...schemaResponse,
          data: updatedSchemaResponse.data,
        });
      }

      toast({
        title: "Field renamed",
        description: `Field has been renamed to "${newFieldName}" successfully.`,
      });
    } catch (error) {
      console.error("Error renaming field:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error renaming field",
        description: "There was a problem renaming the field.",
        variant: "destructive",
      });
    }
  };

  const renderDefaultValueInput = () => {
    switch (newField.type) {
      case "text":
      case "markdown":
        return (
          <Input
            value={newField.default_value as string}
            onChange={(e) =>
              setNewField({ ...newField, default_value: e.target.value })
            }
            placeholder="Enter default text..."
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={newField.default_value as number}
            onChange={(e) =>
              setNewField({
                ...newField,
                default_value: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="Enter default number..."
          />
        );
      case "date":
        return (
          <Input
            type="datetime-local"
            value={(newField.default_value as string).split(".")[0]} // Remove milliseconds
            onChange={(e) =>
              setNewField({
                ...newField,
                default_value: new Date(e.target.value).toISOString(),
              })
            }
          />
        );
      case "boolean":
        return (
          <Switch
            checked={newField.default_value as boolean}
            onCheckedChange={(checked) =>
              setNewField({ ...newField, default_value: checked })
            }
          />
        );
      case "enum":
        return (
          <Select
            value={newField.default_value as string}
            onValueChange={(value) =>
              setNewField({ ...newField, default_value: value })
            }
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
            value={
              typeof newField.default_value === "string"
                ? newField.default_value
                : JSON.stringify(newField.default_value, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setNewField({ ...newField, default_value: parsed });
              } catch {
                setNewField({ ...newField, default_value: e.target.value });
              }
            }}
            placeholder="Enter default JSON..."
            className="font-mono"
          />
        );
      case "relation":
        return (
          <Select
            value={newField.relation_schema_id}
            onValueChange={(value) =>
              setNewField({ ...newField, relation_schema_id: value })
            }
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


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!schema) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Schema Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The schema you're looking for doesn't exist or you don't have access
          to it.
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
            <Badge
              variant={schema.type === "collection" ? "default" : "outline"}
            >
              {schema.type === "collection" ? "Collection" : "Single"}
            </Badge>
            <Badge variant="secondary" className="ml-2">
              <Table className="h-4 w-4 mr-1" />
              {(schema.fields || []).length} Fields
            </Badge>
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
                  value={newField.label}
                  onChange={(e) =>
                    setNewField({ ...newField, label: e.target.value })
                  }
                  placeholder="Enter field name..."
                />
              </div>

              <div className="space-y-2">
                <Label>Field Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FIELD_TYPES).map(
                    ([type, { icon: Icon, label }]) => (
                      <Button
                        key={type}
                        variant={newField.type === type ? "default" : "outline"}
                        className={`justify-start text-left ${
                          newField.type === type ? "" : "border-dashed"
                        }`}
                        onClick={() =>
                          setNewField({
                            ...newField,
                            type: type as keyof typeof FIELD_TYPES,
                          })
                        }
                      >
                        <div className="flex items-center">
                          <Icon size={16} />
                          <span className="ml-2">{label}</span>
                        </div>
                      </Button>
                    )
                  )}
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
                            options: [
                              ...(newField.options || []),
                              newOption.trim(),
                            ],
                            default_value:
                              newField.default_value || newOption.trim(),
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
                            options: [
                              ...(newField.options || []),
                              newOption.trim(),
                            ],
                            default_value:
                              newField.default_value || newOption.trim(),
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
                              options: newField.options?.filter(
                                (o) => o !== option
                              ),
                              default_value:
                                newField.default_value === option
                                  ? ""
                                  : newField.default_value,
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
                    value={newField.relation_schema_id}
                    onValueChange={(value) =>
                      setNewField({ ...newField, relation_schema_id: value })
                    }
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
                  onCheckedChange={(checked) =>
                    setNewField({ ...newField, required: checked })
                  }
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
              {(schema?.fields || []).map((field, index) => {
                const fieldType =
                  FIELD_TYPES[field.type as keyof typeof FIELD_TYPES];
                const Icon = fieldType?.icon || Type;

                return (
                  <Draggable
                    key={field.id}
                    draggableId={field.id}
                    index={index}
                  >
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
                                  <Icon
                                    size={20}
                                    className="text-muted-foreground"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Drag to reorder</p>
                              </TooltipContent>
                            </Tooltip>
                            <div>
                              <div className="font-medium">{field.label}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {fieldType?.label || field.type}
                                {field.required && (
                                  <Badge variant="secondary">Required</Badge>
                                )}
                                {field.type === "relation" &&
                                  field.relation_schema_id && (
                                    <Badge variant="outline">
                                      {
                                        availableSchemas.find(
                                            (s) => s.id === field.relation_schema_id
                                        )?.name
                                      }
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
                                    setNewFieldName(field.label);
                                    setShowRenameField(true);
                                  }}
                                >
                                  <Type
                                    size={16}
                                    className="text-muted-foreground"
                                  />
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
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete the "{selectedField?.label}" field?
                </p>
                <p>
                  This will hide the field from the schema but will not delete the data from existing content items.
                </p>
                <p>
                  You can add the field back later to restore access to the data.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
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
