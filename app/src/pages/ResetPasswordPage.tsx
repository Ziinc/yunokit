import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { updatePassword, supabase } from "@/lib/supabase";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the user has a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        // Get the current session to check if the user is authenticated during a password reset
        const { data } = await supabase.auth.getSession();
        
        if (!data?.session) {
          setError("Invalid or expired password reset link. Please request a new one.");
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("Could not verify your reset session. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please enter and confirm your new password",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      const { error } = await updatePassword(password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully",
      });
      
      // Redirect to sign in page
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Please try again or request a new reset link",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-2 rounded-md bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Reset Link Invalid</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => navigate("/sign-in")}
            >
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-2 rounded-md bg-gradient-to-br from-cms-purple to-cms-blue w-12 h-12 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  id="new-password"
                  type="password" 
                  placeholder="Enter your new password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  id="confirm-password"
                  type="password" 
                  placeholder="Confirm your new password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </CardContent>
        </form>
        
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground mb-4">
            After resetting your password, you'll be redirected to sign in.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage; 