import React, { useEffect, useState } from 'react';
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
import { Plus, X, Type, Hash, Calendar, ToggleLeft, List, Link, FileText, Code, Image, Bold, Italic, Underline, Strikethrough } from 'lucide-react';
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
          fieldType: newField.type,
          fieldName: newField.name,
          fieldValue: defaultValue,
          fieldRequired: newField.required,
          fieldDescription: newField.description,
          fieldOptions: newField.options || [],
          isDynamic: true,
        },
      };
      
      // Insert the node at the end of the document, followed by a paragraph for markdown content
      const currentSize = editorInstance.state.doc.content.size;
      editorInstance.chain()
        .focus()
        .insertContentAt(currentSize, [newNode, { type: 'paragraph' }])
        .run();
    }
    
    // Store content with metadata
    const contentWithMetadata = {
      ...newContent,
      __dynamicFields: updatedDynamicFields.reduce((acc: Record<string, Partial<ContentField>>, field: ContentField) => {
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


  const editor = useEditor({
    extensions: [StarterKit, SchemaField],
    content: '',
    editable,
    onCreate: ({ editor }) => {
      setEditorInstance(editor);
    },
    onUpdate: ({ editor }) => {
      // For flexible schemas, store both the raw editor content and extracted data
      if (!schema.strict) {
        const rawContent = editor.getJSON();
        
        // Extract field values and text content from the editor
        const extractedValues: Record<string, unknown> = {};
        const textContent: string[] = [];
        
        editor.state.doc.descendants((node) => {
          // Extract schema field values
          if (node.type.name === 'schemaField' && node.attrs.fieldId) {
            extractedValues[node.attrs.fieldId] = node.attrs.fieldValue;
          }
          // Extract text content from paragraphs and other text nodes
          else if (node.isText && node.text) {
            textContent.push(node.text);
          }
          return true;
        });
        
        onChange({ 
          __editorContent: rawContent,
          __extractedFields: extractedValues,
          __textContent: textContent.join(' ').trim(),
          __htmlContent: editor.getHTML()
        });
        return;
      }
      
      // For strict schemas, extract field values as before
      const extractedValues: Record<string, unknown> = {};
      
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'schemaField' && node.attrs.fieldId) {
          extractedValues[node.attrs.fieldId] = node.attrs.fieldValue;
        }
        return true;
      });
      
      // Update field values if they've changed
      const hasChanged = Object.keys(extractedValues).some(
        fieldId => extractedValues[fieldId] !== fieldValues[fieldId]
      );
      
      if (hasChanged) {
        setFieldValues(extractedValues);
        
        // Include dynamic field metadata in the content
        const contentWithMetadata = {
          ...extractedValues,
          __dynamicFields: dynamicFields.reduce((acc: Record<string, Partial<ContentField>>, field: ContentField) => {
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
      }
    },
  });

  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    if (!editor) return;
    
    // For flexible schemas, check if we have existing editor content
    if (!schema.strict && content.__editorContent) {
      // Only set content if it's different from current content to avoid overriding
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content.__editorContent)) {
        editor.commands.setContent(content.__editorContent);
      }
      return;
    }
    
    // Only initialize once for strict schemas or when there's no existing content
    if (isInitialized) return;
    
    // For strict schemas or initial flexible schema setup, create schema field nodes
    const schemaNodes = schema.fields.map((field) => ({
      type: 'schemaField',
      attrs: {
        fieldId: field.id,
        fieldType: field.type,
        fieldName: field.name,
        fieldValue: fieldValues[field.id] || null,
        fieldRequired: field.required,
        fieldDescription: field.description,
        fieldOptions: field.options || [],
        isDynamic: false,
      },
    }));
    
    const dynamicNodes = dynamicFields.map((field) => ({
      type: 'schemaField',
      attrs: {
        fieldId: field.id,
        fieldType: field.type,
        fieldName: field.name,
        fieldValue: fieldValues[field.id] || null,
        fieldRequired: field.required,
        fieldDescription: field.description,
        fieldOptions: field.options || [],
        isDynamic: true,
      },
    }));
    
    const allNodes = [...schemaNodes, ...dynamicNodes];
    
    // For flexible schemas, intersperse with paragraph nodes to allow markdown content
    if (!schema.strict) {
      const content = [];
      allNodes.forEach((node, index) => {
        content.push(node);
        // Add a paragraph after each schema field (except the last one)
        if (index < allNodes.length - 1) {
          content.push({ type: 'paragraph', content: [] });
        }
      });
      // Add a final paragraph at the end
      content.push({ type: 'paragraph', content: [] });
      editor.commands.setContent({ type: 'doc', content });
    } else {
      editor.commands.setContent({ type: 'doc', content: allNodes });
    }
    
    setIsInitialized(true);
  }, [editor, schema, dynamicFields, fieldValues, content, isInitialized]);

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
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('italic') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleItalic()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={`h-8 w-8 p-0 ${editor?.isActive('strike') ? 'bg-accent' : ''}`}
        disabled={!editor?.can().toggleStrike()}
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
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <section className="border rounded-lg bg-background">
      <div className="tiptap-editor">
        {/* Markdown Toolbar for flexible schemas */}
        {!schema.strict && editable && <MarkdownToolbar />}
        
        <div className="space-y-4 p-4">
          {/* Main Tiptap Editor with Schema Fields */}
          <EditorContent editor={editor} />
          
          {/* Add Field Dialog and Controls for flexible schemas */}
          {editable && !schema.strict && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddFieldDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>
              
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