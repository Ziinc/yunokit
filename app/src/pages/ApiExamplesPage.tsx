import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { useNullableState } from "@/hooks/useNullableState";
// Use Tailwind utilities directly; remove css-constants

export const ApiExamplesPage = () => {
  const [copied, setCopied] = useNullableState<string>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: "Copied to clipboard",
      description: "The code example has been copied to your clipboard",
    });
    setTimeout(() => setCopied(null), 2000);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Client Setup</CardTitle>
            <CardDescription>
              Initialize the Supabase client to interact with your API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-md bg-muted p-4">
              <pre className="font-mono text-sm overflow-x-auto">
                <code>{`import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)`}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className={`absolute top-2 right-2 h-8 w-8`}
                onClick={() => copyToClipboard(`import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)`, "setup")}
              >
                {copied === "setup" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Community API Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Code className="h-5 w-5" />
              Community API
            </CardTitle>
            <CardDescription>
              Interact with community features like forum posts, comments, and chat
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="posts">
              <div className="px-6 pt-2">
                <TabsList className={`grid grid-cols-3 mb-4`}>
                  <TabsTrigger value="posts">Forum Posts</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="posts" className="mt-0">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-6`}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Get Forum Posts</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Get forum posts with optional sorting
const getForumPosts = async (sort = 'new') => {
  let query = supabase
    .from('forum_posts')
    .select(\`
      id,
      title,
      content,
      created_at,
      updated_at,
      user_id,
      users (username, avatar_url),
      upvotes,
      downvotes,
      comment_count
    \`)
  
  switch (sort) {
    case 'hot':
      query = query.order('upvotes', { ascending: false })
      break
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'top':
      query = query.order('comment_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching forum posts:', error)
    return null
  }
  
  return data
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Get forum posts with optional sorting
const getForumPosts = async (sort = 'new') => {
  let query = supabase
    .from('forum_posts')
    .select(\`
      id,
      title,
      content,
      created_at,
      updated_at,
      user_id,
      users (username, avatar_url),
      upvotes,
      downvotes,
      comment_count
    \`)
  
  switch (sort) {
    case 'hot':
      query = query.order('upvotes', { ascending: false })
      break
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'top':
      query = query.order('comment_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching forum posts:', error)
    return null
  }
  
  return data
}`, "get-posts")}
                      >
                        {copied === "get-posts" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>

                    <h3 className="text-lg font-medium">Create Forum Post</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Create a new forum post
const createForumPost = async (postData) => {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([{
      title: postData.title,
      content: postData.content,
      user_id: postData.userId,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0
    }])
    .select()
  
  if (error) {
    console.error('Error creating forum post:', error)
    return null
  }
  
  return data[0]
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Create a new forum post
const createForumPost = async (postData) => {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([{
      title: postData.title,
      content: postData.content,
      user_id: postData.userId,
      upvotes: 0,
      downvotes: 0,
      comment_count: 0
    }])
    .select()
  
  if (error) {
    console.error('Error creating forum post:', error)
    return null
  }
  
  return data[0]
}`, "create-post")}
                      >
                        {copied === "create-post" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Example Response</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{JSON.stringify([{
                          id: "123e4567-e89b-12d3-a456-426614174000",
                          title: "Getting Started with Community Features",
                          content: "This is a markdown content explaining community features...",
                          created_at: "2023-09-15T10:30:00Z",
                          updated_at: "2023-09-15T10:30:00Z",
                          user_id: "user-uuid-123",
                          users: {
                            username: "sarah_dev",
                            avatar_url: "https://example.com/avatar.png"
                          },
                          upvotes: 25,
                          downvotes: 2,
                          comment_count: 8
                        }], null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-0">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-6`}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Get Comments for a Post</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Get comments for a specific post
const getCommentsForPost = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(\`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      users (username, avatar_url),
      parent_id,
      upvotes,
      downvotes,
      is_hidden,
      reports_count
    \`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return null
  }
  
  // Organize comments into a tree structure
  const commentMap = {}
  const rootComments = []
  
  data.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] }
  })
  
  data.forEach(comment => {
    if (comment.parent_id) {
      commentMap[comment.parent_id]?.replies.push(commentMap[comment.id])
    } else {
      rootComments.push(commentMap[comment.id])
    }
  })
  
  return rootComments
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Get comments for a specific post
const getCommentsForPost = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(\`
      id,
      content,
      created_at,
      updated_at,
      user_id,
      users (username, avatar_url),
      parent_id,
      upvotes,
      downvotes,
      is_hidden,
      reports_count
    \`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return null
  }
  
  // Organize comments into a tree structure
  const commentMap = {}
  const rootComments = []
  
  data.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] }
  })
  
  data.forEach(comment => {
    if (comment.parent_id) {
      commentMap[comment.parent_id]?.replies.push(commentMap[comment.id])
    } else {
      rootComments.push(commentMap[comment.id])
    }
  })
  
  return rootComments
}`, "get-comments")}
                      >
                        {copied === "get-comments" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>

                    <h3 className="text-lg font-medium">Add a Comment</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Add a new comment to a post
const addComment = async (commentData) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      content: commentData.content,
      post_id: commentData.postId,
      user_id: commentData.userId,
      parent_id: commentData.parentId || null, // Optional parent for replies
      upvotes: 0,
      downvotes: 0,
      is_hidden: false,
      reports_count: 0
    }])
    .select()
  
  if (error) {
    console.error('Error adding comment:', error)
    return null
  }
  
  // If this is a top-level comment, update the post's comment count
  if (!commentData.parentId) {
    await supabase
      .rpc('increment_comment_count', { post_id: commentData.postId })
  }
  
  return data[0]
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Add a new comment to a post
const addComment = async (commentData) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      content: commentData.content,
      post_id: commentData.postId,
      user_id: commentData.userId,
      parent_id: commentData.parentId || null, // Optional parent for replies
      upvotes: 0,
      downvotes: 0,
      is_hidden: false,
      reports_count: 0
    }])
    .select()
  
  if (error) {
    console.error('Error adding comment:', error)
    return null
  }
  
  // If this is a top-level comment, update the post's comment count
  if (!commentData.parentId) {
    await supabase
      .rpc('increment_comment_count', { post_id: commentData.postId })
  }
  
  return data[0]
}`, "add-comment")}
                      >
                        {copied === "add-comment" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Example Response</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{JSON.stringify([{
                          id: "456e7890-f12a-34b5-c678-901234567890",
                          content: "This is a great post! I love the community features.",
                          created_at: "2023-09-15T11:15:00Z",
                          updated_at: "2023-09-15T11:15:00Z",
                          user_id: "user-uuid-456",
                          users: {
                            username: "dev_john",
                            avatar_url: "https://example.com/john-avatar.png"
                          },
                          parent_id: null,
                          upvotes: 5,
                          downvotes: 0,
                          is_hidden: false,
                          reports_count: 0,
                          replies: [{
                            id: "789a0123-b45c-67d8-e901-234567890abc",
                            content: "I agree, the community features are amazing!",
                            created_at: "2023-09-15T12:30:00Z",
                            updated_at: "2023-09-15T12:30:00Z",
                            user_id: "user-uuid-789",
                            users: {
                              username: "emma_tech",
                              avatar_url: "https://example.com/emma-avatar.png"
                            },
                            parent_id: "456e7890-f12a-34b5-c678-901234567890",
                            upvotes: 2,
                            downvotes: 0,
                            is_hidden: false,
                            reports_count: 0,
                            replies: []
                          }]
                        }], null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-6`}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Get Chat Messages</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Get chat messages for a conversation
const getChatMessages = async (conversationId, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(\`
      id,
      content,
      created_at,
      user_id,
      users (username, avatar_url),
      is_flagged
    \`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching chat messages:', error)
    return null
  }
  
  return data.reverse() // Return in chronological order
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Get chat messages for a conversation
const getChatMessages = async (conversationId, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(\`
      id,
      content,
      created_at,
      user_id,
      users (username, avatar_url),
      is_flagged
    \`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching chat messages:', error)
    return null
  }
  
  return data.reverse() // Return in chronological order
}`, "get-chats")}
                      >
                        {copied === "get-chats" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>

                    <h3 className="text-lg font-medium">Send Chat Message</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Send a new chat message
const sendChatMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      content: messageData.content,
      conversation_id: messageData.conversationId,
      user_id: messageData.userId,
      is_flagged: false
    }])
    .select()
  
  if (error) {
    console.error('Error sending chat message:', error)
    return null
  }
  
  return data[0]
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Send a new chat message
const sendChatMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      content: messageData.content,
      conversation_id: messageData.conversationId,
      user_id: messageData.userId,
      is_flagged: false
    }])
    .select()
  
  if (error) {
    console.error('Error sending chat message:', error)
    return null
  }
  
  return data[0]
}`, "send-chat")}
                      >
                        {copied === "send-chat" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>

                    <h3 className="text-lg font-medium">Set Up Real-time Chat</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Subscribe to real-time chat messages
const subscribeToChat = (conversationId, callback) => {
  return supabase
    .channel('chat-messages')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages',
      filter: \`conversation_id=eq.\${conversationId}\`
    }, payload => {
      callback(payload.new)
    })
    .subscribe()
}

// Example usage:
const subscription = subscribeToChat('conversation-123', (newMessage) => {
  // Update your UI with the new message
})

// To unsubscribe when component unmounts:
// subscription.unsubscribe()`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Subscribe to real-time chat messages
const subscribeToChat = (conversationId, callback) => {
  return supabase
    .channel('chat-messages')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages',
      filter: \`conversation_id=eq.\${conversationId}\`
    }, payload => {
      callback(payload.new)
    })
    .subscribe()
}

// Example usage:
const subscription = subscribeToChat('conversation-123', (newMessage) => {
  // Update your UI with the new message
})

// To unsubscribe when component unmounts:
// subscription.unsubscribe()`, "realtime-chat")}
                      >
                        {copied === "realtime-chat" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Example Response</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{JSON.stringify([{
                          id: "abc1234d-5e6f-78g9-h0i1-j2345k6l7m8n",
                          content: "Hey there! How's the new feature coming along?",
                          created_at: "2023-09-15T14:30:00Z",
                          user_id: "user-uuid-abc",
                          users: {
                            username: "alex_dev",
                            avatar_url: "https://example.com/alex-avatar.png"
                          },
                          is_flagged: false
                        }, {
                          id: "def5678g-9h0i-12j3-k4l5-m6789n0o1p2q",
                          content: "It's going great! Just finishing up the chat implementation",
                          created_at: "2023-09-15T14:32:00Z",
                          user_id: "user-uuid-def",
                          users: {
                            username: "maria_code",
                            avatar_url: "https://example.com/maria-avatar.png"
                          },
                          is_flagged: false
                        }], null, 2)}</code>
                      </pre>
                    </div>

                    <h3 className="text-lg font-medium">Creating Chat Conversations</h3>
                    <div className="relative rounded-md bg-muted p-4">
                      <pre className="font-mono text-sm overflow-x-auto">
                        <code>{`// Create a new chat conversation
const createConversation = async (conversationData) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      name: conversationData.name, // For group chats
      is_group: conversationData.isGroup || false,
      created_by: conversationData.userId
    }])
    .select()
  
  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  
  // Add participants to the conversation
  const participants = conversationData.participants.map(userId => ({
    conversation_id: data[0].id,
    user_id: userId
  }))
  
  // Also add the creator if not already included
  if (!conversationData.participants.includes(conversationData.userId)) {
    participants.push({
      conversation_id: data[0].id,
      user_id: conversationData.userId
    })
  }
  
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants)
  
  if (participantsError) {
    console.error('Error adding participants:', participantsError)
  }
  
  return data[0]
}`}</code>
                      </pre>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8`}
                        onClick={() => copyToClipboard(`// Create a new chat conversation
const createConversation = async (conversationData) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      name: conversationData.name, // For group chats
      is_group: conversationData.isGroup || false,
      created_by: conversationData.userId
    }])
    .select()
  
  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  
  // Add participants to the conversation
  const participants = conversationData.participants.map(userId => ({
    conversation_id: data[0].id,
    user_id: userId
  }))
  
  // Also add the creator if not already included
  if (!conversationData.participants.includes(conversationData.userId)) {
    participants.push({
      conversation_id: data[0].id,
      user_id: conversationData.userId
    })
  }
  
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants)
  
  if (participantsError) {
    console.error('Error adding participants:', participantsError)
  }
  
  return data[0]
}`, "create-conversation")}
                      >
                        {copied === "create-conversation" ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default ApiExamplesPage;
