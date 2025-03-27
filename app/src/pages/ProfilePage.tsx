
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateUsername } from "@/lib/supabase";
import { 
  Github, 
  Mail, 
  Camera, 
  LogOut,
  User,
  Box,
  Calendar,
  FileText,
  CheckCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from "recharts";

// Generate mock activity data for a year
const generateMockActivityData = () => {
  const data = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const startDate = new Date(currentYear, 0, 1); // Jan 1st of current year
  
  // Create activity for every week
  for (let week = 0; week < 52; week++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (week * 7));
    
    // Random activity level (0-4)
    const level = Math.floor(Math.random() * 5);
    
    data.push({
      date: date.toISOString().split('T')[0],
      level,
      month: date.toLocaleString('default', { month: 'short' })
    });
  }
  
  return data;
};

// Mock recent activities
const mockRecentActivities = [
  { id: 1, type: 'edit', title: 'Blog Post: Getting Started with APIs', date: '2023-08-15T14:30:00Z' },
  { id: 2, type: 'publish', title: 'Product Page: New Headphones', date: '2023-08-12T10:15:00Z' },
  { id: 3, type: 'edit', title: 'Landing Page Copy', date: '2023-08-10T16:45:00Z' },
  { id: 4, type: 'publish', title: 'About Us Section', date: '2023-08-05T11:30:00Z' },
  { id: 5, type: 'edit', title: 'FAQ Page Content', date: '2023-08-01T09:20:00Z' },
];

const ActivityChart = () => {
  const [activityData] = useState(generateMockActivityData());
  
  // Get unique months for the X-axis
  const months = Array.from(new Set(activityData.map(d => d.month)));
  
  // Custom tooltip for the activity chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm text-xs">
          <p className="font-medium">{data.date}</p>
          <p>{data.level} activities</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Activity Contributions
        </CardTitle>
        <CardDescription>
          Your content creation and editing activity over the past year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                ticks={months}
                tick={{ fontSize: 10 }}
                height={20}
              />
              <YAxis hide domain={[0, 4]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="level"
                shape={(props) => {
                  const { x, y, width, height, value } = props;
                  const opacity = 0.2 + (value * 0.2); // 0.2, 0.4, 0.6, 0.8, 1.0
                  return (
                    <Rectangle
                      x={x}
                      y={y}
                      width={width * 0.8}
                      height={height}
                      rx={2}
                      fill="var(--primary)"
                      fillOpacity={opacity}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-20"></div>
            <span>Less</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-40"></div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-60"></div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-80"></div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-100"></div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your recent content editing and publishing activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentActivities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className={`mt-0.5 p-1.5 rounded-full ${activity.type === 'publish' ? 'bg-green-100' : 'bg-blue-100'}`}>
                {activity.type === 'publish' ? (
                  <CheckCircle className="h-4 w-4 text-green-700" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-700" />
                )}
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs capitalize text-muted-foreground">
                    {activity.type === 'publish' ? 'Published' : 'Edited'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString(undefined, { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user, signOut, updateUser } = useAuth();
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
      
      updateUser({ username });
      
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

  const selectAvatar = (provider: string) => {
    if (!user) return;
    
    updateUser({ selectedAvatarProvider: provider });
    
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated.",
    });
  };

  const OAuthProviderCard = ({ provider }: { provider: any }) => {
    let icon = <User />;
    let providerName = provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1);
    
    if (provider.provider === 'github') {
      icon = <Github />;
      providerName = 'GitHub';
    } else if (provider.provider === 'google') {
      icon = <Mail />;
      providerName = 'Google';
    } else if (provider.provider === 'azure') {
      icon = <Box />;
      providerName = 'Microsoft';
    }
    
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {provider.avatarUrl ? (
                  <AvatarImage src={provider.avatarUrl} alt={providerName} />
                ) : (
                  <AvatarFallback className="bg-muted">
                    {icon}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{providerName}</h3>
                <p className="text-sm text-muted-foreground">
                  Connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={user?.selectedAvatarProvider === provider.provider ? "bg-primary text-primary-foreground" : ""}
                onClick={() => selectAvatar(provider.provider)}
              >
                Use Avatar
              </Button>
              <Button variant="outline" size="sm" disabled>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
            <CardDescription>
              You need to sign in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.href = "/signin"} className="w-full">
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
        <Button variant="outline" onClick={signOut} className="gap-2">
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
                    src={user.providers.find(p => p.provider === user.selectedAvatarProvider)?.avatarUrl || user.avatarUrl || ""} 
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera size={16} />
                  Change Avatar
                </Button>
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
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Connected Accounts</h3>
            <div className="space-y-3">
              {user.providers.map((provider) => (
                <OAuthProviderCard key={provider.provider} provider={provider} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <ActivityChart />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
