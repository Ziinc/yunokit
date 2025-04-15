import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ArrowUp, ArrowDown, AlertCircle, Check, RefreshCw, Server, ChevronDown, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getProjects } from "@/lib/supabase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

interface Migration {
  id: string;
  version: string;
  name: string;
  status: "pending" | "applied" | "failed";
  appliedAt?: string;
  description: string;
}

interface DatabaseMigrationPageProps {
  workspaceId: string;
}

const InlineCodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="relative inline-block group">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-0 -top-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0.5"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-2 w-2" /> : <Copy className="h-2 w-2" />}
      </Button>
      <pre className="inline-block mx-1 !bg-[#272822] !m-0 rounded px-1.5">
        <code className="language-javascript !text-[10px]">{code}</code>
      </pre>
    </span>
  );
};

const DatabaseMigrationPage: React.FC<DatabaseMigrationPageProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [activeProject, setActiveProject] = useState<string>("proj1");
  const [autoMigrate, setAutoMigrate] = useState(false);
  const [targetVersion, setTargetVersion] = useState("^1.0.0");
  const [isLoading, setIsLoading] = useState(false);
  const [showExecutedMigrations, setShowExecutedMigrations] = useState(false);
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

  React.useEffect(() => {
    Prism.highlightAll();
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

  const pendingMigrations = migrations.filter(m => m.status === "pending");
  const executedMigrations = migrations.filter(m => m.status === "applied");

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
              <InlineCodeBlock code="^1.0.0" /> (all 1.x.x),
              <InlineCodeBlock code="~2.1.0" /> (all 2.1.x),
              <InlineCodeBlock code="2.0.0" /> (exact)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            <span>Pending Migrations</span>
          </CardTitle>
          <CardDescription>
            Review and apply pending database schema migrations
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
                disabled={!pendingMigrations.length || isLoading}
              >
                <ArrowUp size={16} />
                <span>Apply All Pending</span>
              </Button>
            </div>
          </div>
          
          {pendingMigrations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending migrations to apply
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMigrations.map((migration) => (
                  <TableRow key={migration.id}>
                    <TableCell>
                      <Badge variant="outline">{migration.version}</Badge>
                    </TableCell>
                    <TableCell>{migration.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{migration.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-6">
            <Collapsible open={showExecutedMigrations} onOpenChange={setShowExecutedMigrations}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <ChevronDown size={16} className={`transform transition-transform ${showExecutedMigrations ? 'rotate-180' : ''}`} />
                  <span>Show Executed Migrations ({executedMigrations.length})</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
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
                    {executedMigrations.map((migration) => (
                      <TableRow key={migration.id}>
                        <TableCell>
                          <Badge variant="outline">{migration.version}</Badge>
                        </TableCell>
                        <TableCell>{migration.name}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{migration.description}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500">Applied</Badge>
                        </TableCell>
                        <TableCell>{migration.appliedAt ? new Date(migration.appliedAt).toLocaleString() : "-"}</TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Always backup your database before applying migrations. Rollbacks may result in data loss.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseMigrationPage;
