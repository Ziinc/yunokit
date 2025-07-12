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
  updateUsername,
  updateEmail,
  updatePassword,
  signOut,
} from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Lock,
  Mail,
  Save,
  Loader2,
  Trash2,
  LogOut,
} from "lucide-react";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SettingsAccountPage: React.FC = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Account update states
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pseudonymInput, setPseudonymInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPseudonym] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle username update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameInput.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a valid username",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingUsername(true);

      if (user?.id) {
        const { error } = await updateUsername(user.id, usernameInput);

        if (error) throw error;

        toast({
          title: "Username updated",
          description: "Your username has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Update username error:", error);
      toast({
        title: "Failed to update username",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Handle email update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !emailInput.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())
    ) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingEmail(true);

      const { error } = await updateEmail(emailInput);

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check your email to confirm the change",
      });
    } catch (error) {
      console.error("Update email error:", error);
      toast({
        title: "Failed to update email",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill out all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);

      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        title: "Failed to update password",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  // If still loading or no user data, show loading state
  if (!user) {
    return (
      <TabsContent value="account" className="space-y-4 mt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                )}
                {isFeatureEnabled(FeatureFlags.PSEUDONYM) && (
                  <p className="text-sm text-muted-foreground">
                    Writing as: {(user as { pseudonym?: string }).pseudonym}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          {isFeatureEnabled("profileName") && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Profile Details</h3>
              <form onSubmit={handleUpdateUsername} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstNameInput}
                      onChange={(e) => setFirstNameInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastNameInput}
                      onChange={(e) => setLastNameInput(e.target.value)}
                    />
                  </div>
                </div>

                {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      Email can be changed in the account security section
                      below.
                    </p>
                  </div>
                )}

                {isFeatureEnabled(FeatureFlags.PSEUDONYM) && (
                  <div className="space-y-2">
                    <Label htmlFor="pseudonym">Pseudonym</Label>
                    <Input
                      id="pseudonym"
                      placeholder="Enter your writing pseudonym"
                      value={pseudonymInput}
                      onChange={(e) => setPseudonymInput(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      This name will be used for your published content. Leave
                      empty to use your real name.
                    </p>
                  </div>
                )}

                {isFeatureEnabled(FeatureFlags.PROFILE_LINKS) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <div className="relative">
                        <Input
                          id="linkedin"
                          placeholder="https://linkedin.com/in/username"
                          value={linkedinInput}
                          onChange={(e) => setLinkedinInput(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Profile</Label>
                      <div className="relative">
                        <Input
                          id="github"
                          placeholder="https://github.com/username"
                          value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="gap-2">
                  {isUpdatingPseudonym ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Username Update */}
          {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Update Username</h3>
              <form onSubmit={handleUpdateUsername} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    disabled={isUpdatingUsername}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingUsername}
                  className="gap-2"
                >
                  {isUpdatingUsername ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Username
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Update Email</h3>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={isUpdatingEmail}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isUpdatingEmail}>
                  {isUpdatingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Email"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  You will receive a confirmation email to verify the change.
                </p>
              </form>
            </div>
          )}

          {/* Password Update - Only for email/password accounts, not for OAuth */}
          {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Update Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter your new password"
                      className="pl-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your new password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </div>
          )}

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
              <LogOut className="h-4 w-4" />
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
                <AlertTriangle className="h-4 w-4" />
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
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
