'use client';

import { FormData } from '@/types';

interface ToolbarProps {
  formData?: FormData | null;
  nodeCount: number;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
}

export default function Toolbar({ formData, nodeCount, onSave, onLoad, onExport }: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Email Sequence Canvas</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>📧</span>
            <span>Drag & Drop Email Builder</span>
          </div>
          {formData && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              <span>✅</span>
              <span>Generated {nodeCount} emails for: {formData.productDescription.slice(0, 50)}...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onLoad}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            📁 Load
          </button>
          
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            💾 Save
          </button>
          
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            📤 Export
          </button>
        </div>
      </div>
    </div>
  );
}
