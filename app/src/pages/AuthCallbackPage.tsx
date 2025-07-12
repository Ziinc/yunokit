import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Parse the hash fragment from the URL
    const handleAuthCallback = async () => {
      try {
        // The hash fragment contains the access token and other auth data
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (data?.session) {
          // Authentication successful
          toast({
            title: "Sign in successful",
            description: "You are now signed in to Yunokit"
          });

          // Redirect to home or protected page
          navigate("/");
        } else {
          // If no session, we're still waiting for the auth flow to complete
          // This could happen on initial page load before the hash is processed
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        
        toast({
          title: "Authentication failed",
          description: err instanceof Error ? err.message : "Could not complete the authentication process",
          variant: "destructive"
        });
        
        // Redirect to sign-in page after a delay
        setTimeout(() => {
          navigate("/sign-in");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, location]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Authentication Failed</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm">Redirecting to sign-in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate your account</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 