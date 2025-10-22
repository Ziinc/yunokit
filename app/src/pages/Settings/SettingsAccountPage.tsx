import React, { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  signOut,
} from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Loader2,
  Trash2,
  LogOut,
} from "lucide-react";
// Feature flags removed; email auth settings disabled
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SettingsAccountPage = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" to confirm',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);

      // await deleteAccount()
      // TODO: Implement account deletion

      toast({
        title: "Account deletion initiated",
        description:
          "Your account is being deleted. You will be signed out shortly.",
      });

      await signOut();
      navigate("/sign-in");
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Failed to delete account",
        description: getErrorMessage(error, "Please try again later"),
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  // If still loading or no user data, show loading state
  if (!user) {
    return (
      <TabsContent value="account" className="space-y-4 mt-6">
        <div className="flex-center-justify min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="icon-lg animate-spin text-primary" />
            <p className="text-muted-foreground">Loading account settings...</p>
          </div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="account" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account Settings</CardTitle>
          <CardDescription>
            Manage your personal account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-lg font-medium">{user.email}</h3>
              </div>
            </div>
          </div>







          <div className="border-t pt-6">
            <Button
              variant="outline"
              onClick={async () => {
                toast({
                  title: "Signed out",
                  description: "You have been successfully signed out",
                });
                await signOut();
                navigate("/sign-in");
              }}
              className="w-fit gap-2"
            >
              <LogOut className="icon-sm" />
              Sign Out
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 text-destructive flex items-center gap-2">
              <AlertTriangle size={18} />
              Danger Zone
            </h3>

            <div className="space-y-4">
              <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="icon-sm" />
                <AlertTitle>Delete Account</AlertTitle>
                <AlertDescription>
                  This action permanently deletes your account and all
                  associated data. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Type "DELETE" to confirm</Label>
                <Input
                  id="delete-confirm"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={isDeleting}
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="icon-sm animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="icon-sm" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsAccountPage;
