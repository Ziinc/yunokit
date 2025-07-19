import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, ChatChannel } from "@/types/comments";
import ChatTab from "@/components/Comments/ChatTab";

const ChatManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Mock data for now - these would come from API calls
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        // const messagesResponse = await getChatMessages();
        // const channelsResponse = await getChatChannels();
        
        // Mock data for now
        setMessages([
          {
            id: "1",
            content: "Hello everyone! Welcome to the general chat.",
            status: "visible",
            createdAt: new Date().toISOString(),
            channelId: "general",
            channelName: "General",
            author: {
              id: "user1",
              name: "John Doe",
              avatar: "/placeholder.svg",
              status: "active"
            }
          },
          {
            id: "2", 
            content: "This message contains inappropriate content",
            status: "flagged",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            channelId: "general",
            channelName: "General",
            author: {
              id: "user2",
              name: "Jane Smith",
              avatar: "/placeholder.svg",
              status: "restricted"
            }
          }
        ]);
        
        setChannels([
          {
            id: "general",
            name: "General",
            description: "General discussion for all members",
            status: "active",
            messageCount: 234,
            memberCount: 45,
            createdAt: new Date(Date.now() - 2592000000).toISOString()
          },
          {
            id: "support",
            name: "Support",
            description: "Get help from our community",
            status: "active",
            messageCount: 89,
            memberCount: 23,
            createdAt: new Date(Date.now() - 1296000000).toISOString()
          }
        ]);
      } catch (error) {
        console.error("Error loading chat data:", error);
        toast({
          title: "Error",
          description: "Failed to load chat data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // TODO: API call to delete message
      const updatedMessages = messages.filter(message => message.id !== messageId);
      setMessages(updatedMessages);
      
      toast({
        title: "Message deleted",
        description: "The message has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Action failed",
        description: "There was an error deleting the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangeMessageStatus = async (messageId: string, status: "visible" | "hidden" | "flagged") => {
    try {
      // TODO: API call to update message status
      const updatedMessages = messages.map(message =>
        message.id === messageId ? { ...message, status } : message
      );
      setMessages(updatedMessages);
      
      toast({
        title: "Message updated",
        description: `Message status changed to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Action failed",
        description: "There was an error updating the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChatTab
          messages={messages}
          channels={channels}
          messageSearchQuery={messageSearchQuery}
          setMessageSearchQuery={setMessageSearchQuery}
          handleDeleteMessage={handleDeleteMessage}
          handleChangeMessageStatus={handleChangeMessageStatus}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default ChatManagementPage; 