import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import { WorkflowDAGEditor } from "@/components/Workflow/WorkflowDAGEditor";
import type { Node, Edge } from 'reactflow';
import { getWorkflow, createWorkflow, updateWorkflow } from "@/lib/api/WorkflowApi";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";

const WorkflowBuilderPage: React.FC = () => {
  const { workflowId } = useParams<{ workflowId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  const { data, mutate } = useSWR(
    currentWorkspace && workflowId ? `workflow-${workflowId}` : null,
    () => getWorkflow(workflowId!, currentWorkspace!.id)
  );

  const workflow = data?.data;
  const [nodes, setNodes] = useState<Node[]>(workflow?.dag?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(workflow?.dag?.edges || []);

  const handleSave = async () => {
    try {
      if (workflowId === "new") {
        const result = await createWorkflow(
          { name: "New Workflow", dag: { nodes, edges } },
          currentWorkspace!.id
        );
        mutate();
        navigate(`/workflows/${result.data?.id}`);
        toast({ title: "Workflow created" });
      } else if (workflow) {
        const result = await updateWorkflow(
          workflowId!,
          { dag: { nodes, edges }, name: workflow.name },
          currentWorkspace!.id
        );
        mutate({ data: result.data }, { revalidate: false });
        toast({ title: "Workflow saved" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error saving workflow", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Workflow Editor</h1>
      <WorkflowDAGEditor
        initialNodes={nodes}
        initialEdges={edges}
        onChange={(n, e) => {
          setNodes(n);
          setEdges(e);
        }}
      />
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
};

export default WorkflowBuilderPage;
