
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, BookOpen, GraduationCap, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuickstartTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: "ecommerce" | "blogging" | "tutorials" | null;
}

export const QuickstartTemplateDialog: React.FC<QuickstartTemplateDialogProps> = ({
  open,
  onOpenChange,
  templateType
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  if (!templateType) return null;
  
  const getTemplateInfo = () => {
    switch (templateType) {
      case "ecommerce":
        return {
          title: "E-commerce Template",
          description: "Create a complete e-commerce content structure with products, categories, orders, and customers.",
          icon: <ShoppingBag className="h-6 w-6 text-cms-purple" />,
          features: [
            "Product catalog with variants",
            "Product categories and tags",
            "Customer profiles",
            "Order management",
            "Shopping cart"
          ]
        };
      case "blogging":
        return {
          title: "Blogging Template",
          description: "Set up a complete blog with posts, categories, authors, and comments.",
          icon: <BookOpen className="h-6 w-6 text-cms-blue" />,
          features: [
            "Blog posts with rich text editing",
            "Author profiles",
            "Categories and tags",
            "Comments system",
            "Featured posts"
          ]
        };
      case "tutorials":
        return {
          title: "Tutorials Platform Template",
          description: "Create educational content with courses, lessons, quizzes, and student tracking.",
          icon: <GraduationCap className="h-6 w-6 text-cms-orange" />,
          features: [
            "Course structure with modules",
            "Video and text lessons",
            "Quizzes and assessments",
            "Student progress tracking",
            "Certificate generation"
          ]
        };
    }
  };
  
  const handleCreate = () => {
    // In a real implementation, this would create the actual content schemas
    toast({
      title: "Template installed",
      description: `The ${templateType} template has been added to your workspace`,
    });
    
    onOpenChange(false);
    navigate("/schemas");
  };
  
  const templateInfo = getTemplateInfo();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 mb-4">
          {templateInfo.icon}
          <div>
            <DialogTitle>{templateInfo.title}</DialogTitle>
            <DialogDescription className="mt-1">
              {templateInfo.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              This will create new content schemas in your workspace. You can modify them after creation.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-medium">Included content types:</h4>
            <ul className="space-y-2">
              {templateInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
