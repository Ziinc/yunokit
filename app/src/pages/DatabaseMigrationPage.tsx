
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ArrowUp, ArrowDown, AlertCircle, Check, RefreshCw, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getProjects } from "@/lib/supabase";

interface Migration {
  id: string;
  version: string;
  name: string;
  status: "pending" | "applied" | "failed";
  appliedAt?: string;
  description: string;
}

const DatabaseMigrationPage: React.FC = () => {
  const { toast } = useToast();
  const [activeProject, setActiveProject] = useState<string>("proj1");
  const [autoMigrate, setAutoMigrate] = useState(false);
  const [targetVersion, setTargetVersion] = useState("^1.0.0");
  const [isLoading, setIsLoading] = useState(false);
  const [migrations, setMigrations] = useState<Migration[]>([
    {
      id: "1",
      version: "1.0.0",
      name: "initial_schema",
      status: "applied",
      appliedAt: "2023-07-15T10:30:00Z",
      description: "Initial database schema with core tables"
    },
    {
      id: "2",
      version: "1.1.0",
      name: "add_user_profiles",
      status: "applied",
      appliedAt: "2023-08-20T14:15:00Z",
      description: "Add user profiles table and relations"
    },
    {
      id: "3",
      version: "1.2.0",
      name: "add_content_schemas",
      status: "applied",
      appliedAt: "2023-09-05T09:45:00Z",
      description: "Add content schemas and validation"
    },
    {
      id: "4",
      version: "2.0.0",
      name: "add_comments",
      status: "pending",
      description: "Add comments system and relations"
    },
    {
      id: "5",
      version: "2.1.0",
      name: "add_reporting",
      status: "pending",
      description: "Add content reporting system"
    }
  ]);
  
  const [projects, setProjects] = useState<{id: string; name: string; region: string; isConnected: boolean}[]>([]);
  
  React.useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await getProjects();
      if (data) {
        setProjects(data);
      }
    };
    
    fetchProjects();
  }, []);

  const handleMigrateUp = (migrationId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMigrations(prev => 
        prev.map(m => 
          m.id === migrationId ? {...m, status: "applied", appliedAt: new Date().toISOString()} : m
        )
      );
      
      toast({
        title: "Migration applied",
        description: `Successfully applied migration ${migrationId}`,
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleMigrateDown = (migrationId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMigrations(prev => 
        prev.map(m => 
          m.id === migrationId ? {...m, status: "pending", appliedAt: undefined} : m
        )
      );
      
      toast({
        title: "Migration rolled back",
        description: `Successfully rolled back migration ${migrationId}`,
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleMigrateUpAll = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMigrations(prev => 
        prev.map(m => ({...m, status: "applied", appliedAt: new Date().toISOString()}))
      );
      
      toast({
        title: "All migrations applied",
        description: "Successfully applied all pending migrations",
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Migrations refreshed",
        description: "Successfully refreshed migration status",
      });
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Database Migrations</h1>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </Button>
      </div>

      <Tabs defaultValue="migrations">
        <TabsList className="mb-4">
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="migrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                <span>Database Migrations</span>
              </CardTitle>
              <CardDescription>
                Manage database schema migrations for your Supabase project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Active Project</h3>
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-muted-foreground" />
                    <Select value={activeProject} onValueChange={setActiveProject}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.region})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleMigrateUpAll} 
                    className="gap-2"
                    disabled={!migrations.some(m => m.status === "pending") || isLoading}
                  >
                    <ArrowUp size={16} />
                    <span>Apply All Pending</span>
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrations.map((migration) => (
                    <TableRow key={migration.id}>
                      <TableCell>
                        <Badge variant="outline">{migration.version}</Badge>
                      </TableCell>
                      <TableCell>{migration.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{migration.description}</TableCell>
                      <TableCell>
                        {migration.status === "applied" ? (
                          <Badge variant="default" className="bg-green-500">Applied</Badge>
                        ) : migration.status === "failed" ? (
                          <Badge variant="destructive">Failed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{migration.appliedAt ? new Date(migration.appliedAt).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {migration.status === "pending" && (
                            <Button 
                              onClick={() => handleMigrateUp(migration.id)}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={isLoading}
                            >
                              <ArrowUp size={14} />
                              <span>Apply</span>
                            </Button>
                          )}
                          {migration.status === "applied" && (
                            <Button 
                              onClick={() => handleMigrateDown(migration.id)}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={isLoading}
                            >
                              <ArrowDown size={14} />
                              <span>Rollback</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Settings</CardTitle>
              <CardDescription>
                Configure auto-migration and version control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-migrate">Automatic Migration</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply migrations on deployment
                  </p>
                </div>
                <Switch 
                  id="auto-migrate" 
                  checked={autoMigrate}
                  onCheckedChange={setAutoMigrate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-version">Target Version</Label>
                <p className="text-sm text-muted-foreground">
                  Specify the target version for auto-migrations using SemVer syntax
                </p>
                <Input 
                  id="target-version" 
                  placeholder="e.g. ^1.0.0, ~2.0.0, >=1.0.0" 
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  SemVer examples: 
                  <code className="mx-1 p-0.5 bg-muted rounded">^1.0.0</code> (all 1.x.x),
                  <code className="mx-1 p-0.5 bg-muted rounded">~2.1.0</code> (all 2.1.x),
                  <code className="mx-1 p-0.5 bg-muted rounded">2.0.0</code> (exact)
                </p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Auto-migrations can potentially cause data loss. Always backup your database before enabling this feature.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() => {
                  toast({
                    title: "Settings saved",
                    description: "Migration settings have been updated",
                  });
                }}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseMigrationPage;
