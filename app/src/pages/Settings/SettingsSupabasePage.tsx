import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Power, PowerOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initiateOAuthFlow,  getProjectDetails } from "@/lib/supabase";

const SettingsSupabasePage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = localStorage.getItem("supabase_connected") === "true";
      setIsConnected(connected);
      
      if (connected) {
        // const accessToken = await getValidAccessToken();
        // const project = await getProjectDetails(accessToken);
        // setProjectDetails(project);
      }
    } catch (error) {
      console.error("Connection check error:", error);
      setIsConnected(false);
      // clearTokens();
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
      // clearTokens();
      setIsConnected(false);
      setProjectDetails(null);
      toast({
        title: "Disconnected",
        description: "Your Supabase project has been disconnected"
      });
    } catch (error) {
      console.error("Disconnection error:", error);
      toast({
        title: "Disconnection failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value="supabase">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>
            Connect your Supabase project to enable content management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {isConnected && projectDetails ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Connected to project: {projectDetails.name}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Project ID</p>
                      <p className="text-sm text-muted-foreground">{projectDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Region</p>
                      <p className="text-sm text-muted-foreground">{projectDetails.region}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No Supabase project connected
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          {isConnected ? (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              <PowerOff className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
            >
              <Power className="mr-2 h-4 w-4" />
              Connect to Supabase
            </Button>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default SettingsSupabasePage; 