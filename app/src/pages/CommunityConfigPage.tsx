import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getConfig, updateConfig } from '@/lib/api/CommunityConfigApi';

interface CommunityConfig {
  general: {
    community_name: string;
    description: string;
    welcome_message: string;
    allow_registration: boolean;
  };
  moderation: {
    auto_moderation: boolean;
    profanity_filter: boolean;
    spam_detection: boolean;
    require_email_verification: boolean;
  };
  permissions: {
    allow_user_posts: boolean;
    allow_user_comments: boolean;
    allow_file_uploads: boolean;
    max_upload_size: number;
  };
  notifications: {
    email_notifications: boolean;
    new_user_notifications: boolean;
    content_report_notifications: boolean;
  };
}

const CommunityConfigPage: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<CommunityConfig>({
    general: {
      community_name: '',
      description: '',
      welcome_message: '',
      allow_registration: true,
    },
    moderation: {
      auto_moderation: true,
      profanity_filter: true,
      spam_detection: true,
      require_email_verification: true,
    },
    permissions: {
      allow_user_posts: true,
      allow_user_comments: true,
      allow_file_uploads: false,
      max_upload_size: 5,
    },
    notifications: {
      email_notifications: true,
      new_user_notifications: true,
      content_report_notifications: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getConfig();
        // Since the API returns different format, we'll merge with existing config structure
        if (data && typeof data === 'object') {
          setConfig(prev => ({ ...prev, ...data as Partial<CommunityConfig> }));
        }
      } catch (error) {
        console.error("Error loading config:", error);
        toast({
          title: "Error",
          description: "Failed to load community configuration.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateConfig(config);
      
      toast({
        title: "Configuration saved",
        description: "Community configuration has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfigField = (section: keyof CommunityConfig, field: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Basic community information and registration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="community-name">Community Name</Label>
            <Input
              id="community-name"
              value={config.general.community_name}
              onChange={(e) => updateConfigField('general', 'community_name', e.target.value)}
              placeholder="Enter community name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.general.description}
              onChange={(e) => updateConfigField('general', 'description', e.target.value)}
              placeholder="Describe your community"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={config.general.welcome_message}
              onChange={(e) => updateConfigField('general', 'welcome_message', e.target.value)}
              placeholder="Message shown to new users"
              rows={2}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register for the community
              </p>
            </div>
            <Switch
              checked={config.general.allow_registration}
              onCheckedChange={(checked) => updateConfigField('general', 'allow_registration', checked)}
            />
          </div>
          
        </CardContent>
      </Card>

      {/* Moderation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Settings</CardTitle>
          <CardDescription>
            Automated moderation and content filtering options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Enable automated content moderation
              </p>
            </div>
            <Switch
              checked={config.moderation.auto_moderation}
              onCheckedChange={(checked) => updateConfigField('moderation', 'auto_moderation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profanity Filter</Label>
              <p className="text-sm text-muted-foreground">
                Automatically filter inappropriate language
              </p>
            </div>
            <Switch
              checked={config.moderation.profanity_filter}
              onCheckedChange={(checked) => updateConfigField('moderation', 'profanity_filter', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Spam Detection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and flag spam content
              </p>
            </div>
            <Switch
              checked={config.moderation.spam_detection}
              onCheckedChange={(checked) => updateConfigField('moderation', 'spam_detection', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Require email verification for new users
              </p>
            </div>
            <Switch
              checked={config.moderation.require_email_verification}
              onCheckedChange={(checked) => updateConfigField('moderation', 'require_email_verification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Control what users can do in your community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow User Posts</Label>
              <p className="text-sm text-muted-foreground">
                Users can create forum posts
              </p>
            </div>
            <Switch
              checked={config.permissions.allow_user_posts}
              onCheckedChange={(checked) => updateConfigField('permissions', 'allow_user_posts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Comments</Label>
              <p className="text-sm text-muted-foreground">
                Users can comment on content
              </p>
            </div>
            <Switch
              checked={config.permissions.allow_user_comments}
              onCheckedChange={(checked) => updateConfigField('permissions', 'allow_user_comments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow File Uploads</Label>
              <p className="text-sm text-muted-foreground">
                Users can upload files and images
              </p>
            </div>
            <Switch
              checked={config.permissions.allow_file_uploads}
              onCheckedChange={(checked) => updateConfigField('permissions', 'allow_file_uploads', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-upload-size">Max Upload Size (MB)</Label>
            <Select
              value={config.permissions.max_upload_size.toString()}
              onValueChange={(value) => updateConfigField('permissions', 'max_upload_size', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 MB</SelectItem>
                <SelectItem value="5">5 MB</SelectItem>
                <SelectItem value="10">10 MB</SelectItem>
                <SelectItem value="25">25 MB</SelectItem>
                <SelectItem value="50">50 MB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure email notifications for admins and moderators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications to administrators
              </p>
            </div>
            <Switch
              checked={config.notifications.email_notifications}
              onCheckedChange={(checked) => updateConfigField('notifications', 'email_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New User Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify when new users register
              </p>
            </div>
            <Switch
              checked={config.notifications.new_user_notifications}
              onCheckedChange={(checked) => updateConfigField('notifications', 'new_user_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Report Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify when content is reported
              </p>
            </div>
            <Switch
              checked={config.notifications.content_report_notifications}
              onCheckedChange={(checked) => updateConfigField('notifications', 'content_report_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default CommunityConfigPage;
