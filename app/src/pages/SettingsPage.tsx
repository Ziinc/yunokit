import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProjects } from "@/lib/supabase";
import { 
  AlertCircle, 
  Database, 
  ServerCrash, 
  RefreshCw, 
  CheckCircle, 
  ArrowRight, 
  Plus, 
  Users, 
  Trash2, 
  UserPlus, 
  CreditCard, 
  DollarSign, 
  ChevronDown, 
  FileText, 
  User, 
  Lock, 
  Check,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock workspaces for demonstration
const mockWorkspaces = [
  { id: "ws1", name: "Primary Workspace", members: 5, projects: 3, isDefault: true },
  { id: "ws2", name: "Marketing Team", members: 3, projects: 1, isDefault: false },
  { id: "ws3", name: "Development", members: 4, projects: 2, isDefault: false }
];

// Mock team members for demonstration
const mockTeamMembers = [
  { id: "user1", name: "John Doe", email: "john@example.com", role: "admin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", role: "developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
  { id: "user3", name: "Bob Johnson", email: "bob@example.com", role: "editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
  { id: "user4", name: "Alice Williams", email: "alice@example.com", role: "writer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
];

// Mock billing data for demonstration
const mockBillingData = {
  currentPlan: "free",
  seats: { used: 4, total: 5 },
  workspaces: { used: 1, total: 1 },
  addOns: [
    { name: "Additional Storage", quantity: 0, price: 10 },
    { name: "API Rate Limit Increase", quantity: 0, price: 20 }
  ],
  invoices: [
    { id: "INV-001", date: "2023-09-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-002", date: "2023-08-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-003", date: "2023-07-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-004", date: "2023-06-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-005", date: "2023-05-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-006", date: "2023-04-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-007", date: "2023-03-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-008", date: "2023-02-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-009", date: "2023-01-01", amount: 0, status: "paid", items: "Free Plan" },
  ],
  monthlyCharges: [
    { month: "Jan", amount: 0 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 0 },
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 },
    { month: "Jul", amount: 0 },
    { month: "Aug", amount: 0 },
    { month: "Sep", amount: 0 },
    { month: "Oct", amount: 0 },
    { month: "Nov", amount: 0 },
    { month: "Dec", amount: 0 },
  ]
};

const SettingsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("writer");
  const [billingData, setBillingData] = useState(mockBillingData);
  const [invoicesPerPage, setInvoicesPerPage] = useState(5);
  const [currentInvoicesPage, setCurrentInvoicesPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(5);
  const [currentMembersPage, setCurrentMembersPage] = useState(1);
  const { toast } = useToast();

  // Pagination for invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentInvoicesPage - 1) * invoicesPerPage;
    const endIndex = startIndex + invoicesPerPage;
    return billingData.invoices.slice(startIndex, endIndex);
  }, [billingData.invoices, currentInvoicesPage, invoicesPerPage]);

  const totalInvoicesPages = Math.ceil(billingData.invoices.length / invoicesPerPage);

  // Pagination for team members
  const paginatedTeamMembers = useMemo(() => {
    const startIndex = (currentMembersPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    return teamMembers.slice(startIndex, endIndex);
  }, [teamMembers, currentMembersPage, membersPerPage]);

  const totalMembersPages = Math.ceil(teamMembers.length / membersPerPage);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data } = await getProjects();
        setProjects(data || []);
        
        // Set initially connected project
        const connectedProject = data.find((project: any) => project.isConnected);
        if (connectedProject) {
          setSelectedProject(connectedProject.id);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleConnectProject = (projectId: string) => {
    setSelectedProject(projectId);
    
    // This would actually update the connection in a real implementation
    toast({
      title: "Project connected",
      description: "You have successfully connected to the selected Supabase project.",
    });
  };

  const handleMigrateData = () => {
    toast({
      title: "Migration started",
      description: "Data migration process has been initiated. This may take a few minutes.",
    });
  };

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Error",
        description: "Workspace name cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    const newWorkspace = {
      id: `ws${Date.now()}`,
      name: newWorkspaceName,
      members: 1,
      projects: 0,
      isDefault: false
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName("");
    
    toast({
      title: "Workspace created",
      description: `"${newWorkspaceName}" workspace has been created successfully.`,
    });
  };

  const handleSetDefaultWorkspace = (workspaceId: string) => {
    const updatedWorkspaces = workspaces.map(workspace => ({
      ...workspace,
      isDefault: workspace.id === workspaceId
    }));
    
    setWorkspaces(updatedWorkspaces);
    
    toast({
      title: "Default workspace updated",
      description: "Your default workspace has been updated successfully.",
    });
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspaceToDelete = workspaces.find(ws => ws.id === workspaceId);
    if (!workspaceToDelete) return;
    
    // Don't allow deleting the default workspace
    if (workspaceToDelete.isDefault) {
      toast({
        title: "Cannot delete",
        description: "You cannot delete the default workspace.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    
    toast({
      title: "Workspace deleted",
      description: `"${workspaceToDelete.name}" workspace has been deleted.`,
    });
  };

  const handleInviteTeamMember = () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Email address cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    // Check if the email is already in use
    if (teamMembers.some(member => member.email === newMemberEmail)) {
      toast({
        title: "Error",
        description: "This email address is already associated with a team member.",
        variant: "destructive"
      });
      return;
    }

    const newMember = {
      id: `user${Date.now()}`,
      name: newMemberEmail.split('@')[0], // Use the part before @ as a temporary name
      email: newMemberEmail,
      role: newMemberRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberEmail}`
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail("");
    
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${newMemberEmail}.`,
    });
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    const updatedMembers = teamMembers.map(member => 
      member.id === userId ? { ...member, role: newRole } : member
    );
    
    setTeamMembers(updatedMembers);
    
    const member = teamMembers.find(m => m.id === userId);
    
    toast({
      title: "Role updated",
      description: `${member?.name}'s role has been updated to ${newRole}.`,
    });
  };

  const handleRemoveTeamMember = (userId: string) => {
    const memberToRemove = teamMembers.find(m => m.id === userId);
    if (!memberToRemove) return;
    
    const updatedMembers = teamMembers.filter(member => member.id !== userId);
    setTeamMembers(updatedMembers);
    
    toast({
      title: "Team member removed",
      description: `${memberToRemove.name} has been removed from the team.`,
    });
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrading plan",
      description: "You'll be redirected to complete the payment process.",
    });
    
    // This would redirect to Stripe or other payment processor in a real implementation
  };

  const handleUpdateAddOn = (name: string, quantity: number) => {
    const updatedAddOns = billingData.addOns.map(addOn => 
      addOn.name === name ? { ...addOn, quantity } : addOn
    );
    
    setBillingData({
      ...billingData,
      addOns: updatedAddOns
    });
    
    toast({
      title: "Add-on updated",
      description: `${name} quantity updated to ${quantity}.`,
    });
  };

  const ProjectCard = ({ project }: { project: any }) => {
    const isSelected = selectedProject === project.id;
    
    return (
      <Card className={`border-2 ${isSelected ? 'border-primary' : 'border-border'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Database size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
            {project.name}
            {isSelected && (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Region: {project.region}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          {isSelected ? (
            <Button variant="outline" size="sm" disabled className="w-full">
              <CheckCircle size={16} className="mr-2 text-green-500" />
              Connected
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => handleConnectProject(project.id)}
            >
              Connect
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary">Admin</Badge>;
      case 'developer':
        return <Badge className="bg-blue-500">Developer</Badge>;
      case 'editor':
        return <Badge className="bg-amber-500">Editor</Badge>;
      case 'writer':
        return <Badge className="bg-green-500">Writer</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Lock size={16} />;
      case 'developer':
        return <Code size={16} />;
      case 'editor':
        return <FileText size={16} />;
      case 'writer':
        return <User size={16} />;
      default:
        return <User size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="projects">Supabase Projects</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Supabase Connection</CardTitle>
              <CardDescription>
                Manage your Supabase project connections and data migration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Status</AlertTitle>
                <AlertDescription>
                  {selectedProject 
                    ? "Your CMS is connected to a Supabase project. You can change the connection or migrate data to another project."
                    : "Your CMS is not connected to any Supabase project. Please connect to a project to enable authentication, storage, and database features."}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Available Projects</h3>
                  <Button variant="outline" size="sm" onClick={() => {}} className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <ServerCrash className="h-8 w-8 text-muted-foreground animate-pulse" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>

              {selectedProject && (
                <>
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Project Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-backup" className="block mb-1">Automatic Backups</Label>
                          <p className="text-sm text-muted-foreground">Create daily backups of your content</p>
                        </div>
                        <Switch id="auto-backup" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="rls-enforce" className="block mb-1">Enforce RLS Policies</Label>
                          <p className="text-sm text-muted-foreground">Strictly enforce row-level security policies</p>
                        </div>
                        <Switch id="rls-enforce" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Data Migration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Migrate your content to another Supabase project. This will copy all content types, 
                      content items, and assets to the selected project.
                    </p>
                    
                    <div className="mb-4">
                      <Label htmlFor="migration-target" className="block mb-2">Migration Target</Label>
                      <RadioGroup defaultValue="none" id="migration-target">
                        {projects
                          .filter(project => project.id !== selectedProject)
                          .map(project => (
                            <div className="flex items-center space-x-2" key={project.id}>
                              <RadioGroupItem value={project.id} id={`project-${project.id}`} />
                              <Label htmlFor={`project-${project.id}`}>{project.name} ({project.region})</Label>
                            </div>
                          ))
                        }
                      </RadioGroup>
                    </div>
                    
                    <Button onClick={handleMigrateData} className="gap-2">
                      <ArrowRight size={16} />
                      Start Migration
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workspaces" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Workspace Management</CardTitle>
              <CardDescription>
                Create and manage content workspaces for different teams or projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Workspaces</h3>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={16} />
                      New Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create new workspace</DialogTitle>
                      <DialogDescription>
                        Enter a name for your new workspace.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="workspace-name" className="mb-2 block">Workspace Name</Label>
                      <Input 
                        id="workspace-name" 
                        value={newWorkspaceName} 
                        onChange={(e) => setNewWorkspaceName(e.target.value)} 
                        placeholder="e.g. Marketing Team"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewWorkspaceName("")}>Cancel</Button>
                      <Button onClick={handleCreateWorkspace}>Create Workspace</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {workspaces.map(workspace => (
                  <Card key={workspace.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Users size={20} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {workspace.name}
                              {workspace.isDefault && (
                                <Badge variant="outline" className="ml-1 text-xs">Default</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {workspace.members} members • {workspace.projects} projects
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!workspace.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetDefaultWorkspace(workspace.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive" 
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            disabled={workspace.isDefault}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Team Management</CardTitle>
              <CardDescription>
                Invite team members and manage access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus size={16} />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite team member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your workspace.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="member-email" className="mb-2 block">Email Address</Label>
                        <Input 
                          id="member-email" 
                          type="email"
                          value={newMemberEmail} 
                          onChange={(e) => setNewMemberEmail(e.target.value)} 
                          placeholder="colleague@example.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="member-role" className="mb-2 block">Role</Label>
                        <Select defaultValue={newMemberRole} onValueChange={setNewMemberRole}>
                          <SelectTrigger id="member-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin" className="flex items-center gap-2">
                              <Lock size={16} className="inline mr-2" />
                              Admin
                            </SelectItem>
                            <SelectItem value="developer" className="flex items-center gap-2">
                              <Code size={16} className="inline mr-2" />
                              Developer
                            </SelectItem>
                            <SelectItem value="editor" className="flex items-center gap-2">
                              <FileText size={16} className="inline mr-2" />
                              Editor
                            </SelectItem>
                            <SelectItem value="writer" className="flex items-center gap-2">
                              <User size={16} className="inline mr-2" />
                              Writer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewMemberEmail("")}>Cancel</Button>
                      <Button onClick={handleInviteTeamMember}>Send Invitation</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTeamMembers.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                              <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            {getRoleBadge(member.role)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select 
                              defaultValue={member.role} 
                              onValueChange={(value) => handleUpdateRole(member.id, value)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="writer">Writer</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleRemoveTeamMember(member.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {teamMembers.length > 0 && (
                  <div className="p-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Items per page:</span>
                      <Select 
                        value={String(membersPerPage)} 
                        onValueChange={(value) => {
                          setMembersPerPage(Number(value));
                          setCurrentMembersPage(1); // Reset to first page when changing items per page
                        }}
                      >
                        <SelectTrigger className="w-[80px] h-8">
                          <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMembersPage(p => Math.max(1, p - 1))}
                        disabled={currentMembersPage === 1}
                        className="text-muted-foreground font-normal"
                      >
                        ← Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="mx-2 h-10 w-10"
                      >
                        {currentMembersPage}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMembersPage(p => Math.min(totalMembersPages, p + 1))}
                        disabled={currentMembersPage === totalMembersPages || totalMembersPages === 0}
                        className="text-muted-foreground font-normal"
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Roles & Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lock size={16} />
                      Admin
                    </h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Manage team members and roles
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Create and modify content types
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Edit and publish content
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Manage workspace settings
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Code size={16} />
                      Developer
                    </h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Create and modify content types
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Edit and publish content
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Access API and developer features
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText size={16} />
                      Editor
                    </h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Edit and publish content
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Approve content from writers
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <User size={16} />
                      Writer
                    </h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Create and edit content
                      </li>
                      <li className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />
                        Submit content for approval
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your plan, invoices, and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                  
                  <Card className="bg-muted/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-xl font-medium">
                            {billingData.currentPlan === "free" ? "Free Plan" : "Team Plan"}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {billingData.currentPlan === "free" 
                              ? "Limited features for individuals" 
                              : "Enhanced features for teams"}
                          </p>
                        </div>
                        <div>
                          <Badge className={billingData.currentPlan === "free" ? "bg-secondary" : "bg-primary"}>
                            {billingData.currentPlan === "free" ? "Free" : "Paid"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Team members</span>
                          <span className="text-sm font-medium">
                            {billingData.seats.used}/{billingData.seats.total}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Workspaces</span>
                          <span className="text-sm font-medium">
                            {billingData.workspaces.used}/{billingData.workspaces.total}
                          </span>
                        </div>
                        
                        {billingData.currentPlan === "free" && (
                          <Button 
                            className="w-full mt-4 gap-2" 
                            onClick={handleUpgradePlan}
                          >
                            <DollarSign size={16} />
                            Upgrade to Team Plan
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Add-ons</h3>
                  
                  <div className="space-y-4">
                    {billingData.addOns.map((addOn) => (
                      <Card key={addOn.name} className="bg-muted/50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{addOn.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${addOn.price}/month per unit
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateAddOn(addOn.name, Math.max(0, addOn.quantity - 1))}
                                disabled={addOn.quantity === 0}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{addOn.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateAddOn(addOn.name, addOn.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Billing History</h3>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                            }`}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {billingData.invoices.length > 0 && (
                    <div className="p-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Items per page:</span>
                        <Select 
                          value={String(invoicesPerPage)} 
                          onValueChange={(value) => {
                            setInvoicesPerPage(Number(value));
                            setCurrentInvoicesPage(1); // Reset to first page when changing items per page
                          }}
                        >
                          <SelectTrigger className="w-[80px] h-8">
                            <SelectValue placeholder="5" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentInvoicesPage(p => Math.max(1, p - 1))}
                          disabled={currentInvoicesPage === 1}
                          className="text-muted-foreground font-normal"
                        >
                          ← Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="mx-2 h-10 w-10"
                        >
                          {currentInvoicesPage}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentInvoicesPage(p => Math.min(totalInvoicesPages, p + 1))}
                          disabled={currentInvoicesPage === totalInvoicesPages || totalInvoicesPages === 0}
                          className="text-muted-foreground font-normal"
                        >
                          Next →
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Monthly Charges</h3>
                
                <div className="h-64 border rounded-md p-4">
                  <div className="flex items-end justify-between h-48">
                    {billingData.monthlyCharges.map((month) => (
                      <div key={month.month} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-colors"
                          style={{ 
                            height: `${Math.max(5, (month.amount / 50) * 100)}%`,
                          }}
                        ></div>
                        <span className="text-xs mt-2">{month.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current billing cycle: Free Plan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

