export type NodeType = 'email' | 'wait' | 'trigger' | 'ab-test' | 'condition' | 'split';

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface CanvasState {
  nodes: Node[];
  connections: Connection[];
  selectedNode: Node | null;
  isConnecting: boolean;
  connectionStart: string | null;
}

export interface NodeData {
  email: {
    subject: string;
    content: string;
    template: string;
  };
  wait: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  trigger: {
    event: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
  };
  'ab-test': {
    variantA: { subject: string; content: string };
    variantB: { subject: string; content: string };
    split: number; // percentage
  };
  condition: {
    field: string;
    operator: string;
    value: string;
    truePath: string;
    falsePath: string;
  };
  split: {
    percentage: number;
    pathA: string;
    pathB: string;
  };
}
