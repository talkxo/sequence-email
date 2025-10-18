'use client';

import { Node } from '@/types/canvas';

interface CanvasNodeProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectionStart: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
  onDelete: () => void;
}

export default function CanvasNode({
  node,
  isSelected,
  isConnecting,
  isConnectionStart,
  onMouseDown,
  onClick,
  onConnectionStart,
  onConnectionEnd,
  onDelete,
}: CanvasNodeProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'wait':
        return '⏰';
      case 'trigger':
        return '⚡';
      case 'ab-test':
        return '🧪';
      case 'condition':
        return '❓';
      case 'split':
        return '🔀';
      default:
        return '📦';
    }
  };


  const getNodeTitle = (node: Node): string => {
    switch (node.type) {
      case 'email':
        return (node.data.subject as string) || 'Email';
      case 'wait':
        return `Wait ${(node.data.duration as number) || 1} ${(node.data.unit as string) || 'days'}`;
      case 'trigger':
        return (node.data.event as string) || 'Trigger';
      case 'ab-test':
        return 'A/B Test';
      case 'condition':
        return 'Condition';
      case 'split':
        return 'Split';
      default:
        return 'Node';
    }
  };

  const getNodeStatus = (node: Node) => {
    // Determine node status based on configuration
    if (node.type === 'email' && !node.data.subject) return 'error';
    if (node.type === 'wait' && !node.data.duration) return 'error';
    if (node.type === 'trigger' && !node.data.event) return 'error';
    return 'success';
  };

  const status = getNodeStatus(node);
  const statusColor = status === 'error' ? 'border-red-500' : 'border-green-500';
  const statusIcon = status === 'error' ? '⚠️' : '✅';

  return (
    <div
      className={`absolute w-56 p-3 rounded-lg border-2 cursor-move select-none transition-all bg-white ${
        statusColor
      } ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl' : 'shadow-lg hover:shadow-xl'
      } ${
        isConnectionStart ? 'ring-2 ring-green-500' : ''
      }`}
      style={{
        left: node.position.x - 112, // Center the node (w-56 = 224px, so -112px to center)
        top: node.position.y - 50, // Center vertically
        zIndex: 10,
        transform: 'translate(0, 0)', // Remove any transform
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{getNodeIcon(node.type)}</span>
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-800">{getNodeTitle(node)}</div>
            <div className="text-xs text-gray-500">
              {node.type === 'email' && (node.data.subject as string) ? (node.data.subject as string) : 
               node.type === 'wait' ? `Wait ${(node.data.duration as number) || 1} ${(node.data.unit as string) || 'days'}` :
               node.type === 'trigger' ? (node.data.event as string) || 'Trigger event' :
               node.type.charAt(0).toUpperCase() + node.type.slice(1)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{statusIcon}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Show three-dot menu
            }}
            className="text-gray-400 hover:text-gray-600 text-sm p-1"
          >
            ⋮
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-500 text-sm p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Connection Points - Simplified */}
      <div className="flex justify-center items-center mt-2">
        {/* Single Connection Point */}
        <div
          className={`w-2 h-2 rounded-full ${
            isConnecting ? 'bg-green-500' : isConnectionStart ? 'bg-blue-500' : 'bg-gray-300'
          } cursor-pointer hover:bg-blue-400 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              onConnectionEnd();
            } else {
              onConnectionStart();
            }
          }}
          title={isConnecting ? 'Click to connect' : 'Click to start connection'}
        />
      </div>

      {/* Node Status */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}
