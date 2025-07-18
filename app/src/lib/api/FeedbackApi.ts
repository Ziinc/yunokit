import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

export type FeedbackIssueRow =
  Database["yunofeedback"]["Tables"]["issues"]["Row"];
export type FeedbackIssueInsert =
  Database["yunofeedback"]["Tables"]["issues"]["Insert"];
export type FeedbackIssueUpdate =
  Database["yunofeedback"]["Tables"]["issues"]["Update"];
export type FeedbackTicketRow =
  Database["yunofeedback"]["Tables"]["tickets"]["Row"];
export type FeedbackTicketInsert =
  Database["yunofeedback"]["Tables"]["tickets"]["Insert"];
export type FeedbackTicketUpdate =
  Database["yunofeedback"]["Tables"]["tickets"]["Update"];
export type TicketCommentInsert =
  Database["yunofeedback"]["Tables"]["ticket_comments"]["Insert"];


export const listFeedbackIssues = async (workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackIssueRow[]>(
    `proxy/feedback/issues?${qp.toString()}`,
    { method: "GET" },
  );
};

export const createFeedbackIssue = async (
  issue: FeedbackIssueInsert,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackIssueRow>(
    `proxy/feedback/issues?${qp.toString()}`,
    { method: "POST", body: issue },
  );
};

export const updateFeedbackIssue = async (
  id: string,
  issue: FeedbackIssueUpdate,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackIssueRow>(
    `proxy/feedback/issues/${id}?${qp.toString()}`,
    { method: "PUT", body: issue },
  );
};

export const deleteFeedbackIssue = async (id: string, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke(
    `proxy/feedback/issues/${id}?${qp.toString()}`,
    { method: "DELETE" },
  );
};

export const voteOnIssue = async (issueId: string, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke(
    `proxy/feedback/votes?${qp.toString()}`,
    { method: "POST", body: { item_id: issueId } },
  );
};

export const listTickets = async (workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackTicketRow[]>(
    `proxy/feedback/tickets?${qp.toString()}`,
    { method: "GET" },
  );
};

export const createTicket = async (
  ticket: FeedbackTicketInsert,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackTicketRow>(
    `proxy/feedback/tickets?${qp.toString()}`,
    { method: "POST", body: ticket },
  );
};

export const updateTicket = async (
  id: string,
  ticket: FeedbackTicketUpdate,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke<FeedbackTicketRow>(
    `proxy/feedback/tickets/${id}?${qp.toString()}`,
    { method: "PUT", body: ticket },
  );
};

export const deleteTicket = async (id: string, workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke(
    `proxy/feedback/tickets/${id}?${qp.toString()}`,
    { method: "DELETE" },
  );
};

export const addTicketCommentApi = async (
  ticketId: string,
  comment: TicketCommentInsert,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke(
    `proxy/feedback/tickets/${ticketId}/comments?${qp.toString()}`,
    { method: "POST", body: comment },
  );
};

export const triggerExternalIntegration = async (
  type: "github" | "linear" | "slack",
  payload: Record<string, unknown>,
  workspaceId: number,
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: "yunofeedback",
  });
  return await supabase.functions.invoke(
    `proxy/feedback/integrations?${qp.toString()}`,
    { method: "POST", body: { type, payload } },
  );
};
