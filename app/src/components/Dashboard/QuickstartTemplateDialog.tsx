import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, BookOpen, GraduationCap, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplateService, TemplateType } from "@/lib/api/TemplateService";

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
  const [isLoading, setIsLoading] = useState(false);
  
  if (!templateType) return null;
  
  const getTemplateIcon = (type: TemplateType) => {
    switch (type) {
      case "ecommerce":
        return <ShoppingBag className="h-6 w-6 text-cms-purple" />;
      case "blogging":
        return <BookOpen className="h-6 w-6 text-cms-blue" />;
      case "tutorials":
        return <GraduationCap className="h-6 w-6 text-cms-orange" />;
    }
  };
  
  const handleCreateTemplate = async () => {
    try {
      setIsLoading(true);
      
      // Apply the template
      await TemplateService.applyTemplate(templateType);
      
      toast({
        title: "Template installed",
        description: `The ${templateType} template has been added to your workspace`,
      });
      
      setIsLoading(false);
      onOpenChange(false);
      navigate("/manager");
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error creating template",
        description: "There was an error creating the template. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  const templateInfo = TemplateService.getTemplateInfo(templateType);
  
  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 mb-4">
          {getTemplateIcon(templateType)}
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
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTemplate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Use Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
