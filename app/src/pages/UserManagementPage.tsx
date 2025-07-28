import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMinus, Shield, Search, Loader2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listBans, banUser } from '@/lib/api/ModerationApi';

interface BanRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  reason: string;
  banned_at: string;
  banned_by: string;
  status: 'active' | 'lifted';
}

interface CommunityUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'banned' | 'restricted';
  posts_count: number;
  comments_count: number;
  reports_count: number;
  joined_at: string;
}

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [bans, setBans] = useState<BanRecord[]>([]);
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await listBans();
        setBans(data || []);
        
        // Mock users data - replace with actual API call
        const mockUsers: CommunityUser[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            status: 'active',
            posts_count: 15,
            comments_count: 42,
            reports_count: 0,
            joined_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'moderator',
            status: 'active',
            posts_count: 8,
            comments_count: 24,
            reports_count: 1,
            joined_at: '2024-02-01T14:30:00Z'
          }
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleBanUser = async (userId: string, reason: string = "Violation of community guidelines") => {
    try {
      await banUser({ user_id: userId, reason });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'banned' as const } : user
      ));
      
      toast({
        title: "User banned",
        description: "The user has been banned from the community.",
      });
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Action failed",
        description: "There was an error banning the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage community members, their roles, and moderation status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.role === "admin" ? "default" : 
                            user.role === "moderator" ? "outline" : 
                            "secondary"
                          }
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.status === "active" ? "default" : 
                            user.status === "banned" ? "destructive" : 
                            "secondary"
                          }
                          className="capitalize"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>{user.posts_count} posts</div>
                          <div>{user.comments_count} comments</div>
                          {user.reports_count > 0 && (
                            <div className="text-destructive">{user.reports_count} reports</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Banned users section */}
      <Card>
        <CardHeader>
          <CardTitle>Banned Users</CardTitle>
          <CardDescription>
            View and manage banned community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Banned By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No banned users found
                  </TableCell>
                </TableRow>
              ) : (
                bans.map((ban) => (
                  <TableRow key={ban.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ban.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ban.user_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{ban.reason}</TableCell>
                    <TableCell>{ban.banned_by}</TableCell>
                    <TableCell>
                      {new Date(ban.banned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={ban.status === "active" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {ban.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Lift Ban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
