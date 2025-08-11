import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createForum } from '@/lib/api/ForumsApi';
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

interface CreateForumData {
  name: string;
  description: string;
  commentThreading: 'single' | 'multi';
}

interface Forum {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  archived_at?: string;
  posts_count?: number;
  members_count?: number;
}

interface CreateForumModalProps {
  onForumCreated: (forum: Forum) => void;
}

const CreateForumModal: React.FC<CreateForumModalProps> = ({ onForumCreated }) => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateForumData>({
    name: '',
    description: '',
    commentThreading: 'single'
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a forum name.",
        variant: "destructive"
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace to create a forum.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      const forumData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        // Note: The backend should handle the multi_thread field when creating posts
        // For now we're storing it as forum metadata if needed
      };
      
      const response = await createForum(forumData, currentWorkspace.id);
      
      if (response.data) {
        onForumCreated(response.data);
        setFormData({ name: '', description: '', commentThreading: 'multi' });
        setShowCreateDialog(false);
        toast({
          title: "Forum created",
          description: "New forum has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      toast({
        title: "Creation failed",
        description: "There was an error creating the forum. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', commentThreading: 'single' });
    setShowCreateDialog(false);
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Forum
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Forum</DialogTitle>
          <DialogDescription>
            Set up a new discussion forum for your community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="forum-name">Forum Name</Label>
            <Input
              id="forum-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter forum name..."
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-description">Description (optional)</Label>
            <Textarea
              id="forum-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this forum is for..."
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-3">
            <Label>Comment Threading</Label>
            <RadioGroup 
              value={formData.commentThreading} 
              onValueChange={(value: 'single' | 'multi') => setFormData({ ...formData, commentThreading: value })}
              disabled={isCreating}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single-threaded" />
                <Label htmlFor="single-threaded" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Single-threaded</div>
                    <div className="text-sm text-muted-foreground">
                      Linear discussion with no nested replies
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi" id="multi-threaded" />
                <Label htmlFor="multi-threaded" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Multi-threaded</div>
                    <div className="text-sm text-muted-foreground">
                      Allow nested replies and branching discussions (like Reddit)
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !formData.name.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Forum'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateForumModal; 