
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onOpenAssetLibrary?: () => void;
}

const MenuBar = ({ editor, onOpenAssetLibrary }) => {
  const { toast } = useToast();
  
  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (onOpenAssetLibrary) {
      onOpenAssetLibrary();
      return;
    }
    
    const url = window.prompt('Enter the image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-t-md border-b">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('bold') ? 'bg-muted' : ''}`}
        title="Bold"
      >
        <Bold className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('italic') ? 'bg-muted' : ''}`}
        title="Italic"
      >
        <Italic className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('strike') ? 'bg-muted' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="h-5 w-5" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
        title="Heading 1"
      >
        <Heading1 className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
        title="Heading 2"
      >
        <Heading2 className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}`}
        title="Heading 3"
      >
        <Heading3 className="h-5 w-5" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
        title="Bullet List"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
        title="Ordered List"
      >
        <ListOrdered className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('taskList') ? 'bg-muted' : ''}`}
        title="Task List"
      >
        <CheckSquare className="h-5 w-5" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted' : ''}`}
        title="Quote"
      >
        <Quote className="h-5 w-5" />
      </button>
      <button
        onClick={addLink}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('link') ? 'bg-muted' : ''}`}
        title="Link"
      >
        <LinkIcon className="h-5 w-5" />
      </button>
      <button
        onClick={addImage}
        className="p-2 rounded-md hover:bg-muted"
        title="Image"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <button
        onClick={addTable}
        className={`p-2 rounded-md hover:bg-muted ${editor.isActive('table') ? 'bg-muted' : ''}`}
        title="Table"
      >
        <TableIcon className="h-5 w-5" />
      </button>
      
      <div className="w-px h-6 bg-border mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded-md hover:bg-muted"
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <Undo className="h-5 w-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded-md hover:bg-muted"
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <Redo className="h-5 w-5" />
      </button>
    </div>
  );
};

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ 
  content, 
  onChange,
  onOpenAssetLibrary
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border rounded-md overflow-hidden">
      <MenuBar editor={editor} onOpenAssetLibrary={onOpenAssetLibrary} />
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[300px]" 
      />
    </div>
  );
};
