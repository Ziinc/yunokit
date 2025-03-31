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
import { getProjects, getUserProfile, updateUsername, updateEmail, updatePassword, signOut, supabase } from "@/lib/supabase";
import { AuthorsSection } from "@/components/Settings/AuthorsSection";
import { SystemAuthorApi, SystemAuthor } from "@/lib/api/SystemAuthorApi";
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
  Code,
  Mail,
  AlertTriangle,
  Github,
  MailIcon,
  Save,
  Loader2,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaginationControls } from "@/components/Content/ContentList/PaginationControls";

interface SystemAuthorType extends SystemAuthor {}

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
  seats: { used: 1, total: 1 },
  workspaces: { used: 1, total: 1 },
  features: {
    communityFeatures: false,
    systemAuthors: false,
    contentApprovalFlow: false
  },
  invoices: [
    { id: "INV-001", date: "2023-09-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-002", date: "2023-08-01", amount: 0, status: "paid", items: "Free Plan" },
    { id: "INV-003", date: "2023-07-01", amount: 0, status: "paid", items: "Free Plan" },
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
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Account update states
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pseudonymInput, setPseudonymInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPseudonym, setIsUpdatingPseudonym] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Mock system authors data
  const [systemAuthors, setSystemAuthors] = useState<SystemAuthorType[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

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

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setProfileLoading(true);
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        if (profile) {
          setUsernameInput(profile.username || "");
          setEmailInput(profile.email || "");
          setFirstNameInput(profile.first_name || "");
          setLastNameInput(profile.last_name || "");
          setLinkedinInput(profile.linkedin_url || "");
          setGithubInput(profile.github_url || "");
          setPseudonymInput(profile.pseudonym || "");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile information",
          variant: "destructive"
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [toast]);

  // Load system authors
  useEffect(() => {
    const loadSystemAuthors = async () => {
      try {
        await SystemAuthorApi.initializeStorage();
        const authors = await SystemAuthorApi.getSystemAuthors();
        setSystemAuthors(authors);
      } catch (error) {
        console.error("Failed to load system authors:", error);
        toast({
          title: "Error",
          description: "Failed to load system authors",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAuthors(false);
      }
    };

    loadSystemAuthors();
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

  // Handle username update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usernameInput.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a valid username",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdatingUsername(true);
      
      if (userProfile?.id) {
        const { error } = await updateUsername(userProfile.id, usernameInput);
        
        if (error) throw error;
        
        // Update local profile state
        setUserProfile({
          ...userProfile,
          username: usernameInput
        });
        
        toast({
          title: "Username updated",
          description: "Your username has been updated successfully"
        });
      }
    } catch (error) {
      console.error("Update username error:", error);
      toast({
        title: "Failed to update username",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUsername(false);
    }
  };
  
  // Handle email update
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdatingEmail(true);
      
      const { error } = await updateEmail(emailInput);
        
      if (error) throw error;
      
      toast({
        title: "Email update initiated",
        description: "Please check your email to confirm the change"
      });
    } catch (error) {
      console.error("Update email error:", error);
      toast({
        title: "Failed to update email",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };
  
  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill out all password fields",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdatingPassword(true);
      
      const { error } = await updatePassword(newPassword);
      
      if (error) throw error;
      
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully"
      });
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        title: "Failed to update password",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" to confirm',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // In a real app, this would call an API endpoint to delete the user account
      // For now, we'll just sign the user out
      toast({
        title: "Account deletion initiated",
        description: "Your account is being deleted. You will be signed out shortly."
      });
      
      // Add a short delay to simulate deletion
      setTimeout(async () => {
        await signOut();
      }, 2000);
      
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Failed to delete account",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

  // Get OAuth provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github size={16} />;
      case 'google':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
            <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
            <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
            <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
          </svg>
        );
      case 'azure':
        return (
          <svg width="16" height="16" viewBox="0 0 23 23" fill="none">
            <path d="M0 0H11V11H0V0Z" fill="#F25022" />
            <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
            <path d="M0 12H11V23H0V12Z" fill="#00A4EF" />
            <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
          </svg>
        );
      default:
        return <MailIcon size={16} />;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPseudonym(true);
    
    try {
      // Update profile in the database
      const { error } = await supabase.from('user_profiles').update({
        first_name: firstNameInput || null,
        last_name: lastNameInput || null,
        linkedin_url: linkedinInput || null,
        github_url: githubInput || null,
        pseudonym: pseudonymInput || null
      }).eq('id', userProfile.id);
      
      if (error) throw error;
      
      // Update local state
      setUserProfile({
        ...userProfile,
        first_name: firstNameInput,
        last_name: lastNameInput,
        linkedin_url: linkedinInput,
        github_url: githubInput,
        pseudonym: pseudonymInput
      });
      
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPseudonym(false);
    }
  };

  const handleAddSystemAuthor = async (author: Omit<SystemAuthorType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAuthor = await SystemAuthorApi.saveSystemAuthor(author);
      setSystemAuthors(prev => [...prev, newAuthor]);
      
      toast({
        title: "Success",
        description: "System author added successfully"
      });
    } catch (error) {
      console.error("Error adding system author:", error);
      toast({
        title: "Error",
        description: "Failed to add system author",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleDeleteSystemAuthor = async (id: string) => {
    try {
      await SystemAuthorApi.deleteSystemAuthor(id);
      setSystemAuthors(prev => prev.filter(author => author.id !== id));
      
      toast({
        title: "Success",
        description: "System author deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting system author:", error);
      toast({
        title: "Error",
        description: "Failed to delete system author",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 max-w-[800px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="team">Team & Authors</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Settings</CardTitle>
              <CardDescription>
                Manage your personal account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {/* Profile Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-muted">
                        {userProfile?.avatarUrl ? (
                          <img 
                            src={userProfile.avatarUrl} 
                            alt={userProfile.username || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10">
                            <User size={32} className="text-primary" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">
                          {userProfile?.first_name && userProfile?.last_name 
                            ? `${userProfile.first_name} ${userProfile.last_name}`
                            : userProfile?.username || 'User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                        {userProfile?.pseudonym && (
                          <p className="text-sm text-muted-foreground">Writing as: {userProfile.pseudonym}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Profile Details</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="Enter your first name"
                            value={firstNameInput}
                            onChange={(e) => setFirstNameInput(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Enter your last name"
                            value={lastNameInput}
                            onChange={(e) => setLastNameInput(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          disabled
                        />
                        <p className="text-sm text-muted-foreground">
                          Email can be changed in the account security section below.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pseudonym">Pseudonym</Label>
                        <Input
                          id="pseudonym"
                          placeholder="Enter your writing pseudonym"
                          value={pseudonymInput}
                          onChange={(e) => setPseudonymInput(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          This name will be used for your published content. Leave empty to use your real name.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <div className="relative">
                          <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/in/username"
                            value={linkedinInput}
                            onChange={(e) => setLinkedinInput(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile</Label>
                        <div className="relative">
                          <Input
                            id="github"
                            placeholder="https://github.com/username"
                            value={githubInput}
                            onChange={(e) => setGithubInput(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="gap-2">
                        {isUpdatingPseudonym ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Username Update */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Update Username</h3>
                    <form onSubmit={handleUpdateUsername} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter your username"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          disabled={isUpdatingUsername}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isUpdatingUsername}
                        className="gap-2"
                      >
                        {isUpdatingUsername ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Username
                          </>
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Email Update - Only for email/password accounts, not for OAuth */}
                  {(!userProfile?.providers || userProfile.providers.length === 0) && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Update Email</h3>
                      <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              disabled={isUpdatingEmail}
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isUpdatingEmail}
                        >
                          {isUpdatingEmail ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Email"
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          You will receive a confirmation email to verify the change.
                        </p>
                      </form>
                    </div>
                  )}

                  {/* Password Update - Only for email/password accounts, not for OAuth */}
                  {(!userProfile?.providers || userProfile.providers.length === 0) && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Update Password</h3>
                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="Enter your new password"
                              className="pl-10"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isUpdatingPassword}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Confirm your new password"
                              className="pl-10"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isUpdatingPassword}
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Danger Zone */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 text-destructive flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Danger Zone
                    </h3>
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Delete Account</AlertTitle>
                      <AlertDescription>
                        This action permanently deletes your account and all associated data. This action cannot be undone.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">
                          Type "DELETE" to confirm
                        </Label>
                        <Input
                          id="delete-confirm"
                          placeholder="DELETE"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          disabled={isDeleting}
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount} 
                        disabled={isDeleting || deleteConfirmText !== "DELETE"}
                        className="gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting Account...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
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
              <CardTitle className="text-xl">Team & Author Management</CardTitle>
              <CardDescription>
                Manage team members, access permissions, and system authors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Members Section */}
              <div>
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
                    <div className="p-4 border-t">
                      <PaginationControls
                        currentPage={currentMembersPage}
                        totalPages={totalMembersPages}
                        onPageChange={setCurrentMembersPage}
                        itemsPerPage={membersPerPage}
                        onItemsPerPageChange={(value) => {
                          setMembersPerPage(value);
                          setCurrentMembersPage(1); // Reset to first page when changing items per page
                        }}
                        pageSizeOptions={[5, 10, 20, 50]}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Authors Section */}
              <div className="border-t pt-6">
                <AuthorsSection
                  teamMembers={teamMembers.map(member => ({
                    ...member,
                    pseudonym: null, // This would come from the user_profiles table
                  }))}
                  systemAuthors={systemAuthors}
                  isLoadingAuthors={isLoadingAuthors}
                  onAddSystemAuthor={handleAddSystemAuthor}
                  onDeleteSystemAuthor={handleDeleteSystemAuthor}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Billing & Subscription</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Manage your plan, invoices, and payment methods
                <Button variant="link" className="h-auto p-0" asChild>
                  <a href="/pricing" className="text-primary">View full pricing details →</a>
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`bg-muted/50 relative ${billingData.currentPlan === "free" ? "border-2 border-primary" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-medium">Free Plan</h4>
                          <p className="text-2xl font-bold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                          <p className="text-sm text-muted-foreground mt-1">Basic features for individuals</p>
                        </div>
                        {billingData.currentPlan === "free" && (
                          <Badge className="bg-primary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-3 mt-6">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">1 user</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">1 workspace</span>
                        </div>
                      </div>
                      
                      {billingData.currentPlan !== "free" && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-6" 
                          onClick={handleUpgradePlan}
                        >
                          Downgrade to Free
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={`bg-muted/50 relative ${billingData.currentPlan === "pro" ? "border-2 border-primary" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-medium">Pro Plan</h4>
                          <p className="text-2xl font-bold mt-2">$5<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                          <p className="text-sm text-muted-foreground mt-1">Enhanced features for teams</p>
                        </div>
                        {billingData.currentPlan === "pro" && (
                          <Badge className="bg-primary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-3 mt-6">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">3 users included ($1/additional user)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">1 workspace ($5/additional)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">Community features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">System authors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-primary" />
                          <span className="text-sm">Content approval flow</span>
                        </div>
                      </div>
                      
                      {billingData.currentPlan !== "pro" && (
                        <Button 
                          className="w-full mt-6" 
                          onClick={handleUpgradePlan}
                        >
                          <Rocket size={16} className="mr-2" />
                          Upgrade to Pro
                        </Button>
                      )}
                    </CardContent>
                  </Card>
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
                    <div className="p-4 border-t">
                      <PaginationControls
                        currentPage={currentInvoicesPage}
                        totalPages={totalInvoicesPages}
                        onPageChange={setCurrentInvoicesPage}
                        itemsPerPage={invoicesPerPage}
                        onItemsPerPageChange={(value) => {
                          setInvoicesPerPage(value);
                          setCurrentInvoicesPage(1); // Reset to first page when changing items per page
                        }}
                        pageSizeOptions={[5, 10, 20, 50]}
                      />
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

