import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  Zap,
  Clock,
  Users,
  MessageCircle,
  Database,
  Wand2,
  Github,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithGithub,
} from "@/lib/api/auth";
// Feature flags removed; all gated features disabled by default
import { isAuthenticated } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/utils";
import { useNullableState } from "@/hooks/useNullableState";
// Use Tailwind utilities directly; remove css-constants
const SignInPage = () => {
  // State for OAuth loading indicators
  const [oauthLoading, setOauthLoading, clearOauthLoading] = useNullableState<string>(null);

  // Testimonial quotes organized by micro app
  const testimonialsByApp = {
    yunocontent: [
      {
        quote: "I used to spend weekends wrestling with Strapi. Now I spend them actually relaxing. What is this sorcery?",
        author: "Backend Developer, Eternally Grateful"
      },
      {
        quote: "Yunokit turned my Supabase into a CMS so fast, I thought I accidentally hired a wizard consultant.",
        author: "Solo Founder, Pleasantly Confused"
      },
      {
        quote: "Content management went from 'please kill me' to 'please give me more content to manage.' I don't recognize myself.",
        author: "Content Manager, Identity Crisis"
      },
      {
        quote: "My schema changes now take minutes instead of migrations. My therapist says I seem happier.",
        author: "Full-Stack Developer, Mentally Stable"
      },
      {
        quote: "I built a content API in 10 minutes. Then spent 3 hours convincing my team it wasn't a demo.",
        author: "Tech Lead, Imposter Syndrome"
      },
      {
        quote: "Yunokit made content editing so intuitive, even our CEO can add blog posts. God help us all.",
        author: "DevOps Engineer, Regretting Decisions"
      },
      {
        quote: "My content workflow is now so smooth, I keep checking if I broke something. Old habits die hard.",
        author: "Senior Developer, Trust Issues"
      },
      {
        quote: "I no longer cry when clients ask for 'just a small content change.' Character development, they call it.",
        author: "Freelancer, Emotional Growth"
      },
      {
        quote: "Content versioning that actually works? I'm starting to believe in fairy tales again.",
        author: "CTO, Cautious Optimist"
      },
      {
        quote: "My Supabase database went from 'organized chaos' to 'actually organized.' My OCD is pleased.",
        author: "Database Admin, Inner Peace"
      }
    ],
    yunocommunity: [
      {
        quote: "Yunokit gave us 'community-led growth.' Which apparently means my users now bully me into building features.",
        author: "Product Owner, Held Hostage"
      },
      {
        quote: "Our forums are so active, I'm considering charging rent. Users practically live there now.",
        author: "Community Manager, Accidental Landlord"
      },
      {
        quote: "Moderation used to be like herding cats. Now it's like herding very well-behaved, self-moderating cats.",
        author: "Lead Moderator, Cat Whisperer"
      },
      {
        quote: "We launched a community in a weekend. My users are more engaged than I am with my own product.",
        author: "Startup Founder, Existential Crisis"
      },
      {
        quote: "Our community grew so fast, I forgot I was supposed to be running a business, not a digital village.",
        author: "Entrepreneur, Accidental Mayor"
      },
      {
        quote: "User reports went from 'nuclear meltdown' to 'polite suggestion box.' I miss the chaos, honestly.",
        author: "Community Manager, Stockholm Syndrome"
      },
      {
        quote: "Forums launched at 9 AM. By lunch, users were organizing their own meetups. I've created a monster.",
        author: "Product Manager, Frankenstein Complex"
      },
      {
        quote: "My support tickets dropped 90%. Now I spend my days watching users help each other. It's beautiful.",
        author: "Customer Success, Unemployed But Happy"
      },
      {
        quote: "Community engagement metrics broke our analytics dashboard. Apparently 'too much engagement' is a real problem.",
        author: "Growth Hacker, Victim of Success"
      },
      {
        quote: "Users are now moderating better than I ever did. I'm either really good at my job or completely useless.",
        author: "Community Lead, Identity Crisis"
      }
    ]
  };

  // Random testimonial selection that changes with slide
  const [currentTestimonials, setCurrentTestimonials] = useState(() => ({
    yunocontent: testimonialsByApp.yunocontent[Math.floor(Math.random() * testimonialsByApp.yunocontent.length)],
    yunocommunity: testimonialsByApp.yunocommunity[Math.floor(Math.random() * testimonialsByApp.yunocommunity.length)]
  }));

  // Update testimonials when slide changes
  const updateTestimonials = () => {
    setCurrentTestimonials({
      yunocontent: testimonialsByApp.yunocontent[Math.floor(Math.random() * testimonialsByApp.yunocontent.length)],
      yunocommunity: testimonialsByApp.yunocommunity[Math.floor(Math.random() * testimonialsByApp.yunocommunity.length)]
    });
  };

  // State for registration
  const [showRegister, setShowRegister] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const isAuthed = await isAuthenticated();
      if (isAuthed) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
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
        description: getErrorMessage(error, "Authentication failed. Please try again"),
        variant: "destructive",
      });
      clearOauthLoading();
    }
  };

  // Marketing features
  const contentFeatures = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Lightning Fast",
      description:
        "Dramatically accelerate your content workflow with optimized tools designed for efficiency.",
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

  const communityFeatures = [
    {
      icon: <Users className="h-5 w-5 text-yellow-500" />,
      title: "Community Magic",
      description:
        "Transform engagement with powerful moderation and interactive features your users will love.",
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-yellow-500" />,
      title: "Community Forums",
      description: "Launch conversation hubs that keep your users coming back.",
    },
  ];

  const slides = [
    {
      appName: "yunocontent",
      appIcon: (
        <Database className="h-8 w-8 text-indigo-600" />
      ),
      icon: <Sparkles className="h-10 w-10 mr-3 animate-pulse text-yellow-300" />,
      heading: (
        <>
          Content Management{" "}
          <span className="relative italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
            Reimagined
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full animate-pulse"></span>
          </span>
        </>
      ),
      description:
        "Powerful Strapi-like CMS features for your Supabase backend",
      features: contentFeatures,
    },
    {
      appName: "yunocommunity",
      appIcon: (
        <Users className="h-8 w-8 text-purple-600" />
      ),
      icon: <Sparkles className="h-10 w-10 mr-3 animate-pulse text-yellow-300" />,
      heading: (
        <>
          Community Building{" "}
          <span className="relative italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
            Amplified
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full animate-pulse"></span>
          </span>
        </>
      ),
      description:
        "Discourse-style community forums powered by your Supabase backend",
      features: communityFeatures,
    },
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const currentSlide = slides[slideIndex];
  const nextSlide = () => {
    setSlideIndex((slideIndex + 1) % slides.length);
    updateTestimonials();
  };
  const prevSlide = () => {
    setSlideIndex((slideIndex - 1 + slides.length) % slides.length);
    updateTestimonials();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100`}>
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-[10%] left-[5%] text-yellow-400 h-10 w-10 animate-pulse" />
        <Sparkles
          className="absolute top-[20%] right-[8%] text-yellow-400 h-8 w-8 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <Sparkles
          className="absolute top-[80%] left-[15%] text-yellow-400 h-12 w-12 animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        <Sparkles
          className="absolute top-[65%] right-[12%] text-yellow-400 h-7 w-7 animate-pulse"
          style={{ animationDelay: "0.7s" }}
        />
        <Sparkles
          className="absolute top-[40%] left-[8%] text-yellow-400 h-9 w-9 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <Sparkles
          className="absolute top-[30%] right-[20%] text-yellow-400 h-11 w-11 animate-pulse"
          style={{ animationDelay: "2.0s" }}
        />
        <Sparkles
          className="absolute top-[85%] right-[25%] text-yellow-400 h-8 w-8 animate-pulse"
          style={{ animationDelay: "1.0s" }}
        />
      </div>

      <div className={`p-4 z-10 flex flex-col lg:flex-row max-w-7xl w-full gap-8 flex items-center justify-center`}>
        <Card className={`w-full max-w-md shadow-xl z-10`}>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 w-48 h-12 flex items-center justify-center`}>
              <img
                src="/branding.png"
                alt="Yunokit Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              {showRegister ? "Create an account" : "Micro-apps for your Supabase backend"}
            </CardTitle>
            <CardDescription>
              {showRegister
                ? "Sign up to your account"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>

          {showRegister ? (
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
          ) : (
            <>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <Button
                    onClick={() => handleOAuthSignIn("google")}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
                    disabled={oauthLoading !== null}
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
                </div>
              </CardContent>

              <CardFooter className="flex flex-col">
                <div className="text-center w-full">
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
        <div className={`hidden lg:flex lg:flex-col max-w-xl w-full h-[800px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl px-16 py-8 text-white shadow-xl relative`}>
          {/* Micro App Icons with Navigation */}
          <div className={`flex items-center justify-center gap-6 mb-8`}>
            <button
              type="button"
              onClick={prevSlide}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            
            {slides.map((slide) => (
              <button
                key={slide.appName}
                type="button"
                onClick={() => {
                  setSlideIndex(slides.findIndex(s => s.appName === slide.appName));
                  updateTestimonials();
                }}
                className={`group flex flex-col items-center transition-all duration-300 ${
                  slides[slideIndex].appName === slide.appName 
                    ? 'scale-110' 
                    : 'scale-100 opacity-70 hover:opacity-90 hover:scale-105'
                }`}
              >
                <div className={`p-4 rounded-2xl bg-white transition-all duration-300 shadow-lg ${
                  slides[slideIndex].appName === slide.appName 
                    ? 'bg-opacity-100 shadow-xl ring-4 ring-yellow-300 ring-opacity-50' 
                    : 'bg-opacity-80 hover:bg-opacity-90'
                }`}>
                  {slide.appIcon}
                </div>
                <span className={`mt-2 text-xs font-medium transition-all duration-300 ${
                  slides[slideIndex].appName === slide.appName 
                    ? 'text-yellow-200 font-bold' 
                    : 'text-white text-opacity-80'
                }`}>
                  {slide.appName}
                </span>
              </button>
            ))}
            
            <button
              type="button"
              onClick={nextSlide}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className={`mb-5 flex items-center justify-center relative`}>
            {currentSlide.icon}
            <h2 className="text-3xl font-bold text-center">{currentSlide.heading}</h2>
            <Sparkles className="h-10 w-10 ml-3 animate-pulse text-yellow-300" />
          </div>

          <p className="text-lg mb-6 font-medium">{currentSlide.description}</p>

          {/* Features grid */}
          <div className={`flex flex-col gap-2 mb-6`}>
            {currentSlide.features.map((feature) => (
              <div
                key={feature.title}
                className={`flex items-center justify-start hover:bg-white hover:bg-opacity-10 rounded-lg p-2 transition-all`}
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

          {/* Customer Testimonials */}
          <div className="mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20 italic text-sm">
              "{currentTestimonials[currentSlide.appName as keyof typeof currentTestimonials].quote}"
              <div className="mt-2 font-medium">— {currentTestimonials[currentSlide.appName as keyof typeof currentTestimonials].author}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto">
            <div className="-mx-16 border-t border-white border-opacity-20"></div>
            <div className="pt-6">
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-start">
                  <Clock className="h-5 w-5 mr-2 text-yellow-300" />
                  <p className="text-sm font-medium">Save 5+ hours every week!*</p>
                </div>
                <p className="text-xs text-yellow-200 mt-1 italic opacity-80 text-center">
                  *Hours measured in developer time, which somehow expands when
                  estimating project deadlines yet shrinks during lunch breaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
