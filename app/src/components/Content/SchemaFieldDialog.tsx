import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, FileText, List, Check, FileJson } from "lucide-react";
import { ContentFieldType } from "@/lib/contentSchema";
import { SchemaField, SchemaFieldType } from "@/lib/api/SchemaApi";

interface SchemaFieldDialogProps {
  onAddField: (field: SchemaField) => void;
}

export const SchemaFieldDialog: React.FC<SchemaFieldDialogProps> = ({ onAddField }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newField, setNewField] = useState<Omit<SchemaField, "id">>({
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
      options: newField.options?.filter((o) => o !== option) || [],
    });
  };

  const handleAdd = () => {
    if (!newField.label) {
      toast({
        title: "Field label required",
        description: "Please provide a label for the field",
        variant: "destructive",
      });
      return;
    }

    onAddField({ id: crypto.randomUUID(), ...newField });

    setNewField({
      label: "",
      type: SchemaFieldType.TEXT,
      required: false,
      options: [],
      description: "",
      default_value: null,
      relation_schema_id: null,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              {( [
                "text",
                "number",
                "date",
                "boolean",
                "enum",
                "relation",
                "image",
                "markdown",
                "json",
              ] as ContentFieldType[] ).map((type) => (
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
          <Button onClick={handleAdd}>Add Field</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

