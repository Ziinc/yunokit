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
import { Badge } from "@/components/ui/badge";
import {
  Database,
  AlertCircle,
  Check,
  RefreshCw,
  Eye,
  Play,
  Square,
  Power,
  PowerOff,
  Unlink,
  Server,
  Globe,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { groupBy } from "lodash";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  listMigrations,
  Migration,
  runAllMigrations,
} from "@/lib/api/MigrationsApi";
import {
  initiateOAuthFlow,
  disconnectSupabaseAccount,
  removeProjectReference,
  checkSupabaseConnection,
  listProjects,
  checkTokenNeedsRefresh,
  refreshAccessToken,
  exchangeCodeForToken,
} from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-sql";

interface MigrationListItemProps {
  migration: Migration;
  onViewSql: (migration: Migration) => void;
  isLoading: boolean;
}

const MigrationListItem: React.FC<MigrationListItemProps> = ({
  migration,
  onViewSql,
}) => {
  const [showSql] = useState(false);

  useEffect(() => {
    if (showSql) {
      Prism.highlightAll();
    }
  }, [showSql]);

  const getStatusBadge = () => {
    switch (migration.status) {
      case "applied":
        return (
          <Badge className="bg-green-500">
            <Check size={12} className="mr-1" />
            Applied
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Square size={12} className="mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle size={12} className="mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              {migration.version}
            </Badge>
            <div>
              <h3 className="font-medium text-sm">{migration.name}</h3>
              {migration.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {migration.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">{getStatusBadge()}</div>
        </div>

        {migration.applied_at && (
          <div className="text-xs text-muted-foreground mb-3">
            Applied: {formatDate(migration.applied_at)}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewSql(migration)}
              className="gap-1 h-7 px-2 text-xs"
            >
              <Eye size={10} />
              <span>View SQL</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MigrationSkeleton: React.FC = () => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

const SettingsDatabasePage: React.FC = () => {
  const { toast } = useToast();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [migrations, setMigrations] = useState<Record<string, Migration[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(
    null
  );
  const [isAppliedMigrationsOpen, setIsAppliedMigrationsOpen] = useState({
    yunocontent: false,
    yunocommunity: false,
  });

  // Supabase-related state
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showRemoveProjectDialog, setShowRemoveProjectDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
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
  const { data: projects } = useSWR(
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
  const projectDetails = projects?.[0] || null;
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
    setWorkspaceId(1);
  }, []);

  const loadMigrations = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      setIsAppliedMigrationsOpen({ yunocontent: false, yunocommunity: false });

      const migrations = await listMigrations(currentWorkspace.id);

      const groupedMigrations: Record<string, Migration[]> = groupBy(
        migrations,
        "schema"
      );
      setMigrations(groupedMigrations);
    } catch (error) {
      console.error("Error loading migrations:", error);
      toast({
        title: "Error loading migrations",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadMigrations();
  }, [currentWorkspace?.id]);

  const handleRunAllPending = async () => {
    try {
      setIsLoading(true);
      const result = await runAllMigrations(currentWorkspace.id);

      const totalPending = Object.values(migrations).reduce(
        (acc, schemaMigrations) =>
          acc + schemaMigrations.filter((m) => m.status === "pending").length,
        0
      );

      // Check if the migration was successful
      if (result.error) {
        toast({
          title: "Migration failed",
          description: result.error.message || "Failed to run migrations",
          variant: "destructive",
        });
      } else if (result.data?.result === "success") {
        toast({
          title: "All migrations applied",
          description: `Successfully applied ${totalPending} pending migrations`,
        });
      }

      await loadMigrations();
    } catch (error) {
      console.error("Error running migrations:", error);
      toast({
        title: "Error running migrations",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSql = (migration: Migration) => {
    setSelectedMigration(migration);
    setSqlModalOpen(true);
  };

  // Supabase handlers
  const handleConnect = async () => {
    try {
      toast({
        title: "Connecting to Supabase",
        description: "A new window will open to complete the connection",
      });

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

      setCurrentWorkspace(null);
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

  const pendingMigrations = {
    yunocontent: migrations.yunocontent.filter((m) => m.status === "pending"),
    yunocommunity: migrations.yunocommunity.filter(
      (m) => m.status === "pending"
    ),
  };

  const appliedMigrations = {
    yunocontent: migrations.yunocontent.filter((m) => m.status === "applied"),
    yunocommunity: migrations.yunocommunity.filter(
      (m) => m.status === "applied"
    ),
  };

  const totalPendingCount = Object.values(pendingMigrations).reduce(
    (acc, schemaMigrations) => acc + schemaMigrations.length,
    0
  );

  const totalMigrationsCount = Object.values(migrations).reduce(
    (acc, schemaMigrations) => acc + schemaMigrations.length,
    0
  );

  if (!currentWorkspace) {
    return (
      <TabsContent value="database" className="space-y-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>
              Please select a workspace to continue
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="database" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Database Management</CardTitle>
          <CardDescription>
            Manage your Supabase connection and database migrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentWorkspace ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                No workspace selected
              </h3>
              <p className="text-muted-foreground">
                Please select a workspace to continue
              </p>
            </div>
          ) : (
            <>
              {/* Supabase Connection Section */}
              {isCheckingConnection ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <Database className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-muted-foreground">
                        Checking connection status...
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
                              <span className="text-sm font-medium">
                                Project ID
                              </span>
                            </div>
                            <p className="text-base font-mono tracking-tight">
                              {projectDetails.id}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Globe className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium">
                                Region
                              </span>
                            </div>
                            <p className="text-base">{projectDetails.region}</p>
                          </div>

                          <div className="flex flex-col space-y-2 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Server className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium">
                                Status
                              </span>
                            </div>
                            <p className="text-base text-emerald-600 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              {projectDetails.status === "ACTIVE_HEALTHY"
                                ? "Active"
                                : projectDetails.status}
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
                              Will delete workspace project linkage. Data will
                              still be retained on the project DB, but no data
                              will be shown in the workspace dashboard until a
                              new project is linked.
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
                          Link your Supabase project to enable content
                          management features
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Alert
                          variant={
                            connectionErrorMessage ? "destructive" : "default"
                          }
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
                            Connect your Supabase project to enable
                            database-powered content management
                          </p>
                        </div>
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-6">
                        <div className="space-y-3 w-full">
                          <Separator className="my-2" />
                          <div className="space-y-2 pt-1">
                            <p className="text-sm text-muted-foreground">
                              Authorize YunoKit to access your Supabase projects
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
                </>
              )}

              {/* Database Migrations Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      Migrations
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Manage your database schema migrations
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadMigrations}
                      variant="outline"
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <RefreshCw
                        size={16}
                        className={isLoading ? "animate-spin" : ""}
                      />
                      <span>Refresh</span>
                    </Button>

                    {totalPendingCount > 0 && (
                      <Button
                        onClick={handleRunAllPending}
                        className="gap-2"
                        disabled={isLoading}
                      >
                        <Play size={16} />
                        <span>Apply All Pending ({totalPendingCount})</span>
                      </Button>
                    )}
                  </div>
                </div>

                {isInitialLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading migrations...</span>
                    </CardContent>
                  </Card>
                ) : isLoading && !isInitialLoading ? (
                  <MigrationSkeleton />
                ) : (
                  <>
                    {/* Pending Migrations by Schema */}
                    {(
                      Object.keys(pendingMigrations) as Array<
                        keyof typeof pendingMigrations
                      >
                    ).map((schema) => {
                      const schemaPendingMigrations = pendingMigrations[schema];
                      if (schemaPendingMigrations.length === 0) return null;

                      return (
                        <div key={`pending-${schema}`} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono">
                              {schema}
                            </Badge>
                            <h4 className="font-medium text-sm">
                              Pending Migrations (
                              {schemaPendingMigrations.length})
                            </h4>
                          </div>
                          <div className="space-y-4 ml-4 border-l-2 border-muted-foreground/20 pl-4">
                            {schemaPendingMigrations.map((migration) => (
                              <MigrationListItem
                                key={migration.version}
                                migration={migration}
                                onViewSql={handleViewSql}
                                isLoading={isLoading}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Applied Migrations by Schema */}
                    {(
                      Object.keys(appliedMigrations) as Array<
                        keyof typeof appliedMigrations
                      >
                    ).map((schema) => {
                      const schemaAppliedMigrations = appliedMigrations[schema];
                      if (schemaAppliedMigrations.length === 0) return null;

                      const hasPendingMigrations =
                        pendingMigrations[schema].length > 0;

                      return (
                        <div key={`applied-${schema}`} className="space-y-4">
                          {!hasPendingMigrations ? (
                            <Collapsible
                              open={isAppliedMigrationsOpen[schema]}
                              onOpenChange={(open) =>
                                setIsAppliedMigrationsOpen((prev) => ({
                                  ...prev,
                                  [schema]: open,
                                }))
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between"
                                >
                                  <span className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="font-mono"
                                    >
                                      {schema}
                                    </Badge>
                                    Applied Migrations (
                                    {schemaAppliedMigrations.length})
                                  </span>
                                  <ChevronRight
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                      isAppliedMigrationsOpen[schema]
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-4">
                                <div className="bg-muted/30 rounded-lg p-4 ml-4 border-l-2 border-muted-foreground/20">
                                  <div className="space-y-4">
                                    {schemaAppliedMigrations.map(
                                      (migration) => (
                                        <MigrationListItem
                                          key={migration.version}
                                          migration={migration}
                                          onViewSql={handleViewSql}
                                          isLoading={isLoading}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="font-mono"
                                >
                                  {schema}
                                </Badge>
                                <h4 className="font-medium text-sm">
                                  Applied Migrations (
                                  {schemaAppliedMigrations.length})
                                </h4>
                              </div>
                              <div className="space-y-4 ml-4 border-l-2 border-muted-foreground/20 pl-4">
                                {schemaAppliedMigrations.map((migration) => (
                                  <MigrationListItem
                                    key={migration.version}
                                    migration={migration}
                                    onViewSql={handleViewSql}
                                    isLoading={isLoading}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {totalMigrationsCount === 0 && (
                      <Card>
                        <CardContent className="text-center py-12">
                          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No migrations found
                          </h3>
                          <p className="text-muted-foreground">
                            Create migration files in your{" "}
                            <code>supabase/migrations/</code> directory to get
                            started.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>

              {/* Danger Zone */}
              {isConnected && projectDetails && (
                <div className="border-t pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-destructive">
                      Danger Zone
                    </h3>
                  </div>

                  <Card className="border-2 border-destructive/20 shadow-lg overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-destructive">
                        Delete Supabase Connection
                      </CardTitle>
                      <CardDescription>
                        Will delete all access tokens stored for connecting to
                        the Supabase management API. This affects all
                        workspaces.
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* SQL Modal */}
      <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Migration SQL</DialogTitle>
            <DialogDescription>
              {selectedMigration && (
                <>
                  Version: {selectedMigration.version} -{" "}
                  {selectedMigration.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {selectedMigration && (
              <pre className="text-xs bg-[#272822] text-[#f8f8f2] p-4 rounded overflow-x-auto">
                <code className="language-sql">{selectedMigration.sql}</code>
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
    </TabsContent>
  );
};

export default SettingsDatabasePage;
