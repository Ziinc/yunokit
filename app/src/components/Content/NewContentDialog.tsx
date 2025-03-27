import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileJson, Blocks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NewContentDialogProps {
  children: React.ReactNode;
}

export const NewContentDialog: React.FC<NewContentDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const contentTypes = [
    {
      title: "Markdown Editor",
      description: "Simple markdown editing with previews",
      icon: <FileText size={24} className="text-cms-purple" />,
      path: "/editor/markdown",
      color: "bg-cms-purple-light"
    },
    {
      title: "JSON Editor",
      description: "Structured JSON data editing",
      icon: <FileJson size={24} className="text-cms-blue" />,
      path: "/editor/json",
      color: "bg-cms-blue-light"
    },
    {
      title: "Block Editor",
      description: "Visual block-based content creator",
      icon: <Blocks size={24} className="text-cms-orange" />,
      path: "/editor/block",
      color: "bg-cms-orange-light"
    }
  ];

  const handleCreate = (path: string, title: string) => {
    setOpen(false);
    navigate(path);
    toast({
      title: "New content created",
      description: `You're now editing with the ${title}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Create New Content</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {contentTypes.map((type) => (
            <Button
              key={type.path}
              variant="outline"
              className={`h-auto p-6 flex flex-col items-center gap-3 fun-border fun-shadow ${type.color} hover:scale-105 transition-all duration-300`}
              onClick={() => handleCreate(type.path, type.title)}
            >
              <div className="rounded-full p-3 bg-white/80">
                {type.icon}
              </div>
              <h3 className="font-medium text-center">{type.title}</h3>
              <p className="text-xs text-center text-muted-foreground">{type.description}</p>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

