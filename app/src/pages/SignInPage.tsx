import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Zap,
  Clock,
  Users,
  Database,
  Wand2,
  Github,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from "@/lib/api/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isFeatureEnabled, FeatureFlags, FeatureFlag } from "@/lib/featureFlags";
import { isAuthenticated } from "@/lib/api/auth";
const SignInPage: React.FC = () => {
  // State for OAuth loading indicators
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Testimonial quotes
  const testimonials = [
    {
      quote:
        "Finally! I no longer wake up to 3am Slack messages asking me to update a typo. Yunokit gave our marketing team superpowers and gave me back my sanity.",
      author: "Developer Who Can Sleep Again",
    },
    {
      quote:
        "Our content team went from 'Can you add this comma?' to 'We deployed three landing pages today.' My code commits are now for features, not fixing typos.",
      author: "Engineer with Better Git History",
    },
    {
      quote:
        "My design team used to joke that I was their personal HTML servant. With Yunokit, they're now independent content creators and I'm back to solving real engineering problems.",
      author: "Lead Developer at AgencyX",
    },
    {
      quote:
        "The marketing department and I haven't had a single emergency meeting since implementing Yunokit. They're happier, I'm happier, and our website is updated faster than ever.",
      author: "CTO Who Recovered Their Calendar",
    },
    {
      quote:
        "My inbox used to be a graveyard of 'urgent' content change requests. Now our non-technical team handles everything themselves, and they say it's easier than using Word.",
      author: "Developer with Empty Inbox",
    },
  ];

  // Memoize the random testimonial selection
  const randomTestimonial = useMemo(() => {
    return testimonials[Math.floor(Math.random() * testimonials.length)];
  }, []); // Empty dependency array means this will only run once when component mounts

  // State for email/password auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // State for registration
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // State for password reset
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSending, setIsResetSending] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const isAuthed = await isAuthenticated();
      if (isAuthed) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);


  const handleOAuthSignIn = async (
    provider: "google" | "microsoft" | "github"
  ) => {
    try {
      setOauthLoading(provider);

      let result;
      switch (provider) {
        case "google":
          result = await signInWithGoogle();
          break;
        case "microsoft":
          result = await signInWithMicrosoft();
          break;
        case "github":
          result = await signInWithGithub();
          break;
      }

      if (result.error) {
        throw result.error;
      }

    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again",
        variant: "destructive",
      });
      setOauthLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSigningIn(true);

      // Validate inputs
      if (!email || !password) {
        throw new Error('Please provide both email and password');
      } 
      
      // Sign in with Supabase
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sign in successful",
        description: `Welcome back!`,
      });
      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerEmail || !registerPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRegistering(true);
      const { data, error } = await signUpWithEmail(
        registerEmail,
        registerPassword
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: data?.user?.email_confirmed_at
          ? "You've been signed up and can now sign in"
          : "Please check your email to confirm your account",
      });

      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      setShowRegister(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not create your account",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResetSending(true);
      const { error } = await resetPassword(resetEmail);

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description:
          "Please check your email for instructions to reset your password",
      });

      setResetDialogOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Failed to send reset email",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResetSending(false);
    }
  };

  // Features for marketing banner - moved to summary
  const features = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Lightning Fast",
      description:
        "Dramatically accelerate your content workflow with optimized tools designed for efficiency.",
    },
    {
      icon: <Users className="h-5 w-5 text-yellow-500" />,
      title: "Community Magic",
      description:
        "Transform engagement with powerful moderation and interactive features your users will love.",
    },
    {
      icon: <Database className="h-5 w-5 text-yellow-500" />,
      title: "Supabase Integration",
      description:
        "Seamlessly connects with your Supabase database for a unified tech stack and simplified development.",
    },
    {
      icon: <Wand2 className="h-5 w-5 text-yellow-500" />,
      title: "Effortless Setup",
      description:
        "Get started in minutes with intuitive configuration that requires minimal technical expertise.",
    },
  ];


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-[10%] left-[5%] text-yellow-400 h-6 w-6 animate-pulse" />
        <Sparkles
          className="absolute top-[20%] right-[8%] text-yellow-400 h-5 w-5 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <Sparkles
          className="absolute top-[80%] left-[15%] text-yellow-400 h-7 w-7 animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        <Sparkles
          className="absolute top-[65%] right-[12%] text-yellow-400 h-4 w-4 animate-pulse"
          style={{ animationDelay: "0.7s" }}
        />
        <Sparkles
          className="absolute top-[40%] left-[8%] text-yellow-400 h-5 w-5 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <Sparkles
          className="absolute top-[30%] right-[20%] text-yellow-400 h-6 w-6 animate-pulse"
          style={{ animationDelay: "2.0s" }}
        />
        <Sparkles
          className="absolute top-[85%] right-[25%] text-yellow-400 h-5 w-5 animate-pulse"
          style={{ animationDelay: "1.0s" }}
        />
      </div>

      <div className="p-4 z-10 flex flex-col lg:flex-row max-w-7xl w-full gap-8 items-center justify-center">
        <Card className="w-full max-w-md shadow-xl z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-48 h-12 flex items-center justify-center">
              <img
                src="/branding.png"
                alt="Yunokit Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              {showRegister ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {showRegister
                ? "Sign up to your account"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>

          {showRegister ? (
            isFeatureEnabled(FeatureFlags.EMAIL_AUTH) ? (
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={isRegistering}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isRegistering}
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
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isRegistering}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setShowRegister(false)}
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </CardContent>
              </form>
            ) : (
              <CardContent className="space-y-4">
                <div className="text-center text-muted-foreground">
                  Email sign-up is currently disabled.
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowRegister(false)}
                  >
                    Back to Sign In
                  </button>
                </div>
              </CardContent>
            )
          ) : (
            <>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {isFeatureEnabled(FeatureFlags.GITHUB_AUTH as FeatureFlag) && (
                    <Button
                      onClick={() => handleOAuthSignIn("github")}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={!!oauthLoading}
                    >
                      {oauthLoading === "github" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in with GitHub...
                        </>
                      ) : (
                        <>
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          Continue with GitHub
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => handleOAuthSignIn("google")}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
                    disabled={!!oauthLoading}
                  >
                    {oauthLoading === "google" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-800" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                          />
                          <path
                            fill="#34A853"
                            d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                          />
                          <path
                            fill="#4A90E2"
                            d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  {isFeatureEnabled("microsoftAuth") && (
                    <Button
                      onClick={() => handleOAuthSignIn("microsoft")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={!!oauthLoading}
                    >
                      {oauthLoading === "microsoft" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in with Microsoft...
                        </>
                      ) : (
                        <>
                          <svg
                            className="mr-2 h-4 w-4"
                            viewBox="0 0 23 23"
                            fill="none"
                          >
                            <path d="M0 0H11V11H0V0Z" fill="#F25022" />
                            <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
                            <path d="M0 12H11V23H0V12Z" fill="#00A4EF" />
                            <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
                          </svg>
                          Continue with SSO
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isFeatureEnabled(FeatureFlags.EMAIL_AUTH) && (
                  <form onSubmit={handleEmailSignIn}>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSigningIn}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Password</Label>
                          <Dialog
                            open={resetDialogOpen}
                            onOpenChange={setResetDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs"
                              >
                                Forgot Password?
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                  Enter your email and we'll send you a link to
                                  reset your password.
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                onSubmit={handleResetPassword}
                                className="space-y-4 py-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="reset-email">Email</Label>
                                  <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resetEmail}
                                    onChange={(e) =>
                                      setResetEmail(e.target.value)
                                    }
                                    disabled={isResetSending}
                                  />
                                </div>
                                <DialogFooter className="mt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setResetDialogOpen(false)}
                                    disabled={isResetSending}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={isResetSending}
                                  >
                                    {isResetSending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      "Send Reset Link"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSigningIn}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSigningIn}
                      >
                        {isSigningIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>

              <CardFooter className="flex flex-col">
                <div className="text-center w-full">
                  {isFeatureEnabled("emailAuth") && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline ml-1"
                        onClick={() => setShowRegister(true)}
                      >
                        Sign Up Now
                      </button>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    By signing in, you agree to our{" "}
                    <a
                      href="https://yunokit.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://yunokit.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <a
                      href="https://github.com/yunokit/yunokit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Github className="h-3 w-3" />
                      <span>View on GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Marketing Banner */}
        <div className="hidden lg:flex flex-col max-w-xl w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="mb-5 flex items-center">
            <Sparkles className="h-7 w-7 mr-3 animate-pulse text-yellow-300" />
            <h2 className="text-3xl font-bold">
              Content Management{" "}
              <span className="relative italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                Reimagined
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full animate-pulse"></span>
              </span>
            </h2>
          </div>

          <p className="text-lg mb-6 font-medium">
            The Strapi-alternative that transforms your Supabase database into a
            powerful, intuitive CMS.
          </p>

          {/* Features grid */}
          <div className="flex flex-col gap-2 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center hover:bg-white hover:bg-opacity-10 rounded-lg p-2 transition-all"
              >
                <div className="mr-3 bg-white bg-opacity-20 rounded-full p-1.5 flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-white text-opacity-90 line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20 italic text-sm">
            "{randomTestimonial.quote}"
            <div className="mt-2 font-medium">— {randomTestimonial.author}</div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-300" />
              <p className="text-sm font-medium">Save 5+ hours every week!*</p>
            </div>
            <p className="text-xs text-yellow-200 mt-1 italic opacity-80">
              *Hours measured in developer time, which somehow expands when
              estimating project deadlines yet shrinks during lunch breaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
