import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUsername } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  
  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!user) return;
    
    try {
      const { error } = await updateUsername(user.id, username);
      if (error) throw error;
      
      // Update local user state
      if (user) {
        user.username = username;
      }
      
      toast({
        title: "Username updated",
        description: "Your username has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating username",
        description: error.message || "An error occurred while updating your username.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload the avatar to your backend/storage
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload avatar');
      
      const { avatarUrl } = await response.json();
      
      // Update local user state
      if (user) {
        user.avatarUrl = avatarUrl;
      }
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message || "An error occurred while updating your avatar.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/sign-in');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  // If not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        </div>
        
        <Card className="sm:mx-auto sm:max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/sign-in')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={user.avatarUrl || ""} 
                    alt={user.username} 
                  />
                  <AvatarFallback className="text-3xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.username}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera size={16} />
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Button onClick={handleUpdateUsername}>Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
