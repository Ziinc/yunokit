
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, Flag, MessageCircle, Shield } from "lucide-react";
import { User } from "@/types/comments";

interface UsersTabProps {
  users: User[];
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  handleChangeUserStatus: (userId: string, status: "active" | "banned" | "restricted") => void;
  handleChangeUserRole: (userId: string, role: "user" | "moderator" | "admin") => void;
  formatDate: (dateString: string) => string;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  userSearchQuery,
  setUserSearchQuery,
  handleChangeUserStatus,
  handleChangeUserRole,
  formatDate
}) => {
  const [currentUserTab, setCurrentUserTab] = useState<string>("all");
  
  // Filter users based on search query and current tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      
    if (currentUserTab === "all") return matchesSearch;
    if (currentUserTab === "active") return matchesSearch && user.status === "active";
    if (currentUserTab === "banned") return matchesSearch && user.status === "banned";
    if (currentUserTab === "restricted") return matchesSearch && user.status === "restricted";
    if (currentUserTab === "moderators") return matchesSearch && user.role === "moderator";
    if (currentUserTab === "admins") return matchesSearch && user.role === "admin";
    return matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Community Users</CardTitle>
          <CardDescription>
            Manage user permissions, roles, and moderation status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input 
                placeholder="Search users..." 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            <Select value={currentUserTab} onValueChange={setCurrentUserTab}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="moderators">Moderators</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MessageCircle size={12} className="mr-1" />
                          {user.commentsCount} comments
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Flag size={12} className="mr-1" />
                          {user.reportsCount} reports
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(user.lastActive)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Select
                          value={user.role}
                          onValueChange={(value: "user" | "moderator" | "admin") => 
                            handleChangeUserRole(user.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            const newStatus = user.status === "banned" ? "active" : "banned";
                            handleChangeUserStatus(user.id, newStatus);
                          }}
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 ${user.status === "banned" ? "" : "hover:text-destructive"}`}
                          title={user.status === "banned" ? "Unban user" : "Ban user"}
                        >
                          <Ban size={16} />
                        </Button>
                        <Button
                          onClick={() => {
                            const newStatus = user.status === "restricted" ? "active" : "restricted";
                            handleChangeUserStatus(user.id, newStatus);
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title={user.status === "restricted" ? "Remove restrictions" : "Restrict user"}
                        >
                          <Shield size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UsersTab;
