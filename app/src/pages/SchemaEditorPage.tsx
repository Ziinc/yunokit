import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
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
  Edit,
  Loader2,
  Settings,
  MoreHorizontal,
  FileEdit,
  Archive,
} from "lucide-react";
import { ContentSchemaRow } from "@/lib/api/SchemaApi";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
// DestructiveBadge removed; use Badge with variant="destructive"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BackIconButton } from "@/components/ui/BackIconButton";
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
// StrictModeDroppable no longer needed with updated dnd library
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateUUID } from "@/lib/utils";
import { isString } from "@/lib/guards";
import { listContentItemsBySchema, deleteContentItem } from "@/lib/api/ContentApi";
import useSWR from "swr";
import { getSchema, updateSchema, deleteSchema } from "@/lib/api/SchemaApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useNullableState } from "@/hooks/useNullableState";

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


const SchemaEditorPage = () => {
  const { schemaId: schemaIdString } = useParams();
  const schemaId = Number(schemaIdString);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAddField, setShowAddField] = useState(false);
  const [showDeleteField, setShowDeleteField] = useState(false);
  const [selectedField, setSelectedField] = useNullableState<SchemaField>(null);
  const [showRenameField, setShowRenameField] = useState(false);
  const [showEditSchemaName, setShowEditSchemaName] = useState(false);
  const [showEditSchemaDescription, setShowEditSchemaDescription] = useState(false);
  const [showDeleteSchema, setShowDeleteSchema] = useState(false);
  const [showChangeSchemaType, setShowChangeSchemaType] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newSchemaName, setNewSchemaName] = useState("");
  const [newSchemaDescription, setNewSchemaDescription] = useState("");
  const [multiItemAction, setMultiItemAction] = useState<"keep_first" | "delete_all">("keep_first");
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
  const [availableSchemas, setAvailableSchemas] = useState<ContentSchemaRow[]>([]);

  const { currentWorkspace } = useWorkspace();

  const {
    data: schemaResponse,
    isLoading,
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
  } = useSWR(
    currentWorkspace && schemaId ? `content-items-${schemaId}` : null,
    async () => {
      const response = await listContentItemsBySchema(
        schemaId,
        currentWorkspace!.id
      );
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const schema = schemaResponse?.data;
  const isArchived = !!schema?.archived_at;
  const contentItems = contentItemsResponse?.data || [];
  const contentCount = Array.isArray(contentItems) ? contentItems.length : 0;

  const ensureNotArchived = () => {
    if (isArchived) {
      toast({
        title: "Schema archived",
        description: "Archived schemas cannot be modified.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    const loadAvailableSchemas = async () => {
      if (currentWorkspace) {
        try {
          const response = await listSchemas(currentWorkspace.id);
          if (response.data) {
            setAvailableSchemas(response.data);
          }
        } catch (error) {
          console.error("Error loading schemas:", error);
        }
      }
    };

    loadAvailableSchemas();
  }, [currentWorkspace]);

  useEffect(() => {
    if (schema) {
      setNewSchemaName(schema.name);
      setNewSchemaDescription(schema.description || "");
    }
  }, [schema]);

  const handleDragEnd = async (result: DropResult) => {
    if (!schema || !result.destination) return;

    if (!ensureNotArchived()) return;

    // Check if there's actually a change in position
    if (result.source.index === result.destination.index) {
      toast({
        title: "No change in field order",
        description: "The field position remained the same.",
      });
      return;
    }

    try {
      // Get the current fields array
      const fields = Array.from(schema.fields || []);
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
          description: "There was a problem saving the new field order.",
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

    if (!ensureNotArchived()) return;

    try {
      const field: SchemaField = {
        id: generateUUID(),
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

      const updatedSchemaResponse = await updateSchema(
        schema.id,
        updatedSchema,
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error adding field",
          description:
            updatedSchemaResponse.error.message ||
            "There was a problem adding the field.",
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

    if (!ensureNotArchived()) return;

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
      const updatedSchemaResponse = await updateSchema(
        schema.id,
        updatedSchema,
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error deleting field",
          description:
            updatedSchemaResponse.error.message ||
            "There was a problem deleting the field.",
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

    if (!ensureNotArchived()) return;

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
          description:
            updatedSchemaResponse.error.message ||
            "There was a problem renaming the field.",
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

  const handleEditSchemaName = async () => {
    if (!schema || !newSchemaName.trim()) return;

    if (!ensureNotArchived()) return;

    try {
      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            name: newSchemaName.trim(),
          },
        },
        false
      );

      // Close dialog and reset form immediately
      setShowEditSchemaName(false);
      setNewSchemaName("");

      const updatedSchemaResponse = await updateSchema(
        schema.id,
        {
          name: newSchemaName.trim(),
        },
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error updating schema name",
          description:
            updatedSchemaResponse.error.message ||
            "There was a problem updating the schema name.",
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
        title: "Schema name updated",
        description: `Schema has been renamed to "${newSchemaName}" successfully.`,
      });
    } catch (error) {
      console.error("Error updating schema name:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error updating schema name",
        description: "There was a problem updating the schema name.",
        variant: "destructive",
      });
    }
  };

  const handleEditSchemaDescription = async () => {
    if (!schema) return;

    if (!ensureNotArchived()) return;

    try {
      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            description: newSchemaDescription.trim(),
          },
        },
        false
      );

      // Close dialog and reset form immediately
      setShowEditSchemaDescription(false);
      setNewSchemaDescription("");

      const updatedSchemaResponse = await updateSchema(
        schema.id,
        {
          description: newSchemaDescription.trim(),
        },
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        toast({
          title: "Error updating schema description",
          description:
            updatedSchemaResponse.error.message ||
            "There was a problem updating the schema description.",
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
        title: "Schema description updated",
        description: "Schema description has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating schema description:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error updating schema description",
        description: "There was a problem updating the schema description.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchema = async () => {
    if (!schema) return;

    try {
      // Close dialog immediately
      setShowDeleteSchema(false);

      await deleteSchema(schema.id, currentWorkspace!.id);

      toast({
        title: "Schema deleted",
        description: `${schema.name} has been deleted successfully.`,
      });

      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast({
        title: "Error deleting schema",
        description: "There was a problem deleting the schema.",
        variant: "destructive",
      });
    }
  };

  const handleChangeSchemaType = async () => {
    if (!schema) return;

    if (!ensureNotArchived()) return;

    const newType = schema.type === "collection" ? "single" : "collection";

    try {
      // Close dialog immediately
      setShowChangeSchemaType(false);

      // If changing from collection to single and have multiple items, handle content deletion
      if (schema.type === "collection" && newType === "single" && contentCount > 1) {
        if (multiItemAction === "delete_all") {
          // Delete all content items first
          for (const item of contentItems) {
            await deleteContentItem(item.id, currentWorkspace!.id);
          }
        } else if (multiItemAction === "keep_first" && contentItems.length > 1) {
          // Keep first item, delete the rest
          for (let i = 1; i < contentItems.length; i++) {
            await deleteContentItem(contentItems[i].id, currentWorkspace!.id);
          }
        }
      }

      // Optimistic update
      mutateSchema(
        {
          ...schemaResponse,
          data: {
            ...schema,
            type: newType,
          },
        },
        false
      );

      const updatedSchemaResponse = await updateSchema(
        schema.id,
        {
          type: newType,
        },
        currentWorkspace!.id
      );

      if (updatedSchemaResponse.error) {
        // Revert optimistic update on error
        mutateSchema();
        console.error("Error changing schema type: ", updatedSchemaResponse.error);
        toast({
          title: "Error changing schema type",
          description: "There was a problem changing the schema type.",
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
        title: "Schema type changed",
        description: `Schema has been changed to ${newType} successfully.`,
      });
    } catch (error) {
      console.error("Error changing schema type:", error);
      // Revert optimistic update on error
      mutateSchema();
      toast({
        title: "Error changing schema type",
        description: "There was a problem changing the schema type.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveSchema = async () => {
    if (!schema) return;

    if (!ensureNotArchived()) return;

    try {
      const archivedAt = new Date().toISOString();
      mutateSchema(
        {
          ...schemaResponse,
          data: { ...schema, archived_at: archivedAt },
        },
        false,
      );

      const updated = await updateSchema(
        schema.id,
        { archived_at: archivedAt },
        currentWorkspace!.id,
      );

      if (updated.error) {
        mutateSchema();
        toast({
          title: "Error archiving schema",
          description:
            updated.error.message || "There was a problem archiving the schema.",
          variant: "destructive",
        });
        return;
      }

      mutateSchema({ ...schemaResponse, data: updated.data });

      toast({
        title: "Schema archived",
        description: `${schema.name} has been archived successfully.`,
      });
    } catch (error) {
      console.error("Error archiving schema:", error);
      mutateSchema();
      toast({
        title: "Error archiving schema",
        description: "There was a problem archiving the schema.",
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
              isString(newField.default_value)
                ? newField.default_value
                : JSON.stringify(newField.default_value, null, 2)
            }
            onChange={(e) => {
              let parsed;
        try {
          parsed = JSON.parse(e.target.value);
        } catch {
          parsed = e.target.value;
        }
              setNewField({ ...newField, default_value: parsed });
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
                <SelectItem key={schema.id} value={schema.id.toString()}>
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading schema...</p>
      </div>
    );
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
          <div className="flex-center-gap-2">
            <BackIconButton label="Back" onClick={() => navigate(-1)} />
            <h1 className="text-2xl font-bold">{schema.name}</h1>
            <Badge
              variant={schema.type === "collection" ? "default" : "outline"}
            >
              {schema.type === "collection" ? "Collection" : "Single"}
            </Badge>
            <Badge variant="secondary" className="ml-2">
              <Table className="icon-sm mr-1" />
              {(schema.fields || []).length} Fields
            </Badge>
            {isArchived && (
              <Badge variant="destructive" className="ml-2">
                <Archive className="icon-sm mr-1" /> Archived
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 -mr-2 h-auto px-0 font-normal"
                                        onClick={() => navigate(`/manager?schema=${schema.id}`)}
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
          {isArchived && (
            <p className="text-destructive">This schema is archived and read only.</p>
          )}
        </div>

        <div className="flex gap-2">
          {!isArchived && (
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
              <div className="grid gap-standard-md py-4">
                <div className="grid gap-standard-sm">
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
                          variant={
                            newField.type === type ? "default" : "outline"
                          }
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
                          <SelectItem key={schema.id} value={schema.id.toString()}>
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
                <Button
                  variant="outline"
                  onClick={() => setShowAddField(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddField}>Add Field</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="icon-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/manager/editor/${schema.id}/new`)}>
                <Plus className="mr-2 icon-sm" />
                Create Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/manager?schema=${schema.id}`)}>
                <FileEdit className="mr-2 icon-sm" />
                Browse Content
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isArchived && (
                <>
                  <DropdownMenuItem onClick={() => setShowEditSchemaName(true)}>
                    <Pencil className="mr-2 icon-sm" />
                    Rename Schema
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditSchemaDescription(true)}>
                    <Edit className="mr-2 icon-sm" />
                    Edit Description
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowChangeSchemaType(true)}>
                    <Settings className="mr-2 icon-sm" />
                    Change Type
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchiveSchema}>
                    <Archive className="mr-2 icon-sm" />
                    Archive Schema
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteSchema(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 icon-sm" />
                Delete Schema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
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
                        className="border-b last:border-b-0 rounded-md min-h-[80px]"
                      >
                        <CardContent className="flex items-center justify-between padding-card pt-4">
                          <div className="flex items-center gap-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-3 cursor-move px-2 py-3 -mx-2 -my-1 rounded hover:bg-muted/50 transition-colors"
                                  {...provided.dragHandleProps}
                                >
                                  <GripVertical className="icon-md text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Drag to reorder fields</p>
                              </TooltipContent>
                            </Tooltip>
                            <Icon size={24} className="text-muted-foreground" />
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
                                          (s) =>
                                            s.id.toString() === field.relation_schema_id
                                        )?.name
                                      }
                                    </Badge>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedField(field);
                                setNewFieldName(field.label);
                                setShowRenameField(true);
                              }}
                            >
                              <Pencil size={14} />
                              Rename
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedField(field);
                                setShowDeleteField(true);
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              <div className="[&>div]:min-h-[80px]">{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Helper text at the bottom */}
      <div className="text-center pt-6">
        <p className="text-xs text-muted-foreground">
          Tip: Use the drag handles on the left to rearrange field order
        </p>
      </div>

      {/* Existing dialogs and alert dialogs remain the same */}
      <AlertDialog open={showDeleteField} onOpenChange={setShowDeleteField}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete the "{selectedField?.label}"
                  field?
                </p>
                <p>
                  This will hide the field from the schema but will not delete
                  the data from existing content items.
                </p>
                <p>
                  You can add the field back later to restore access to the
                  data.
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

      <Dialog
        open={showEditSchemaName}
        onOpenChange={setShowEditSchemaName}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schema Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newSchemaName">New Schema Name</Label>
              <Input
                id="newSchemaName"
                value={newSchemaName}
                onChange={(e) => setNewSchemaName(e.target.value)}
                placeholder="Enter new schema name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditSchemaName(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSchemaName}>Update Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditSchemaDescription}
        onOpenChange={setShowEditSchemaDescription}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schema Description</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newSchemaDescription">Schema Description</Label>
              <Textarea
                id="newSchemaDescription"
                value={newSchemaDescription}
                onChange={(e) => setNewSchemaDescription(e.target.value)}
                placeholder="Enter schema description..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditSchemaDescription(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSchemaDescription}>Update Description</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showChangeSchemaType} 
        onOpenChange={setShowChangeSchemaType}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Schema Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <p>
                Current type: <strong>{schema?.type === "collection" ? "Collection" : "Single"}</strong>
              </p>
              <p>
                Change to: <strong>{schema?.type === "collection" ? "Single" : "Collection"}</strong>
              </p>
              
              {schema?.type === "collection" && contentCount > 1 && (
                <div className="space-y-3 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/10">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="icon-sm text-warning" />
                    <h4 className="font-semibold text-warning">
                      Multiple Items Detected
                    </h4>
                  </div>
                  <p className="text-sm text-warning">
                    This schema contains {contentCount} items. Changing to Single type will only keep one item.
                  </p>
                  <div className="space-y-2">
                    <Label>What should happen to the existing items?</Label>
                    <RadioGroup 
                      value={multiItemAction} 
                      onValueChange={(value) => setMultiItemAction(value as "keep_first" | "delete_all")}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="keep_first" id="keep_first" />
                        <Label htmlFor="keep_first" className="text-sm">
                          Keep the first item and delete the rest
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delete_all" id="delete_all" />
                        <Label htmlFor="delete_all" className="text-sm">
                          Delete all existing items
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangeSchemaType(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangeSchemaType}>
              Change Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteSchema} onOpenChange={setShowDeleteSchema}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schema</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete the "{schema?.name}" schema?
                </p>
                <p>
                  This will permanently delete the schema and all of its content items.
                  This action cannot be undone.
                </p>
                {contentCount > 0 && (
                  <p className="font-semibold text-destructive">
                    Warning: This schema contains {contentCount} content item{contentCount !== 1 ? 's' : ''} that will also be deleted.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchema}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Schema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchemaEditorPage;
