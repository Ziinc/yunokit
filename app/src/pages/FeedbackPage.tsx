import React, { useState } from "react";
import useSWR from "swr";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import {
  listFeedbackBoards,
  listFeedbackIssues,
  voteOnIssue,
  createFeedbackBoard,
  createFeedbackIssue,
  listTickets,
  createTicket,
  updateTicket,
  addTicketCommentApi,
  triggerExternalIntegration,
} from "@/lib/api/FeedbackApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCommentsByContentItem } from "@/lib/api/CommentsApi";

const FeedbackPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const { data: boards, mutate: mutateBoards } = useSWR(
    workspaceId ? ["boards", workspaceId] : null,
    () => listFeedbackBoards(workspaceId!),
  );

  const { data: tickets, mutate: mutateTickets } = useSWR(
    workspaceId ? ["tickets", workspaceId] : null,
    () => listTickets(workspaceId!),
  );

  const [newBoard, setNewBoard] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const { data: comments } = useSWR(
    expandedIssue ? ["comments", expandedIssue] : null,
    () => getCommentsByContentItem(expandedIssue!),
  );

  const { data: issues, mutate: mutateIssues } = useSWR(
    workspaceId && boards && boards.data?.[0]
      ? ["issues", boards.data[0].id]
      : null,
    () => listFeedbackIssues(boards!.data![0].id, workspaceId!),
  );

  const handleVote = async (issueId: string) => {
    if (!workspaceId) return;
    await voteOnIssue(issueId, workspaceId);
    mutateIssues();
  };

  const handleCreateBoard = async () => {
    if (!workspaceId || !newBoard) return;
    await createFeedbackBoard({ name: newBoard } as any, workspaceId);
    setNewBoard("");
    mutateBoards();
  };

  const handleCreateIssue = async (boardId: string) => {
    if (!workspaceId || !newIssue) return;
    await createFeedbackIssue(
      { board_id: boardId, title: newIssue } as any,
      workspaceId,
    );
    setNewIssue("");
    mutateIssues();
  };

  const handleCreateTicket = async () => {
    if (!workspaceId || !newTicketTitle) return;
    await createTicket(
      { title: newTicketTitle, description: newTicketDesc } as any,
      workspaceId,
    );
    setNewTicketTitle("");
    setNewTicketDesc("");
    mutateTickets();
  };

  const handleLabelChange = async (ticketId: string, labels: string) => {
    if (!workspaceId) return;
    await updateTicket(
      ticketId,
      { labels: labels ? labels.split(",") : [] } as any,
      workspaceId,
    );
    mutateTickets();
  };

  const handleIntegration = async (
    ticketId: string,
    type: "github" | "linear" | "slack",
  ) => {
    if (!workspaceId) return;
    await triggerExternalIntegration(type, { ticketId }, workspaceId);
  };

  return (
    <div className="space-y-6 max-w-full">
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      <div className="flex gap-2">
        <Input
          value={newBoard}
          onChange={(e) => setNewBoard(e.target.value)}
          placeholder="New board name"
        />
        <Button size="sm" onClick={handleCreateBoard}>
          Add Board
        </Button>
      </div>
      {boards?.data?.map((board) => (
        <div key={board.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{board.name}</h2>
          <div className="flex gap-2">
            <Input
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="New feature"
            />
            <Button size="sm" onClick={() => handleCreateIssue(board.id)}>
              Add Feature
            </Button>
          </div>
          {issues?.data
            ?.filter((i) => i.board_id === board.id)
            .map((issue) => (
              <div
                key={issue.id}
                className="border p-3 rounded-md flex justify-between"
              >
                <div>
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                </div>
                {issue.enable_voting && issue.approved && (
                  <Button size="sm" onClick={() => handleVote(issue.id)}>
                    Upvote
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setExpandedIssue(
                      expandedIssue === issue.id ? null : issue.id,
                    )
                  }
                >
                  Comments
                </Button>
              </div>
            ))}
          {expandedIssue &&
            issues?.data?.find((i) => i.id === expandedIssue) && (
              <div className="ml-4 space-y-2">
                {comments?.map((c) => (
                  <div key={c.id} className="text-sm border-b pb-1">
                    {c.content}
                  </div>
                ))}
              </div>
            )}
        </div>
      ))}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <div className="flex flex-col gap-2">
          <Input
            value={newTicketTitle}
            onChange={(e) => setNewTicketTitle(e.target.value)}
            placeholder="Ticket title"
          />
          <Textarea
            value={newTicketDesc}
            onChange={(e) => setNewTicketDesc(e.target.value)}
            placeholder="Description"
          />
          <Button size="sm" onClick={handleCreateTicket}>
            Submit Ticket
          </Button>
        </div>
        {tickets?.data?.map((t) => (
          <div key={t.id} className="border p-3 rounded-md space-y-2">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleIntegration(t.id, "github")}
                >
                  GitHub
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleIntegration(t.id, "linear")}
                >
                  Linear
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleIntegration(t.id, "slack")}
                >
                  Slack
                </Button>
              </div>
            </div>
            <Input
              defaultValue={t.labels?.join(",")}
              onBlur={(e) => handleLabelChange(t.id, e.target.value)}
              placeholder="labels comma separated"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
