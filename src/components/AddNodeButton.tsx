'use client';


interface AddNodeButtonProps {
  position: { x: number; y: number };
  onAddNode: () => void;
}

export default function AddNodeButton({ 
  position, 
  onAddNode
}: AddNodeButtonProps) {
  return (
    <div className="absolute" style={{ left: position.x - 15, top: position.y - 15 }}>
      {/* Plus Button */}
      <button
        onClick={onAddNode}
        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 z-20"
        title="Add new node"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
