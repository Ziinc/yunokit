import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import {
  DragDropContext,
  Draggable,
  DropResult,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';
import { ContentSchema, ContentField, ContentFieldType } from '@/lib/contentSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, X, Type, Hash, Calendar, ToggleLeft, List, Link, FileText, Code, Image } from 'lucide-react';
import { StrictModeDroppable } from '../StrictModeDroppable';
import './TiptapEditor.css';

interface TiptapEditorProps {
  schema: ContentSchema;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  editable?: boolean;
}

// Field type options for the add field dialog
const FIELD_TYPE_OPTIONS: { value: ContentFieldType; label: string; icon: React.ReactNode }[] = [
  { value: 'text', label: 'Text', icon: <Type className="h-4 w-4" /> },
  { value: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
  { value: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
  { value: 'boolean', label: 'Boolean', icon: <ToggleLeft className="h-4 w-4" /> },
  { value: 'enum', label: 'Select', icon: <List className="h-4 w-4" /> },
  { value: 'markdown', label: 'Markdown', icon: <FileText className="h-4 w-4" /> },
  { value: 'json', label: 'JSON', icon: <Code className="h-4 w-4" /> },
  { value: 'image', label: 'Image', icon: <Image className="h-4 w-4" /> },
  { value: 'relation', label: 'Relation', icon: <Link className="h-4 w-4" /> },
];

// Component for adding new field blocks
const AddFieldDialog: React.FC<{
  onAddField: (field: ContentField, insertIndex?: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  insertIndex?: number;
}> = ({ onAddField, isOpen, onOpenChange, insertIndex }) => {
  const [newField, setNewField] = useState<Partial<ContentField>>({
    name: '',
    type: 'text',
    required: false,
    description: '',
    options: [],
  });
  const [newOption, setNewOption] = useState('');

  const handleAddField = () => {
    if (!newField.name) return;
    
    const field: ContentField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newField.name,
      type: newField.type || 'text',
      required: newField.required || false,
      description: newField.description,
      options: newField.options,
    };
    
    onAddField(field, insertIndex);
    
    // Reset form
    setNewField({
      name: '',
      type: 'text',
      required: false,
      description: '',
      options: [],
    });
    setNewOption('');
    onOpenChange(false);
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setNewField({
      ...newField,
      options: [...(newField.options || []), newOption.trim()],
    });
    setNewOption('');
  };

  const removeOption = (index: number) => {
    setNewField({
      ...newField,
      options: newField.options?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              value={newField.name || ''}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              placeholder="Enter field name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-type">Field Type</Label>
            <Select
              value={newField.type || 'text'}
              onValueChange={(value: ContentFieldType) => setNewField({ ...newField, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-description">Description (optional)</Label>
            <Input
              id="field-description"
              value={newField.description || ''}
              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
              placeholder="Help text for editors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newField.required || false}
              onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
            />
            <Label>Required field</Label>
          </div>

          {newField.type === 'enum' && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex space-x-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button type="button" size="sm" onClick={addOption}>
                  Add
                </Button>
              </div>
              {newField.options && newField.options.length > 0 && (
                <div className="space-y-1">
                  {newField.options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddField} disabled={!newField.name}>
              Add Field
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for field insertion points
const FieldInsertionPoint: React.FC<{
  onInsertField: () => void;
  isVisible: boolean;
}> = ({ onInsertField, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="relative field-insertion-point py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-dotted border-muted-foreground/50"></div>
      </div>
      <div className="relative flex justify-center">
        <button
          onClick={onInsertField}
          className="flex items-center gap-1.5 bg-background px-2.5 py-0.5 rounded-full border border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span className="text-xs font-medium">Add Field</span>
        </button>
      </div>
    </div>
  );
};

// Define custom node types for each field type
const SchemaFieldNode = Node.create({
  name: 'schemaField',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      fieldId: {
        default: null,
      },
      fieldType: {
        default: 'text',
      },
      fieldName: {
        default: '',
      },
      fieldValue: {
        default: null,
      },
      fieldRequired: {
        default: false,
      },
      fieldDescription: {
        default: '',
      },
      fieldOptions: {
        default: [],
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="schema-field"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'schema-field', ...HTMLAttributes }];
  },

  addNodeView() {
    return () => {
      const container = document.createElement('div');
      container.className = 'schema-field-node';
      return {
        dom: container,
      };
    };
  },
});

const getFieldIcon = (type: ContentFieldType) => {
  switch (type) {
    case 'text':
      return <Type className="h-4 w-4" />;
    case 'number':
      return <Hash className="h-4 w-4" />;
    case 'date':
      return <Calendar className="h-4 w-4" />;
    case 'boolean':
      return <ToggleLeft className="h-4 w-4" />;
    case 'enum':
      return <List className="h-4 w-4" />;
    case 'relation':
      return <Link className="h-4 w-4" />;
    default:
      return <Type className="h-4 w-4" />;
  }
};

const SchemaFieldComponent: React.FC<{
  field: ContentField;
  value: unknown;
  onChange: (value: unknown) => void;
  onRemove: () => void;
  editable: boolean;
  isDynamic?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}> = ({ field, value, onChange, onRemove, editable, isDynamic = false, dragHandleProps }) => {
  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name?.toLowerCase() || 'value'}`}
            disabled={!editable}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.description || `Enter ${field.name?.toLowerCase() || 'number'}`}
            disabled={!editable}
          />
        );
      
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={!editable}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={onChange}
              disabled={!editable}
            />
            <span className="text-sm">{value ? 'Yes' : 'No'}</span>
          </div>
        );
      
      case 'enum':
        return (
          <Select value={value || ''} onValueChange={onChange} disabled={!editable}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name?.toLowerCase() || 'option'}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'markdown':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name?.toLowerCase() || 'markdown'}`}
            className="min-h-[120px] font-mono"
            disabled={!editable}
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            placeholder={field.description || 'Enter JSON data'}
            className="min-h-[120px] font-mono"
            disabled={!editable}
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name?.toLowerCase() || 'value'}`}
            disabled={!editable}
          />
        );
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 mt-2">
            {dragHandleProps ? (
              <div {...dragHandleProps}>
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              </div>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                {getFieldIcon(field.type)}
              </div>
            )}
            {dragHandleProps && getFieldIcon(field.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-medium text-sm">
                    {field.name || 'Untitled Field'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                  )}
                </div>
                {isDynamic && (
                  <Badge variant="outline" className="text-xs">
                    Dynamic
                  </Badge>
                )}
              </div>
              
              {/* Show remove button only for dynamic fields */}
              {editable && isDynamic && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {renderFieldInput()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  schema,
  content,
  onChange,
  editable = true,
}) => {
  const [fieldValues, setFieldValues] = React.useState<Record<string, unknown>>({});
  const [dynamicFields, setDynamicFields] = React.useState<ContentField[]>([]);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [insertionPointIndex, setInsertionPointIndex] = useState<number | null>(null);

  // Initialize field values from content
  useEffect(() => {
    if (content && typeof content === 'object') {
      // Extract dynamic field metadata if it exists
      const { __dynamicFields, ...fieldValues } = content;
      setFieldValues(fieldValues);
      
      // Extract dynamic fields from content that aren't in the schema
      const schemaFieldIds = new Set(schema.fields.map(f => f.id));
      const dynamicFieldsFromContent: ContentField[] = [];
      
      Object.keys(fieldValues).forEach(key => {
        if (!schemaFieldIds.has(key) && key.startsWith('field_')) {
          // Check if we have metadata for this field
          const fieldMetadata = __dynamicFields?.[key];
          
          if (fieldMetadata) {
            // Use stored metadata
            dynamicFieldsFromContent.push({
              id: key,
              name: fieldMetadata.name || key.replace('field_', '').replace(/_/g, ' '),
              type: fieldMetadata.type || 'text',
              required: fieldMetadata.required || false,
              description: fieldMetadata.description,
              options: fieldMetadata.options,
            });
          } else {
            // Fallback to reconstructing from field ID
            dynamicFieldsFromContent.push({
              id: key,
              name: key.replace('field_', '').replace(/_/g, ' '),
              type: 'text', // Default type
              required: false,
            });
          }
        }
      });
      
      setDynamicFields(dynamicFieldsFromContent);
    }
  }, [content, schema]);

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    const newValues = { ...fieldValues, [fieldId]: value };
    setFieldValues(newValues);
    
    // Include dynamic field metadata in the content
    const contentWithMetadata = {
      ...newValues,
      __dynamicFields: dynamicFields.reduce((acc, field) => {
        acc[field.id] = {
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description,
          options: field.options,
        };
        return acc;
      }, {} as Record<string, Partial<ContentField>>)
    };
    
    onChange(contentWithMetadata);
  }, [fieldValues, dynamicFields, onChange]);

  const handleRemoveField = useCallback((fieldId: string) => {
    const newValues = { ...fieldValues };
    delete newValues[fieldId];
    setFieldValues(newValues);
    
    // Also remove from dynamic fields list if it's a dynamic field
    const updatedDynamicFields = dynamicFields.filter(field => field.id !== fieldId);
    setDynamicFields(updatedDynamicFields);
    
    // Update content with metadata
    const contentWithMetadata = {
      ...newValues,
      __dynamicFields: updatedDynamicFields.reduce((acc, field) => {
        acc[field.id] = {
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description,
          options: field.options,
        };
        return acc;
      }, {} as Record<string, Partial<ContentField>>)
    };
    
    onChange(contentWithMetadata);
  }, [fieldValues, dynamicFields, onChange]);

  const handleAddField = (newField: ContentField, insertIndex?: number) => {
    // Add the new field to the content with a default value
    const defaultValue = getDefaultValueForFieldType(newField.type);
    const newContent = { ...fieldValues, [newField.id]: defaultValue };
    setFieldValues(newContent);
    
    // Add to dynamic fields list at the specified index
    let updatedDynamicFields;
    if (insertIndex !== undefined && insertIndex !== null) {
      updatedDynamicFields = [...dynamicFields];
      updatedDynamicFields.splice(insertIndex, 0, newField);
    } else {
      updatedDynamicFields = [...dynamicFields, newField];
    }
    setDynamicFields(updatedDynamicFields);
    
    // Store content with metadata
    const contentWithMetadata = {
      ...newContent,
      __dynamicFields: updatedDynamicFields.reduce((acc, field) => {
        acc[field.id] = {
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description,
          options: field.options,
        };
        return acc;
      }, {} as Record<string, Partial<ContentField>>)
    };
    
    onChange(contentWithMetadata);
    
    // Reset insertion point
    setInsertionPointIndex(null);
  };

  const getDefaultValueForFieldType = (type: ContentFieldType): unknown => {
    switch (type) {
      case 'text':
      case 'markdown':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return '';
      case 'enum':
        return '';
      case 'json':
        return {};
      case 'image':
        return null;
      case 'relation':
        return null;
      default:
        return '';
    }
  };

  const handleInsertField = (insertIndex: number) => {
    setInsertionPointIndex(insertIndex);
    setIsAddFieldDialogOpen(true);
  };

  const handleDrop = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const [draggedField] = dynamicFields.splice(sourceIndex, 1);
    dynamicFields.splice(destinationIndex, 0, draggedField);

    setDynamicFields([...dynamicFields]);

    // Update content with metadata
    const contentWithMetadata = {
      ...fieldValues,
      __dynamicFields: dynamicFields.reduce((acc, field) => {
        acc[field.id] = {
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description,
          options: field.options,
        };
        return acc;
      }, {} as Record<string, Partial<ContentField>>)
    };
    
    onChange(contentWithMetadata);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      SchemaFieldNode,
    ],
    content: '',
    editable,
    onUpdate: ({ editor: _editor }) => {
      // Handle editor updates if needed
    },
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor">
      <div className="space-y-2">
        {/* Render schema fields */}
        {schema.fields.map((field) => (
          <SchemaFieldComponent
            key={field.id}
            field={field}
            value={fieldValues[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
            onRemove={() => handleRemoveField(field.id)}
            editable={editable}
            isDynamic={false}
          />
        ))}
        
        {/* Render dynamic fields with drag and drop */}
        {editable && !schema.strict && (
          <DragDropContext onDragEnd={handleDrop}>
            <StrictModeDroppable droppableId="dynamic-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {/* Insertion point at the beginning */}
                  <FieldInsertionPoint
                    onInsertField={() => handleInsertField(0)}
                    isVisible={dynamicFields.length > 0}
                  />
                  
                  {dynamicFields.map((field, index) => (
                    <React.Fragment key={field.id}>
                      <Draggable draggableId={field.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <SchemaFieldComponent
                              field={field}
                              value={fieldValues[field.id]}
                              onChange={(value) => handleFieldChange(field.id, value)}
                              onRemove={() => handleRemoveField(field.id)}
                              editable={editable}
                              isDynamic={true}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                      
                      {/* Insertion point after each field */}
                      <FieldInsertionPoint
                        onInsertField={() => handleInsertField(index + 1)}
                        isVisible={true}
                      />
                    </React.Fragment>
                  ))}
                  
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        )}
        
        {/* Render dynamic fields without drag and drop when not editable or strict schema */}
        {(!editable || schema.strict) && dynamicFields.map((field) => (
          <SchemaFieldComponent
            key={field.id}
            field={field}
            value={fieldValues[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
            onRemove={() => handleRemoveField(field.id)}
            editable={editable}
            isDynamic={true}
          />
        ))}
        
        {/* Add Field Dialog */}
        <AddFieldDialog
          onAddField={handleAddField}
          isOpen={isAddFieldDialogOpen}
          onOpenChange={setIsAddFieldDialogOpen}
          insertIndex={insertionPointIndex}
        />
      </div>
      
      {/* Hidden editor content for Tiptap integration */}
      <div className="hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}; 