'use client';

import { Node } from '@/types/canvas';

interface PropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
}

export default function PropertiesModal({ isOpen, onClose, selectedNode, onNodeUpdate }: PropertiesModalProps) {
  if (!isOpen || !selectedNode) return null;

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Node Type</div>
          <div className="text-lg font-medium capitalize">{selectedNode.type}</div>
        </div>
        
        {renderAttributes()}
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
