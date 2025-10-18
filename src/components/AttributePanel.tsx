'use client';

import { Node } from '@/types/canvas';

interface AttributePanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
}

export default function AttributePanel({ selectedNode, onNodeUpdate }: AttributePanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-56 bg-white border-l border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Properties</h3>
        <div className="text-gray-500 text-xs">
          Select a node to configure its properties
        </div>
      </div>
    );
  }

  const handleDataUpdate = (key: string, value: string | number | object) => {
    onNodeUpdate(selectedNode.id, {
      data: {
        ...selectedNode.data,
        [key]: value,
      },
    });
  };

  const renderEmailAttributes = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Line
        </label>
        <input
          type="text"
          value={(selectedNode.data.subject as string) || ''}
          onChange={(e) => handleDataUpdate('subject', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email subject"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={(selectedNode.data.content as string) || ''}
          onChange={(e) => handleDataUpdate('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter email content"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template
        </label>
        <select
          value={(selectedNode.data.template as string) || 'default'}
          onChange={(e) => handleDataUpdate('template', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="newsletter">Newsletter</option>
          <option value="promotional">Promotional</option>
          <option value="transactional">Transactional</option>
        </select>
      </div>
    </div>
  );

  const renderWaitAttributes = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration
        </label>
        <input
          type="number"
          value={(selectedNode.data.duration as number) || 1}
          onChange={(e) => handleDataUpdate('duration', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit
        </label>
        <select
          value={(selectedNode.data.unit as string) || 'days'}
          onChange={(e) => handleDataUpdate('unit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
        </select>
      </div>
    </div>
  );

  const renderTriggerAttributes = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event
        </label>
        <select
          value={(selectedNode.data.event as string) || 'signup'}
          onChange={(e) => handleDataUpdate('event', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="signup">Signup</option>
          <option value="purchase">Purchase</option>
          <option value="download">Download</option>
          <option value="page_view">Page View</option>
          <option value="email_open">Email Open</option>
          <option value="email_click">Email Click</option>
        </select>
      </div>
    </div>
  );

  const renderABTestAttributes = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Split Percentage
        </label>
        <input
          type="number"
          value={(selectedNode.data.split as number) || 50}
          onChange={(e) => handleDataUpdate('split', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="99"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant A Subject
        </label>
        <input
          type="text"
          value={((selectedNode.data.variantA as { subject?: string })?.subject) || ''}
          onChange={(e) => handleDataUpdate('variantA', {
            ...(selectedNode.data.variantA as object || {}),
            subject: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant B Subject
        </label>
        <input
          type="text"
          value={((selectedNode.data.variantB as { subject?: string })?.subject) || ''}
          onChange={(e) => handleDataUpdate('variantB', {
            ...(selectedNode.data.variantB as object || {}),
            subject: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderAttributes = () => {
    switch (selectedNode.type) {
      case 'email':
        return renderEmailAttributes();
      case 'wait':
        return renderWaitAttributes();
      case 'trigger':
        return renderTriggerAttributes();
      case 'ab-test':
        return renderABTestAttributes();
      default:
        return (
          <div className="text-gray-500 text-sm">
            No specific attributes for this node type
          </div>
        );
    }
  };

  return (
    <div className="w-56 bg-white border-l border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Properties</h3>
      
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">Node Type</div>
        <div className="text-sm font-medium capitalize">{selectedNode.type}</div>
      </div>
      
      {renderAttributes()}
    </div>
  );
}
