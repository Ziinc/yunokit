import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { WorkspaceRow } from "@/lib/api/WorkspaceApi";

interface WorkspaceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceRow | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const WorkspaceDeleteDialog: React.FC<WorkspaceDeleteDialogProps> = ({
  open,
  onOpenChange,
  workspace,
  onConfirm,
  isDeleting = false,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = workspace?.name || "";
  const isConfirmValid = confirmText === expectedText;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    await onConfirm();
    setConfirmText("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Workspace
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            workspace "{workspace.name}" and all of its data.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All content, settings, and data associated with this workspace will be lost.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Label htmlFor="confirm-text">
            Type <strong>{expectedText}</strong> to confirm deletion:
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            disabled={isDeleting}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 