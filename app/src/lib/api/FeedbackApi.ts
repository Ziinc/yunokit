import { supabase } from "../supabase";
import type { Database } from "../../../database.types";

export type FeedbackBoardRow = Database['yunofeedback']['Tables']['boards']['Row'];
export type FeedbackIssueRow = Database['yunofeedback']['Tables']['issues']['Row'];
export type FeedbackIssueInsert = Database['yunofeedback']['Tables']['issues']['Insert'];
export type FeedbackIssueUpdate = Database['yunofeedback']['Tables']['issues']['Update'];

export const listFeedbackBoards = async (workspaceId: number) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: 'yunofeedback'
  });
  return await supabase.functions.invoke<FeedbackBoardRow[]>(
    `proxy/feedback/boards?${qp.toString()}`,
    { method: 'GET' }
  );
};

export const listFeedbackIssues = async (
  boardId: string,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    boardId,
    schema: 'yunofeedback'
  });
  return await supabase.functions.invoke<FeedbackIssueRow[]>(
    `proxy/feedback/issues?${qp.toString()}`,
    { method: 'GET' }
  );
};

export const createFeedbackIssue = async (
  issue: FeedbackIssueInsert,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: 'yunofeedback'
  });
  return await supabase.functions.invoke<FeedbackIssueRow>(
    `proxy/feedback/issues?${qp.toString()}`,
    { method: 'POST', body: issue }
  );
};

export const voteOnIssue = async (
  issueId: string,
  workspaceId: number
) => {
  const qp = new URLSearchParams({
    workspaceId: workspaceId.toString(),
    schema: 'yunofeedback'
  });
  return await supabase.functions.invoke(
    `proxy/feedback/votes?${qp.toString()}`,
    { method: 'POST', body: { item_id: issueId } }
  );
};
