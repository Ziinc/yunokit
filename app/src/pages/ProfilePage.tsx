import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
// Use Tailwind utilities directly; remove css-constants

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "An error occurred while signing out.");
      toast({
        title: "Error signing out",
        description: message,
        variant: "destructive",
      });
    }
  };

  // If not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        </div>
        
        <Card className={`sm:max-w-md sm:mx-auto`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-content">
            <Button onClick={() => navigate('/sign-in')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-content-lg">
              <div className={`flex flex-col items-center gap-4`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
