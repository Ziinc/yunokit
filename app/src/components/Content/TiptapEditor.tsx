import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import SchemaField from './extensions/SchemaField';
import { ContentSchema, ContentField, ContentFieldType } from '@/lib/contentSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Type, Hash, ToggleLeft, List, ListOrdered, Bold, Italic, Strikethrough, AlignLeft } from 'lucide-react';
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
  { value: 'boolean', label: 'Boolean', icon: <ToggleLeft className="h-4 w-4" /> },
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
    onOpenChange(false);
  };



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="add-field-dialog">
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

// Content divider component with hover buttons
const ContentDivider: React.FC<{
  onAddParagraph: () => void;
  onAddField: () => void;
}> = ({ onAddParagraph, onAddField }) => {
  return (
    <div className="group relative my-2">
      <div className="h-px bg-border"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm px-2 py-1">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/80 rounded-sm"
                  onClick={onAddParagraph}
                  data-testid="add-paragraph-button"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add paragraph</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px h-4 bg-border"></div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/80 rounded-sm"
                  onClick={onAddField}
                  data-testid="add-field-button"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
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
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Initialize field values from content
  useEffect(() => {
    if (content && typeof content === 'object') {
      // Check for new format with __fieldValues
      if ('__fieldValues' in content && content.__fieldValues) {
        setFieldValues(content.__fieldValues as Record<string, unknown>);

        // Extract dynamic fields from metadata if available
        if ('__fieldMetadata' in content && content.__fieldMetadata) {
          const fieldsMetadata = content.__fieldMetadata as Record<string, ContentField & { isDynamic: boolean }>;
          const schemaFieldIds = new Set(schema.fields.map(f => f.id));
          const dynamicFieldsFromContent: ContentField[] = [];

          Object.entries(fieldsMetadata).forEach(([fieldId, metadata]) => {
            if (!schemaFieldIds.has(fieldId) && metadata.isDynamic) {
              dynamicFieldsFromContent.push({
                id: fieldId,
                name: metadata.name,
                type: metadata.type,
                required: metadata.required,
                description: metadata.description,
                options: metadata.options,
              });
            }
          });

          setDynamicFields(dynamicFieldsFromContent);
        }
        return;
      }

      // If content has the old structure, extract field values
      if ('content' in content && '__textContent' in content) {
        const { schema: fieldsMetadata, ...extractedFieldValues } = content;
        setFieldValues(extractedFieldValues);

        // Extract dynamic fields from metadata
        if (fieldsMetadata) {
          const schemaFieldIds = new Set(schema.fields.map(f => f.id));
          const dynamicFieldsFromContent: ContentField[] = [];

          Object.entries(fieldsMetadata).forEach(([fieldId, metadata]: [string, ContentField & { isDynamic: boolean }]) => {
            if (!schemaFieldIds.has(fieldId) && metadata.isDynamic) {
              dynamicFieldsFromContent.push({
                id: fieldId,
                name: metadata.name,
                type: metadata.type,
                required: metadata.required,
                description: metadata.description,
                options: metadata.options,
              });
            }
          });

          setDynamicFields(dynamicFieldsFromContent);
        }
        return;
      }

      // For pure TiptapEditor JSON format without field values, initialize with defaults
      if (content.content && Array.isArray(content.content)) {
        const extractedFieldValues: Record<string, unknown> = {};

        // Initialize schema fields with default values
        schema.fields.forEach(field => {
          extractedFieldValues[field.id] = getDefaultValueForFieldType(field.type);
        });

        setFieldValues(extractedFieldValues);
        setDynamicFields([]);
      }
    }
  }, [content, schema]);


  const handleAddField = (newField: ContentField, insertIndex?: number) => {
    // Add the new field to the content with a default value
    const defaultValue = getDefaultValueForFieldType(newField.type);
    const newContent = { ...fieldValues, [newField.id]: defaultValue };
    setFieldValues(newContent);
    
    // Add to dynamic fields list at the specified index
    let updatedDynamicFields: ContentField[];
    if (insertIndex !== undefined && insertIndex !== null) {
      updatedDynamicFields = [...dynamicFields];
      updatedDynamicFields.splice(insertIndex, 0, newField);
    } else {
      updatedDynamicFields = [...dynamicFields, newField];
    }
    setDynamicFields(updatedDynamicFields);
    
    // Add the new field to the Tiptap editor
    if (editorInstance) {
      const newNode = {
        type: 'schemaField',
        attrs: {
          fieldId: newField.id,
        },
      };

      // Insert the node at the end of the document
      const currentSize = editorInstance.state.doc.content.size;
      editorInstance.chain()
        .focus()
        .insertContentAt(currentSize, newNode)
        .run();
    }
    
    // Reset insertion point
    setInsertionPointIndex(null);
  };


  const handleAddParagraph = (insertPosition?: number) => {
    if (!editorInstance) return;
    
    const paragraphNode = { type: 'paragraph', content: [] };
    const position = insertPosition || editorInstance.state.doc.content.size;
    
    editorInstance.chain()
      .focus()
      .insertContentAt(position, paragraphNode)
      .run();
  };

  const handleAddFieldAtPosition = (insertPosition?: number) => {
    setInsertionPointIndex(insertPosition || null);
    setIsAddFieldDialogOpen(true);
  };


  // Function to handle field removal from schema field component
  const handleFieldRemove = useCallback((fieldId: string) => {
    // Remove from fieldValues
    setFieldValues(prev => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });

    // Remove from dynamicFields
    setDynamicFields(prev => prev.filter(field => field.id !== fieldId));
  }, []);

  // Create field metadata map for all fields
  const allFieldsMetadata = React.useMemo(() => {
    const metadata: Record<string, any> = {};

    // Add schema fields
    schema.fields.forEach(field => {
      metadata[field.id] = {
        ...field,
        isDynamic: false,
      };
    });

    // Add dynamic fields
    dynamicFields.forEach(field => {
      metadata[field.id] = {
        ...field,
        isDynamic: true,
      };
    });

    return metadata;
  }, [schema.fields, dynamicFields]);

  const editor = useEditor({
    extensions: [StarterKit, SchemaField.configure({
      onFieldRemove: handleFieldRemove,
      onFieldChange: (fieldId: string, value: unknown) => {
        setFieldValues(prev => ({
          ...prev,
          [fieldId]: value
        }));
      },
      fieldMetadata: allFieldsMetadata,
      fieldValues: fieldValues,
    })],
    content: '',
    editable,
    onCreate: ({ editor }) => {
      setEditorInstance(editor);
    },
    onUpdate: ({ editor }) => {
      const rawContent = editor.getJSON();

      // Store as TiptapEditor JSON format but include field values for preservation
      const contentWithFieldValues = {
        ...rawContent,
        // Store field values in a special property that doesn't interfere with TiptapEditor structure
        __fieldValues: fieldValues,
        __fieldMetadata: allFieldsMetadata
      };

      onChange(contentWithFieldValues);
    },
  });

  const [isInitialized, setIsInitialized] = React.useState(false);

  // Update extension options when field metadata or values change
  useEffect(() => {
    if (!editor) return;

    const schemaFieldExtension = editor.extensionManager.extensions.find(ext => ext.name === 'schemaField');
    if (schemaFieldExtension) {
      schemaFieldExtension.options.fieldMetadata = allFieldsMetadata;
      schemaFieldExtension.options.fieldValues = fieldValues;
    }
  }, [editor, allFieldsMetadata, fieldValues]);

  useEffect(() => {
    if (!editor) return;

    // Check if we have existing TiptapEditor JSON content (new format)
    if (content && content.content && Array.isArray(content.content)) {
      // Only set content if it's different from current content to avoid overriding
      const currentContent = editor.getJSON();

      // Extract just the TiptapEditor structure for comparison
      const { __fieldValues, __fieldMetadata, ...tiptapContent } = content;
      // Use the field values and metadata for type checking
      void __fieldValues; void __fieldMetadata;

      if (JSON.stringify(currentContent) !== JSON.stringify(tiptapContent)) {
        editor.commands.setContent(tiptapContent);
      }
      return;
    }

    // Check if we have old format content
    if (content && 'content' in content && '__textContent' in content && content.content && Array.isArray(content.content)) {
      const currentContent = editor.getJSON();
      const newContent = { type: 'doc', content: content.content };
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent);
      }
      return;
    }

    // Only initialize once when there's no existing content
    if (isInitialized) return;

    // Create simplified schema field nodes with only fieldId
    const schemaNodes = schema.fields.map((field) => ({
      type: 'schemaField',
      attrs: {
        fieldId: field.id,
      },
    }));

    const dynamicNodes = dynamicFields.map((field) => ({
      type: 'schemaField',
      attrs: {
        fieldId: field.id,
      },
    }));

    const allNodes = [...schemaNodes, ...dynamicNodes];

    editor.commands.setContent({ type: 'doc', content: allNodes });

    setIsInitialized(true);
  }, [editor, schema, dynamicFields, content, isInitialized]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const MarkdownToolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('bold') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleBold()}
        data-testid="bold-button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('italic') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleItalic()}
        data-testid="italic-button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('strike') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleStrike()}
        data-testid="strikethrough-button"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('bulletList') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleBulletList()}
        data-testid="bullet-list-button"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('orderedList') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleOrderedList()}
        data-testid="ordered-list-button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <section className="border rounded-lg bg-background">
      <div className="tiptap-editor">
        {/* Markdown Toolbar for flexible schemas */}
        {schema.strict !== true && editable && <MarkdownToolbar />}
        
        <div className="space-y-4 p-4">
          {/* Main Tiptap Editor with Schema Fields */}
          <div className={`tiptap-content ${!schema.strict ? 'flexible-schema' : ''}`} data-testid="editor-content">
            <EditorContent editor={editor} data-testid="tiptap-editor-content" />
          </div>
          
          {/* Add Field Dialog and Controls for flexible schemas */}
          {editable && schema.strict !== true && (
            <div className="space-y-2">
              <ContentDivider
                onAddParagraph={() => handleAddParagraph()}
                onAddField={() => handleAddFieldAtPosition()}
              />
              
              <AddFieldDialog
                onAddField={handleAddField}
                isOpen={isAddFieldDialogOpen}
                onOpenChange={setIsAddFieldDialogOpen}
                insertIndex={insertionPointIndex}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
