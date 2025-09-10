import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Pin } from 'lucide-react';
import { type ContentFieldType } from '@/lib/contentSchema';

interface SchemaFieldAttrs {
  fieldId: string | null;
  fieldType: ContentFieldType;
  fieldName: string;
  fieldValue: unknown;
  fieldRequired: boolean;
  fieldDescription: string;
  fieldOptions: string[];
  isDynamic?: boolean;
}

const SchemaFieldComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const attrs = node.attrs as SchemaFieldAttrs;

  const handleChange = (value: unknown) => {
    updateAttributes({ fieldValue: value });
    // Remove all the editor focus and update calls that cause re-renders
  };

  const renderInput = () => {
    switch (attrs.fieldType) {
      case 'text':
        return (
          <Input
            value={(attrs.fieldValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attrs.fieldDescription || `Enter ${attrs.fieldName?.toLowerCase()}`}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={attrs.fieldValue as number | ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={attrs.fieldDescription || `Enter ${attrs.fieldName?.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={(attrs.fieldValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(attrs.fieldValue)}
              onCheckedChange={(checked) => handleChange(checked)}
              className="scale-75"
            />
            <span className="text-xs text-muted-foreground">{attrs.fieldValue ? 'Yes' : 'No'}</span>
          </div>
        );
      case 'enum':
        return (
          <Select value={(attrs.fieldValue as string) || ''} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attrs.fieldName?.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {attrs.fieldOptions.map((option) => (
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
            value={(attrs.fieldValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attrs.fieldDescription || `Enter ${attrs.fieldName?.toLowerCase()}`}
            className="min-h-[120px] font-mono"
          />
        );
      case 'json':
        return (
          <Textarea
            value={typeof attrs.fieldValue === 'string' ? attrs.fieldValue : JSON.stringify(attrs.fieldValue || {}, null, 2)}
            onChange={(e) => {
              try {
                handleChange(JSON.parse(e.target.value));
              } catch {
                handleChange(e.target.value);
              }
            }}
            placeholder={attrs.fieldDescription || 'Enter JSON data'}
            className="min-h-[120px] font-mono"
          />
        );
      default:
        return (
          <Input
            value={(attrs.fieldValue as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attrs.fieldDescription || `Enter ${attrs.fieldName?.toLowerCase()}`}
          />
        );
    }
  };


  const handleRemove = () => {
    if (editor && attrs.fieldId) {
      editor.commands.deleteNode('schemaField');
    }
  };

  return (
    <NodeViewWrapper className="my-1">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            <div className="flex items-center mt-1">
              {!attrs.isDynamic && (
                <TooltipProvider>
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
                    {attrs.fieldName || 'Untitled Field'}
                    {attrs.fieldRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>
                
                {/* Show remove button only for dynamic fields */}
                {attrs.isDynamic && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {attrs.fieldDescription && (
                <p className="text-xs text-muted-foreground/70">{attrs.fieldDescription}</p>
              )}
              
              <div className="[&>*]:border-none [&>*]:shadow-none [&>*]:bg-transparent [&>*]:outline-none [&>*:focus]:outline-none [&>*:focus]:ring-0 [&>*]:bg-muted/30 [&>*:focus]:bg-muted/70 [&>*]:transition-colors">
                {renderInput()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};

const SchemaField = Node.create({
  name: 'schemaField',
  group: 'block',
  atom: true,
  isolating: true,
  selectable: false,
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
        tag: 'div[data-type="schema-field"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};
          
          return {
            fieldId: element.getAttribute('fieldid') || null,
            fieldType: element.getAttribute('fieldtype') || 'text',
            fieldName: element.getAttribute('fieldname') || '',
            fieldValue: element.getAttribute('fieldvalue') || null,
            fieldRequired: element.getAttribute('fieldrequired') === 'true',
            fieldDescription: element.getAttribute('fielddescription') || '',
            fieldOptions: element.getAttribute('fieldoptions')?.split(',') || [],
            isDynamic: element.getAttribute('isdynamic') === 'true',
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
        { 'data-type': 'schema-field' },
        {
          fieldid: attrs.fieldId,
          fieldtype: attrs.fieldType,
          fieldname: attrs.fieldName,
          fieldvalue: attrs.fieldValue,
          fieldrequired: attrs.fieldRequired,
          fielddescription: attrs.fieldDescription,
          fieldoptions: attrs.fieldOptions?.join(',') || '',
          isdynamic: attrs.isDynamic,
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
              const schemaField = target.closest('[data-type="schema-field"]');
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
              const schemaField = target.closest('[data-type="schema-field"]');
              if (schemaField) {
                // Prevent all keydown events from reaching the editor
                event.stopPropagation();
                return true;
              }
              return false;
            },
            keyup: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="schema-field"]');
              if (schemaField) {
                event.stopPropagation();
                return true;
              }
              return false;
            },
            keypress: (view, event) => {
              const target = event.target as HTMLElement;
              const schemaField = target.closest('[data-type="schema-field"]');
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

