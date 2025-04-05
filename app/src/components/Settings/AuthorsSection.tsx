import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";

interface SystemAuthor {
  id: string;
  name: string;
  description?: string;
}

interface TeamMemberAuthor {
  id: string;
  name: string;
  email: string;
  pseudonym: string | null;
}

export interface AuthorsSectionProps {
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    pseudonym: string | null;
  }[];
  systemAuthors: {
    id: string;
    name: string;
    description?: string;
  }[];
  isLoadingAuthors?: boolean;
  onAddSystemAuthor: (author: { name: string; description?: string }) => Promise<void>;
  onDeleteSystemAuthor: (id: string) => Promise<void>;
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({
  teamMembers,
  systemAuthors,
  isLoadingAuthors = false,
  onAddSystemAuthor,
  onDeleteSystemAuthor
}) => {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorDescription, setNewAuthorDescription] = useState("");
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [isDeletingAuthor, setIsDeletingAuthor] = useState<string | null>(null);

  const handleAddSystemAuthor = async () => {
    if (!newAuthorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAuthor(true);
    try {
      await onAddSystemAuthor({
        name: newAuthorName.trim(),
        description: newAuthorDescription.trim() || undefined,
      });
      
      setShowAddDialog(false);
      setNewAuthorName("");
      setNewAuthorDescription("");
      
      toast({
        title: "Author added",
        description: "System author has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add system author. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingAuthor(false);
    }
  };

  const handleDeleteSystemAuthor = async (id: string) => {
    setIsDeletingAuthor(id);
    try {
      await onDeleteSystemAuthor(id);
      toast({
        title: "Author deleted",
        description: "System author has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete system author. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAuthor(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Content Authors</CardTitle>
        <CardDescription>
          Manage individual and system authors for content publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Authors */}
        {isFeatureEnabled(FeatureFlags.SYSTEM_AUTHORS) && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">System Authors</h3>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Add System Author
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add System Author</DialogTitle>
                    <DialogDescription>
                      Create a new system author for automated content publishing.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSystemAuthor}>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="author-name" className="mb-2 block">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="author-name" 
                          value={newAuthorName} 
                          onChange={(e) => setNewAuthorName(e.target.value)} 
                          placeholder="e.g. Legal Team"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="author-description" className="mb-2 block">
                          Description
                        </Label>
                        <Input 
                          id="author-description" 
                          value={newAuthorDescription} 
                          onChange={(e) => setNewAuthorDescription(e.target.value)} 
                          placeholder="e.g. Legal department publishing team"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                      <Button type="submit" disabled={!newAuthorName.trim()}>Add Author</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingAuthors ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {systemAuthors.map(author => (
                  <Card key={author.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{author.name}</h4>
                          {author.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {author.description}
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive" 
                          onClick={() => handleDeleteSystemAuthor(author.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Members */}
        <div className={isFeatureEnabled(FeatureFlags.SYSTEM_AUTHORS) ? "border-t pt-6" : ""}>
          <h3 className="text-lg font-medium mb-4">Team Member Authors</h3>
          
          <div className="space-y-4">
            {teamMembers.map(member => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.pseudonym ? `Writing as: ${member.pseudonym}` : member.email}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="outline">
                      {member.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 