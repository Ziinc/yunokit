import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Power,
  PowerOff,
  Unlink,
  Database,
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  initiateOAuthFlow,
  getProjectDetails,
  disconnectSupabaseAccount,
  removeProjectReference,
  checkSupabaseConnection,
  listProjects,
  checkTokenNeedsRefresh,
  refreshAccessToken,
  exchangeCodeForToken,
} from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";

const SettingsSupabasePage: React.FC = () => {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showRemoveProjectDialog, setShowRemoveProjectDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Use SWR for connection status
  const {
    data: connectionData,
    error: connectionError,
    isLoading: isCheckingConnection,
    mutate: refreshConnection,
  } = useSWR("sbConnection", checkSupabaseConnection, {
    revalidateIfStale: false,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Check if token needs refreshing
  const { data: isTokenExpired = false } = useSWR(
    connectionData?.result ? "valid_access_token" : null,
    checkTokenNeedsRefresh,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch projects when connected
  const { data: projects, error: projectsError } = useSWR(
    connectionData?.result ? "projects" : null,
    listProjects,
    {
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Derived state
  const isConnected = connectionData?.result || false;
  const projectDetails = projects?.[0] || null; // Use the first project for now
  const connectionErrorMessage =
    connectionData?.error || connectionError?.message;

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (code && state) {
          await exchangeCodeForToken(code, state);
          await refreshConnection();

          toast({
            title: "Connected to Supabase",
            description:
              "Your Supabase project has been connected successfully",
          });
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Connection failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to connect to Supabase",
          variant: "destructive",
        });
      }
    };

    handleCallback();
  }, [searchParams, refreshConnection, toast]);

  // Refresh token if expired
  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (isTokenExpired) {
        try {
          const result = await refreshAccessToken();
          if (!result.success) {
            throw new Error(result.error || "Failed to refresh token");
          }
        } catch (error) {
          console.error("Token refresh error:", error);
        }
      }
    };

    handleTokenRefresh();
  }, [isTokenExpired]);

  // Set workspace ID
  useEffect(() => {
    // This should be replaced with actual logic to get the current workspace ID
    setWorkspaceId(1);
  }, []);

  const handleConnect = async () => {
    try {
      toast({
        title: "Connecting to Supabase",
        description: "A new window will open to complete the connection",
      });

      // Start the OAuth flow
      await initiateOAuthFlow();
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectSupabaseAccount();

      toast({
        title: "Disconnected",
        description: "Your Supabase account has been disconnected",
      });

      await refreshConnection();
      setShowDisconnectDialog(false);
    } catch (error) {
      console.error("Disconnection error:", error);
      toast({
        title: "Disconnection failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProjectRef = async () => {
    try {
      if (!workspaceId) {
        throw new Error("Workspace ID not found");
      }

      await removeProjectReference(workspaceId);

      toast({
        title: "Project reference removed",
        description:
          "This workspace is no longer associated with the Supabase project",
      });

      await refreshConnection();
      setShowRemoveProjectDialog(false);
      setConfirmText("");
    } catch (error) {
      console.error("Remove project reference error:", error);
      toast({
        title: "Failed to remove project reference",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <TabsContent value="supabase" className="space-y-6">
        {isCheckingConnection ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <Database className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-muted-foreground">
                Checking connection status...
              </p>
            </div>
          </div>
        ) : (
          <>
            {isConnected && projectDetails ? (
              <Card className="border-2 border-emerald-500/20 shadow-lg overflow-hidden">
                <div className="absolute right-4 top-4">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex gap-1.5 items-center px-3 py-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected</span>
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {projectDetails.name}
                  </CardTitle>
                  <CardDescription>
                    Your Supabase project is connected and ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                    <div className="flex flex-col space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Database className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">Project ID</span>
                      </div>
                      <p className="text-base font-mono tracking-tight">
                        {projectDetails.id}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Globe className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">Region</span>
                      </div>
                      <p className="text-base">{projectDetails.region}</p>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Server className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <p className="text-base text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        {isConnected ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <Separator className="my-4" />

                <CardFooter className="flex flex-col space-y-6 pt-2 pb-6">
                  <div className="space-y-3 w-full">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">
                      Unlink Supabase Project
                    </h3>
                    <div className="space-y-2 pt-2">
                      <p className="text-sm text-muted-foreground">
                        Will delete workspace project linkage. Data will still
                        be retained on the project DB, but no data will be shown
                        in the workspace dashboard until a new project is
                        linked.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowRemoveProjectDialog(true)}
                        disabled={isCheckingConnection}
                        className="mt-1"
                        size="sm"
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Remove Project Link
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border border-muted shadow overflow-hidden">
                <CardHeader>
                  <CardTitle>Connect to Supabase</CardTitle>
                  <CardDescription>
                    Link your Supabase project to enable content management
                    features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert
                    variant={connectionErrorMessage ? "destructive" : "default"}
                    className="mb-4"
                  >
                    <AlertDescription>
                      {connectionErrorMessage
                        ? `Connection error: ${connectionErrorMessage}`
                        : "No Supabase project connected"}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-muted rounded-lg p-6 flex flex-col items-center justify-center">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4 rounded-full mb-4">
                      <Database className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Supercharge your content
                    </h3>
                    <p className="text-center text-muted-foreground text-sm mb-4">
                      Connect your Supabase project to enable database-powered
                      content management
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-6">
                  <div className="space-y-3 w-full">
                    <Separator className="my-2" />
                    <div className="space-y-2 pt-1">
                      <p className="text-sm text-muted-foreground">
                        Authorize SupaContent to access your Supabase projects
                        via the Supabase management API
                      </p>
                      <Button
                        onClick={handleConnect}
                        disabled={isCheckingConnection}
                        className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 mt-1"
                        size="sm"
                      >
                        <Power className="mr-2 h-4 w-4" />
                        Connect to Supabase
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )}
            {/* New Card: Delete Supabase Connection */}
            {isConnected && projectDetails && (
              <Card className="border-2 border-destructive/20 shadow-lg overflow-hidden mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Delete Supabase Connection
                  </CardTitle>
                  <CardDescription>
                    Will delete all access tokens stored for connecting to the
                    Supabase management API. This affects all workspaces.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisconnectDialog(true)}
                    disabled={isCheckingConnection}
                    className="mt-1"
                    size="sm"
                  >
                    <PowerOff className="mr-2 h-4 w-4" />
                    Disconnect Supabase Account
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      {/* Disconnect Account Dialog */}
      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Supabase Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the connection to your Supabase
              account. All workspaces associated with this account will be
              affected as it deletes the access and refresh tokens used to
              connect to your Supabase account.
              <br />
              <br />
              This is non-destructive and all data is still retained on the
              project. You will need to reconnect to your Supabase account in
              order to re-access that data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDisconnectDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Project Reference Dialog */}
      <AlertDialog
        open={showRemoveProjectDialog}
        onOpenChange={setShowRemoveProjectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Project Association</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the association between this workspace and your
              Supabase project. This is non-destructive and all data is still
              retained on the project. Type{" "}
              <span className="font-semibold">delete</span> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Type 'delete' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRemoveProjectDialog(false);
                setConfirmText("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProjectRef}
              disabled={confirmText !== "delete"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Association
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsSupabasePage;
