'use client';

import { Connection, Node } from '@/types/canvas';

interface ConnectionLineProps {
  connection: Connection;
  nodes: Node[];
  onDelete: (connectionId: string) => void;
}

export default function ConnectionLine({ connection, nodes, onDelete }: ConnectionLineProps) {
  const fromNode = nodes.find(n => n.id === connection.from);
  const toNode = nodes.find(n => n.id === connection.to);

  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + 112; // Half of node width (224px / 2)
  const startY = fromNode.position.y + 50; // Approximate center of node
  const endX = toNode.position.x - 112; // Half of node width
  const endY = toNode.position.y + 50;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const path = `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${midY} Q ${midX} ${endY} ${endX} ${endY}`;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
        
        <path
          d={path}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          markerEnd={`url(#arrowhead-${connection.id})`}
          className="hover:stroke-blue-600 cursor-pointer"
          onClick={() => onDelete(connection.id)}
        />
        
        {/* Invisible clickable area */}
        <path
          d={path}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
          className="pointer-events-auto cursor-pointer"
          onClick={() => onDelete(connection.id)}
        />
      </svg>
    </div>
  );
}
