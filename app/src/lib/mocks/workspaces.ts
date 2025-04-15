import { Workspace } from "../workspaceSchema";

export const mockWorkspaces: Workspace[] = [
  {
    id: "primary",
    name: "Primary Workspace",
    description: "Main workspace for your content",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    userId: "user-1",
    members: [
      {
        id: "member-1",
        userId: "user-1",
        role: "owner",
        email: "owner@example.com",
        name: "John Owner"
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Team",
    description: "Marketing team workspace",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    userId: "user-1",
    members: [
      {
        id: "member-2",
        userId: "user-1",
        role: "owner",
        email: "owner@example.com",
        name: "John Owner"
      },
      {
        id: "member-3",
        userId: "user-2",
        role: "member",
        email: "marketing@example.com",
        name: "Marketing User"
      }
    ]
  },
  {
    id: "development",
    name: "Development Team",
    description: "Development team workspace",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    userId: "user-1",
    members: [
      {
        id: "member-4",
        userId: "user-1",
        role: "owner",
        email: "owner@example.com",
        name: "John Owner"
      },
      {
        id: "member-5",
        userId: "user-3",
        role: "admin",
        email: "dev.lead@example.com",
        name: "Dev Lead"
      }
    ]
  }
];