import React from 'react';
import useSWR from 'swr';
import { useWorkspace } from '@/lib/contexts/WorkspaceContext';
import { listFeedbackBoards, listFeedbackIssues, voteOnIssue } from '@/lib/api/FeedbackApi';
import { Button } from '@/components/ui/button';

const FeedbackPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const { data: boards } = useSWR(
    workspaceId ? ['boards', workspaceId] : null,
    () => listFeedbackBoards(workspaceId!)
  );

  const { data: issues } = useSWR(
    workspaceId && boards && boards.data?.[0]
      ? ['issues', boards.data[0].id]
      : null,
    () => listFeedbackIssues(boards!.data![0].id, workspaceId!)
  );

  const handleVote = async (issueId: string) => {
    if (!workspaceId) return;
    await voteOnIssue(issueId, workspaceId);
  };

  return (
    <div className="space-y-6 max-w-full">
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      {boards?.data?.map(board => (
        <div key={board.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{board.name}</h2>
          {issues?.data?.filter(i => i.board_id === board.id).map(issue => (
            <div key={issue.id} className="border p-3 rounded-md flex justify-between">
              <div>
                <p className="font-medium">{issue.title}</p>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
              {issue.enable_voting && issue.approved && (
                <Button size="sm" onClick={() => handleVote(issue.id)}>Upvote</Button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FeedbackPage;
