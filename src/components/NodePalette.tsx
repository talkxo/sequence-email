'use client';

import { NodeType } from '@/types/canvas';

interface NodePaletteProps {
  onNodeAdd: (type: NodeType, position: { x: number; y: number }) => void;
}

const nodeTypes: Array<{
  type: NodeType;
  label: string;
  icon: string;
  description: string;
  color: string;
}> = [
  {
    type: 'email',
    label: 'Email',
    icon: '📧',
    description: 'Send an email',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
  },
  {
    type: 'wait',
    label: 'Wait',
    icon: '⏰',
    description: 'Wait for a duration',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  },
  {
    type: 'trigger',
    label: 'Trigger',
    icon: '⚡',
    description: 'Event trigger',
    color: 'bg-green-100 border-green-300 text-green-800',
  },
  {
    type: 'ab-test',
    label: 'A/B Test',
    icon: '🧪',
    description: 'Split test emails',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: '❓',
    description: 'Conditional logic',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
  },
  {
    type: 'split',
    label: 'Split',
    icon: '🔀',
    description: 'Split audience',
    color: 'bg-pink-100 border-pink-300 text-pink-800',
  },
];

export default function NodePalette({ }: NodePaletteProps) {
  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    console.log('Starting drag for type:', type);
    e.dataTransfer.setData('application/json', JSON.stringify({ type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-48 bg-white border-r border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Node Palette</h3>
      
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            draggable
            onDragStart={(e) => handleDragStart(e, nodeType.type)}
            className={`p-2 rounded-lg border-2 cursor-move hover:shadow-md transition-all ${nodeType.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{nodeType.icon}</span>
              <span className="font-medium text-xs">{nodeType.label}</span>
            </div>
            <p className="text-xs text-gray-600">{nodeType.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag nodes to canvas</li>
          <li>• Click nodes to select</li>
          <li>• Connect nodes with lines</li>
          <li>• Configure in side panel</li>
        </ul>
      </div>
    </div>
  );
}
