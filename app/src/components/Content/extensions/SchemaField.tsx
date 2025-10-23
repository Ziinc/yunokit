import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BooleanToggle } from '@/components/ui/boolean-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Pin, Plus, AlignLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SchemaFieldAttrs {
  fieldId: string | null;
  fieldType?: string;
  fieldName?: string;
  fieldValue?: unknown;
  fieldRequired?: boolean;
  fieldDescription?: string;
  fieldOptions?: string[];
  isDynamic?: boolean;
}

const AutoSizeTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}> = ({ value, onChange, placeholder, minRows = 3, maxRows = 8, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate the line height
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;

    // Set height based on content, but constrain between min and max
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        // Adjust height on next tick to ensure the change is reflected
        setTimeout(adjustHeight, 0);
      }}
      placeholder={placeholder}
      className="resize-none overflow-hidden"
      rows={minRows}
      {...props}
    />
  );
};

const SchemaFieldComponent: React.FC<NodeViewProps> = ({ node, editor, getPos }) => {
  const attrs = node.attrs as SchemaFieldAttrs;

  // Get field metadata from editor's extension options
  const schemaFieldExtension = editor.extensionManager.extensions.find(ext => ext.name === 'schemaField');
  const metadataFromOptions = schemaFieldExtension?.options?.fieldMetadata?.[attrs.fieldId || ''];
  const fallbackMetadata = {
    type: attrs.fieldType || 'text',
    name: attrs.fieldName || '',
    required: Boolean(attrs.fieldRequired),
    description: attrs.fieldDescription || '',
    options: Array.isArray(attrs.fieldOptions) ? attrs.fieldOptions : [],
    isDynamic: Boolean(attrs.isDynamic),
  };
  const fieldMetadata = metadataFromOptions || fallbackMetadata;
  const fieldValues = schemaFieldExtension?.options?.fieldValues || {};
  const currentValue = (attrs.fieldId && fieldValues[attrs.fieldId]) ?? attrs.fieldValue;

  if (!attrs.fieldId && !metadataFromOptions) {
    return (
      <NodeViewWrapper className="my-1 relative" data-testid={`schema-field-${attrs.fieldId}`}>
        <div>Field not found: {attrs.fieldId}</div>
      </NodeViewWrapper>
    );
  }

  const handleChange = (value: unknown) => {
    // Notify the editor about field value changes
    const onFieldChange = schemaFieldExtension?.options?.onFieldChange;
    if (onFieldChange && attrs.fieldId) {
      onFieldChange(attrs.fieldId, value);
    }

    if (editor && typeof getPos === 'function') {
      try {
        const pos = getPos();
        if (typeof pos === 'number') {
          const transaction = editor.state.tr.setNodeAttribute(pos, 'fieldValue', value);
          editor.view.dispatch(transaction);
        }
      } catch (error) {
        console.error('Error updating field value:', error);
      }
    }
  };

  const handleAddParagraphAfter = () => {
    if (!editor || typeof getPos !== 'function') return;
    
    try {
      const pos = getPos();
      const nodeSize = node.nodeSize;
      const insertPos = pos + nodeSize;
      
      const paragraphNode = {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      };
      
      editor.chain()
        .focus()
        .insertContentAt(insertPos, paragraphNode)
        .setTextSelection(insertPos + 1)
        .run();
    } catch (error) {
      console.error('Error adding paragraph:', error);
    }
  };

  const handleAddFieldAfter = () => {
    if (!editor || typeof getPos !== 'function') return;
    
    // For now, just log - this would need to trigger the add field dialog
    // with the correct insertion position
    const pos = getPos();
    const nodeSize = node.nodeSize;
    const insertPos = pos + nodeSize;
    
    
    
    // TODO: Trigger add field dialog with insertPos
    // This would need to communicate with the TiptapEditor component
    // to show the AddFieldDialog with the correct insertion position
  };

  const descriptionId = fieldMetadata.description ? `schema-field-desc-${attrs.fieldId}` : undefined;

  const commonInputA11y = {
    'aria-label': fieldMetadata.name || undefined,
    'aria-required': fieldMetadata.required ? 'true' : undefined,
    'aria-describedby': descriptionId,
    required: fieldMetadata.required || undefined,
  } as const;

  const renderInput = () => {
    switch (fieldMetadata.type) {
      case 'text':
        return (
          <AutoSizeTextarea
            value={(currentValue as string) || ''}
            onChange={(value) => handleChange(value)}
            placeholder={fieldMetadata.description || `Enter ${fieldMetadata.name?.toLowerCase()}`}
            minRows={3}
            maxRows={8}
            data-testid={`text-input-${attrs.fieldId}`}
            {...commonInputA11y}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue as number | ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={fieldMetadata.description || `Enter ${fieldMetadata.name?.toLowerCase()}`}
            data-testid={`number-input-${attrs.fieldId}`}
            {...commonInputA11y}
          />
        );
      case 'boolean':
        return (
          <BooleanToggle
            value={Boolean(currentValue)}
            onChange={(checked) => handleChange(checked)}
            data-testid={`boolean-switch-${attrs.fieldId}`}
            aria-label={fieldMetadata.name || undefined}
            aria-required={fieldMetadata.required ? 'true' : undefined}
            aria-describedby={descriptionId}
          />
        );
      default:
        return (
          <Input
            value={(currentValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldMetadata.description || `Enter ${fieldMetadata.name?.toLowerCase()}`}
            data-testid={`default-input-${attrs.fieldId}`}
            {...commonInputA11y}
          />
        );
    }
  };


  const handleRemove = () => {
    if (editor && attrs.fieldId) {
      // Prevent deletion of required fields
      if (fieldMetadata.required) {
        // Could show a toast or alert here
        console.warn('Cannot delete required field:', fieldMetadata.name);
        return;
      }

      // Notify parent component about field removal
      const onFieldRemove = schemaFieldExtension?.options?.onFieldRemove;

      if (onFieldRemove && attrs.fieldId) {
        onFieldRemove(attrs.fieldId);
      }

      editor.commands.deleteNode('schemaField');
    }
  };

  return (
    <NodeViewWrapper className="my-1 relative" data-testid={`schema-field-${attrs.fieldId}`}>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            <div className="flex items-center mt-1">
              {!fieldMetadata.isDynamic && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Pin className="h-3 w-3 text-muted-foreground/40" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Schema-defined field</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="font-normal text-xs text-muted-foreground">
                    {fieldMetadata.name || 'Untitled Field'}
                    {fieldMetadata.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>

                {/* Show remove button only for dynamic fields */}
                {fieldMetadata.isDynamic && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={fieldMetadata.required}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemove();
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          data-testid={`remove-field-button-${attrs.fieldId}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{fieldMetadata.required ? 'Required field cannot be deleted' : 'Remove field'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {fieldMetadata.description && (
                <p id={descriptionId} className="text-xs text-muted-foreground/70">{fieldMetadata.description}</p>
              )}
              
              <div className="[&>*]:border-none [&>*]:shadow-none [&>*]:bg-transparent [&>*]:outline-none [&>*:focus]:outline-none [&>*:focus]:ring-0 [&>*]:bg-muted/30 [&>*:focus]:bg-muted/70 [&>*]:transition-colors">
                {renderInput()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom divider area with hover buttons */}
      <div className="group/bottom relative">
        <div className="h-4 flex items-center">
          <div className="w-full h-px bg-border opacity-0 group-hover/bottom:opacity-100 transition-opacity"></div>
        </div>
        <div className="absolute-center opacity-0 group-hover/bottom:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm px-2 py-1">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted/80 rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddParagraphAfter();
                    }}
                    data-testid={`add-paragraph-after-${attrs.fieldId}`}
                  >
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add paragraph below</p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddFieldAfter();
                    }}
                    data-testid={`add-field-after-${attrs.fieldId}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add field below</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const SchemaField = Node.create({
  name: 'schemaField',
  group: 'block',
  atom: true,
  isolating: true,
  selectable: false,
  addOptions() {
    return {
      onFieldRemove: () => {},
      onFieldChange: () => {},
      fieldMetadata: {},
      fieldValues: {},
    };
  },
  addAttributes() {
    return {
      fieldId: { default: null },
      fieldType: { default: 'text' },
      fieldName: { default: '' },
      fieldValue: { default: null },
      fieldRequired: { default: false },
      fieldDescription: { default: '' },
      fieldOptions: { default: [] },
      isDynamic: { default: false },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="field"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};

          return {
            fieldId: element.getAttribute('fieldid') || null,
          };
        },
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as SchemaFieldAttrs;
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'field' },
        {
          fieldid: attrs.fieldId,
        },
        HTMLAttributes
      )
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(SchemaFieldComponent);
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('schemaFieldPlugin'),
        props: {
          handleDOMEvents: {
            input: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="field"]');
              if (schemaField) {
                // Completely prevent the editor from processing this
                event.stopPropagation();
                event.preventDefault();
                return true;
              }
              return false;
            },
            keydown: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="field"]');
              if (schemaField) {
                // Prevent all keydown events from reaching the editor
                event.stopPropagation();
                return true;
              }
              return false;
            },
            keyup: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="field"]');
              if (schemaField) {
                event.stopPropagation();
                return true;
              }
              return false;
            },
            keypress: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="field"]');
              if (schemaField) {
                event.stopPropagation();
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default SchemaField;
