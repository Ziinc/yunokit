import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';

export interface WorkflowNodeData {
  label: string;
}

type WorkflowNode = Node<WorkflowNodeData>;

interface WorkflowDAGEditorProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: Edge[];
  onChange?: (nodes: WorkflowNode[], edges: Edge[]) => void;
}

export const WorkflowDAGEditor: React.FC<WorkflowDAGEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      data: { label: 'New Task' },
      position: { x: 50, y: nodes.length * 80 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  useEffect(() => {
    onChange?.(nodes, edges);
  }, [nodes, edges, onChange]);

  return (
    <div className="h-[400px] border rounded">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
      <div className="p-2">
        <Button onClick={addNode}>Add Task</Button>
      </div>
    </div>
  );
};
