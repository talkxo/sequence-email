'use client';

import { forwardRef, useCallback, useState, useRef } from 'react';
import { Node, Connection } from '@/types/canvas';
import CanvasNode from './CanvasNode';
import ConnectionLine from './ConnectionLine';
import AddNodeButton from './AddNodeButton';

interface CanvasProps {
  nodes: Node[];
  connections: Connection[];
  selectedNode: Node | null;
  isConnecting: boolean;
  connectionStart: string | null;
  onNodeClick: (node: Node | null) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionStart: (nodeId: string) => void;
  onConnectionEnd: (nodeId: string) => void;
  onConnectionDelete: (connectionId: string) => void;
  onNodePaletteOpen: (position: { x: number; y: number }) => void;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  nodes,
  connections,
  selectedNode,
  isConnecting,
  connectionStart,
  onNodeClick,
  onNodeUpdate,
  onNodeDelete,
  onConnectionStart,
  onConnectionEnd,
  onConnectionDelete,
  onNodePaletteOpen,
}, ref) => {
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Node mouse down:', nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.log('Node not found:', nodeId);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Record initial mouse position for drag detection
    setDragStartPos({ x: e.clientX, y: e.clientY });

    console.log('Starting drag for node:', node);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y,
    });
    setIsDragging(true);
    setDraggedNodeId(nodeId);
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragOffset || !canvasRef.current || !draggedNodeId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    };

    // For vertical stacking, constrain movement (professional workflow layout)
    const node = nodes.find(n => n.id === draggedNodeId);
    if (node) {
      // Keep X position fixed for vertical stacking
      newPosition.x = 300;
      // Allow Y movement but with constraints
      newPosition.y = Math.max(40, newPosition.y);
    }

    onNodeUpdate(draggedNodeId, { position: newPosition });
  }, [isDragging, dragOffset, draggedNodeId, onNodeUpdate, nodes]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragStartPos) {
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      // If drag distance is less than 5 pixels, treat as click
      if (dragDistance < 5) {
        console.log('Treating as click, not drag');
        // Don't trigger node click here, let the node handle it
      }
    }
    
    setIsDragging(false);
    setDragOffset(null);
    setDraggedNodeId(null);
    setDragStartPos(null);
  }, [isDragging, dragStartPos]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onNodeClick(null);
    }
  }, [onNodeClick]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event triggered');
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    console.log('Drop data:', data);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    console.log('Drop position:', position);
    onNodePaletteOpen(position);
  }, [onNodePaletteOpen]);

  return (
    <div
      ref={ref}
      className="flex-1 bg-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ minHeight: '400px', maxHeight: '800px', overflow: 'auto' }}
    >
      <div
        ref={canvasRef}
        className="w-full h-full relative"
        style={{
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          minHeight: '600px', // Ensure enough space
        }}
      >
        {/* Vertical stacking guide line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-200 opacity-50"
          style={{ left: '300px' }}
        />
        {/* Connection Lines */}
        {connections.map(connection => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            nodes={nodes}
            onDelete={onConnectionDelete}
          />
        ))}

        {/* Nodes */}
        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            isConnecting={isConnecting}
            isConnectionStart={connectionStart === node.id}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onClick={() => onNodeClick(node)}
            onConnectionStart={() => onConnectionStart(node.id)}
            onConnectionEnd={() => onConnectionEnd(node.id)}
            onDelete={() => onNodeDelete(node.id)}
          />
        ))}

        {/* Plus Buttons Between Nodes */}
        {nodes.map((node, index) => {
          const nextNode = nodes[index + 1];
          if (nextNode) {
            const midY = (node.position.y + nextNode.position.y) / 2;
            return (
              <AddNodeButton
                key={`plus-${node.id}-${nextNode.id}`}
                position={{ x: 300, y: midY }}
                onAddNode={() => {
                  onNodePaletteOpen({ x: 300, y: midY });
                }}
              />
            );
          }
          return null;
        })}

        {/* Plus Button at End */}
        {nodes.length > 0 && (
          <AddNodeButton
            key="plus-end"
            position={{ x: 300, y: Math.max(...nodes.map(n => n.position.y)) + 180 }}
            onAddNode={() => {
              onNodePaletteOpen({ x: 300, y: Math.max(...nodes.map(n => n.position.y)) + 180 });
            }}
          />
        )}

        {/* Connection Preview */}
        {isConnecting && connectionStart && (
          <div className="absolute pointer-events-none">
            <svg className="w-full h-full">
              <line
                x1={nodes.find(n => n.id === connectionStart)?.position.x || 0}
                y1={nodes.find(n => n.id === connectionStart)?.position.y || 0}
                x2={0} // Will be updated with mouse position
                y2={0} // Will be updated with mouse position
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
