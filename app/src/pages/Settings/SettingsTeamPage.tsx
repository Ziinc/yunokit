import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, UserPlus, UserMinus } from "lucide-react";

interface Member {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
}

const SettingsMembersPage: React.FC = () => {
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
        console.error("Failed to fetch members:", error);
        toast({
          title: "Error",
          description: "Failed to load members",
          variant: "destructive"
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
      console.error("Invite member error:", error);
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
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
      console.error("Remove member error:", error);
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <TabsContent value="members" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Members Management</CardTitle>
          <CardDescription>
            Manage your members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Invite New Member */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Invite New Member</h3>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
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
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
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