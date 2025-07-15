import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { listWorkflows } from "@/lib/api/WorkflowApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

const WorkflowListPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { data } = useSWR(
    currentWorkspace ? "workflows" : null,
    () => listWorkflows(currentWorkspace!.id)
  );

  const workflows = data?.data || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Workflows</h1>
        <Link to="/workflows/new">
          <Button>Create Workflow</Button>
        </Link>
      </div>
      <ul className="space-y-2">
        {workflows.map((wf) => (
          <li key={wf.id} className="border rounded p-3">
            <Link to={`/workflows/${wf.id}`} className="font-medium">
              {wf.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkflowListPage;
