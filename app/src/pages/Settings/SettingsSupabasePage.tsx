import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Power, PowerOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initiateOAuthFlow, clearTokens, getValidAccessToken, getProjectDetails } from "@/lib/supabase";
import type { SupabaseProject } from "@/lib/supabase";

const SettingsSupabasePage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<SupabaseProject | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = localStorage.getItem("supabase_connected") === "true";
      setIsConnected(connected);
      
      if (connected) {
        const accessToken = await getValidAccessToken();
        const project = await getProjectDetails(accessToken);
        setProjectDetails(project);
      }
    } catch (error) {
      console.error("Connection check error:", error);
      // If we can't get a valid token, we're not connected
      setIsConnected(false);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      initiateOAuthFlow();
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      clearTokens();
      setIsConnected(false);
      setProjectDetails(null);

      toast({
        title: "Disconnected from Supabase",
        description: "Your Supabase project has been disconnected"
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({
        title: "Disconnect failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value="supabase" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Supabase Connection</CardTitle>
          <CardDescription>
            Connect your Supabase project to enable content synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : isConnected && projectDetails ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-green-500" />
                  Connected to Supabase
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Project Name</span>
                  <span className="font-medium">{projectDetails.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-medium">{projectDetails.region}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Organization ID</span>
                  <span className="font-medium">{projectDetails.organization_id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">
                    {new Date(projectDetails.created_at).toLocaleString()}
                  </span>
                </div>
                {projectDetails.last_synced_at && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Last Synced</span>
                    <span className="font-medium">
                      {new Date(projectDetails.last_synced_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <PowerOff className="h-4 w-4 text-red-500" />
                  Not connected to Supabase
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground">
                Connect your Supabase project to enable automatic content synchronization. 
                This will allow you to manage your content in Supacontent and have it automatically 
                synced to your Supabase database.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isConnected ? (
            <Button 
              variant="destructive"
              disabled={isLoading}
              onClick={handleDisconnect}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <PowerOff className="h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          ) : (
            <Button 
              disabled={isLoading}
              onClick={handleConnect}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  Connect to Supabase
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default SettingsSupabasePage; 