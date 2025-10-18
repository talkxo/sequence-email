'use client';

import { NodeType } from '@/types/canvas';

interface NodePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeAdd: (type: NodeType, position: { x: number; y: number }) => void;
  position: { x: number; y: number };
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

export default function NodePaletteModal({ isOpen, onClose, onNodeAdd, position }: NodePaletteModalProps) {
  if (!isOpen) return null;

  const handleNodeSelect = (type: NodeType) => {
    onNodeAdd(type, position);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add New Node</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => handleNodeSelect(nodeType.type)}
              className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${nodeType.color}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{nodeType.icon}</span>
                <span className="font-medium text-sm">{nodeType.label}</span>
                <p className="text-xs text-gray-600 text-center">{nodeType.description}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Click a node type to add it to your sequence
        </div>
      </div>
    </div>
  );
}
