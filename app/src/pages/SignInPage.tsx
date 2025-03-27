
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail, Box, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignInPage: React.FC = () => {
  const { signInWithGithub, signInWithGoogle, signInWithMicrosoft, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignInWithSupabase = () => {
    toast({
      title: "Supabase Auth",
      description: "Currently in development. Please use another provider.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-2 rounded-md bg-gradient-to-br from-cms-purple to-cms-blue w-12 h-12 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to SupaContent</CardTitle>
          <CardDescription>
            Choose a sign in method to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 p-6" 
            disabled={loading}
            onClick={() => signInWithGithub()}
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 p-6" 
            disabled={loading}
            onClick={() => signInWithGoogle()}
          >
            <Mail className="h-5 w-5" />
            Sign in with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 p-6" 
            disabled={loading}
            onClick={() => signInWithMicrosoft()}
          >
            <Box className="h-5 w-5" />
            Sign in with Microsoft
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 p-6" 
            disabled={loading}
            onClick={handleSignInWithSupabase}
          >
            <ShieldCheck className="h-5 w-5" />
            Sign in with Supabase
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground mb-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <Button 
            variant="ghost" 
            className="text-sm" 
            onClick={() => navigate('/')}
          >
            Continue as guest
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
