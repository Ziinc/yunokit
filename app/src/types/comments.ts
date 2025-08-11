
export interface Comment {
  id: string;
  content: string;
  status: "pending" | "spam" | "flagged" | "deleted";
  parentId?: string;
  createdAt: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: "active" | "banned" | "restricted";
  };
  reports?: {
    count: number;
    reasons: string[];
  };
}

export interface Report {
  id: string;
  type: "comment" | "user";
  targetId: string;
  targetName: string;
  reporter: {
    id: string;
    name: string;
  };
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  contentTitle?: string;
}

export interface BannedWord {
  id: string;
  word: string;
  action: "flag" | "delete" | "ban";
  severity: "low" | "medium" | "high";
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  status: "published" | "draft" | "archived" | "flagged";
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  replies: number;
  commentsCount: number; // Mock field for now
  forumId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    status: "active" | "banned" | "restricted";
  };
  tags: string[];
  pinned: boolean;
}

export interface Forum {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  archived_at?: string;
  posts_count?: number;  // Mock field for now
  comments_count?: number; // Mock field for now
  members_count?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  status: "visible" | "hidden" | "flagged";
  createdAt: string;
  channelId: string;
  channelName: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    status: "active" | "banned" | "restricted";
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "banned" | "restricted";
  role: "user" | "moderator" | "admin";
  createdAt: string;
  lastActive: string;
  commentsCount: number;
  reportsCount: number;
  postsCount: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "private";
  messageCount: number;
  memberCount: number;
  createdAt: string;
}
