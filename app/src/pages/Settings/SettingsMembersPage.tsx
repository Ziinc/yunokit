import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Destructive UI wrappers removed; use base Button with destructive variant
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { notifyError } from "@/lib/errors";

interface Member {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
}

const SettingsMembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockMembers = [
          { id: "1", email: "john@example.com", role: "Admin", status: "active" as const },
          { id: "2", email: "jane@example.com", role: "Member", status: "active" as const },
          { id: "3", email: "bob@example.com", role: "Member", status: "pending" as const }
        ];
        setMembers(mockMembers);
      } catch (error) {
        notifyError(toast, error, {
          title: "Error",
          fallback: "Failed to load members",
          prefix: "Failed to fetch members",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [toast]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMemberEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail.trim())) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInviting(true);

      // TODO: Replace with actual API call
      const newMember = {
        id: String(members.length + 1),
        email: newMemberEmail,
        role: "Member",
        status: "pending" as const
      };

      setMembers([...members, newMember]);
      setNewMemberEmail("");

      toast({
        title: "Invitation sent",
        description: "Member has been invited successfully"
      });
    } catch (error) {
      notifyError(toast, error, {
        title: "Failed to send invitation",
        fallback: "Please try again later",
        prefix: "Invite member error",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // TODO: Replace with actual API call
      setMembers(members.filter(m => m.id !== memberId));

      toast({
        title: "Member removed",
        description: "Member has been removed successfully"
      });
    } catch (error) {
      notifyError(toast, error, {
        title: "Failed to remove member",
        fallback: "Please try again later",
        prefix: "Remove member error",
      });
    }
  };

  return (
    <TabsContent value="members" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workspace Members Management</CardTitle>
          <CardDescription>
            Manage your workspace members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex-center-justify py-8">
              <Loader2 className="icon-lg text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Members List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Members</h3>
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {member.status === "pending" ? "Pending" : "Active"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="icon-sm" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Invite New Member */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Invite New Member</h3>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-form">
                    <Label htmlFor="member-email">Email Address</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      disabled={isInviting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isInviting}
                    className="gap-2"
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="icon-sm animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <UserPlus className="icon-sm" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsMembersPage; 
