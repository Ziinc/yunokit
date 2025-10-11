
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Pencil, Shield, Trash, Users } from "lucide-react";
import { ChatMessage, ChatChannel } from "@/types/comments";
import { ModerationSearchBar } from "@/components/ui/moderation-search-bar";
import { StatusBadge } from "@/components/ui/status-badge";

interface ChatTabProps {
  messages: ChatMessage[];
  channels: ChatChannel[];
  messageSearchQuery: string;
  setMessageSearchQuery: (query: string) => void;
  handleDeleteMessage: (messageId: string) => void;
  handleChangeMessageStatus: (messageId: string, status: "visible" | "hidden" | "flagged") => void;
  formatDate: (dateString: string) => string;
}

const ChatTab = ({
  messages,
  channels,
  messageSearchQuery,
  setMessageSearchQuery,
  handleDeleteMessage,
  handleChangeMessageStatus,
  formatDate
}: ChatTabProps) => {
  const [currentView, setCurrentView] = useState<string>("messages");
  const [currentFilter, setCurrentFilter] = useState("all");

  const effectiveFilteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) || 
      message.author.name.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      message.channelName.toLowerCase().includes(messageSearchQuery.toLowerCase());
      
    if (currentFilter === "all") return matchesSearch;
    return matchesSearch && message.channelId === currentFilter;
  });

  return (
    <>
      <Tabs value={currentView} onValueChange={setCurrentView} className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages" className="flex items-center gap-1.5">
            <MessageSquare size={16} />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-1.5">
            <Users size={16} />
            <span>Channels</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Messages</CardTitle>
              <CardDescription>
                Moderate chat messages across all channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModerationSearchBar
                searchQuery={messageSearchQuery}
                onSearchChange={setMessageSearchQuery}
                searchPlaceholder="Search messages..."
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                filterPlaceholder="Select channel"
                filterOptions={[
                  { value: "all", label: "All Channels" },
                  ...channels.map(channel => ({ value: channel.id, label: channel.name }))
                ]}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Message</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {effectiveFilteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No messages found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    effectiveFilteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="line-clamp-2 text-sm">{message.content}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{message.channelName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                              <img 
                                src={message.author.avatar} 
                                alt={message.author.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="text-sm">{message.author.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={message.status} />
                        </TableCell>
                        <TableCell>
                          {formatDate(message.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Select
                              value={message.status}
                              onValueChange={(value: "visible" | "hidden" | "flagged") => 
                                handleChangeMessageStatus(message.id, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="visible">Visible</SelectItem>
                                <SelectItem value="hidden">Hidden</SelectItem>
                                <SelectItem value="flagged">Flagged</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => handleDeleteMessage(message.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:text-destructive"
                            >
                              <Trash size={16} />
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
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Channels</CardTitle>
              <CardDescription>
                Manage chat channels, settings, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button>New Channel</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Channel Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No channels found
                      </TableCell>
                    </TableRow>
                  ) : (
                    channels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{channel.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {channel.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={channel.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MessageSquare size={14} className="mr-1 text-muted-foreground" />
                            {channel.messageCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users size={14} className="mr-1 text-muted-foreground" />
                            {channel.memberCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(channel.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Shield size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:text-destructive"
                            >
                              <Trash size={16} />
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
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ChatTab;
