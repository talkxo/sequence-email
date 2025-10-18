'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Node, Connection, NodeType } from '@/types/canvas';
import { Email, FormData } from '@/types';
import Canvas from '@/components/Canvas';
import NodePaletteModal from '@/components/NodePaletteModal';
import PropertiesModal from '@/components/PropertiesModal';
import Toolbar from '@/components/Toolbar';

export default function CanvasPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [nodePalettePosition, setNodePalettePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  // Load generated emails from sessionStorage on component mount
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    const generatedEmails = sessionStorage.getItem('generatedEmails');
    const storedFormData = sessionStorage.getItem('formData');
    
    if (generatedEmails && storedFormData) {
      try {
        const emails: Email[] = JSON.parse(generatedEmails);
        const formData: FormData = JSON.parse(storedFormData);
        
        setFormData(formData);
        
               // Convert emails to canvas nodes with comfortable spacing
               const emailNodes: Node[] = emails.map((email, index) => ({
                 id: `email-${email.emailNumber}`,
                 type: 'email' as NodeType,
                 position: {
                   x: 300, // Centered horizontally for 800px width
                   y: 100 + (index * 250), // Comfortable vertical spacing (250px)
                 },
                 data: {
                   subject: email.subject,
                   content: email.body,
                   template: 'default',
                   originalEmail: email,
                   sequencePosition: index + 1,
                 },
               }));
               
               // Add trigger node at the beginning
               const triggerNode: Node = {
                 id: 'trigger-start',
                 type: 'trigger' as NodeType,
                 position: { x: 300, y: 40 },
                 data: {
                   event: 'user_signup',
                   label: 'User Signs Up',
                 },
               };

        const allNodes = [triggerNode, ...emailNodes];
        setNodes(allNodes);
        
        // Create connections: trigger -> first email, then between emails
        const emailConnections: Connection[] = [];
        
        // Connect trigger to first email
        if (emailNodes.length > 0) {
          emailConnections.push({
            id: 'conn-trigger',
            from: triggerNode.id,
            to: emailNodes[0].id,
          });
        }
        
        // Connect emails in sequence
        for (let i = 0; i < emailNodes.length - 1; i++) {
          emailConnections.push({
            id: `conn-${i}`,
            from: emailNodes[i].id,
            to: emailNodes[i + 1].id,
          });
        }
        setConnections(emailConnections);
        
        // Clear sessionStorage after loading
        sessionStorage.removeItem('generatedEmails');
        sessionStorage.removeItem('formData');
      } catch (error) {
        console.error('Error loading generated emails:', error);
      }
    }
  }, []);

  const addNode = useCallback((type: NodeType) => {
    // Calculate vertical position for new nodes (comfortable spacing)
    const emailNodes = nodes.filter(n => n.type === 'email');
    const nextEmailPosition = emailNodes.length + 1;
    const verticalPosition = 100 + (nextEmailPosition * 250); // Comfortable spacing
    
    let newNode: Node;
    
    if (type === 'email') {
      // Auto-generate email details based on position
      const emailDetails = generateEmailForPosition(nextEmailPosition, formData);
      newNode = {
        id: `email-${nextEmailPosition}`,
        type,
        position: { x: 300, y: verticalPosition }, // Centered for 800px width
        data: {
          template: 'default',
          sequencePosition: nextEmailPosition,
          ...emailDetails,
        },
      };
    } else {
      newNode = {
        id: `node-${Date.now()}`,
        type,
        position: { x: 300, y: verticalPosition }, // Centered for 800px width
        data: getDefaultNodeData(type),
      };
    }
    
    setNodes(prev => [...prev, newNode]);
    
    // Auto-connect to previous email if it's an email node
    if (type === 'email' && emailNodes.length > 0) {
      const lastEmail = emailNodes[emailNodes.length - 1];
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: lastEmail.id,
        to: newNode.id,
      };
      setConnections(prev => [...prev, newConnection]);
    }
  }, [nodes, formData]);

  const handleNodePaletteOpen = useCallback((position: { x: number; y: number }) => {
    setNodePalettePosition(position);
    setShowNodePalette(true);
  }, []);

  const handleNodeClick = useCallback((node: Node | null) => {
    setSelectedNode(node);
    if (node) {
      setShowProperties(true);
    }
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes(prev => {
      const updatedNodes = prev.map(node => {
        if (node.id === nodeId) {
          // For vertical stacking, constrain X position and maintain Y spacing
          if (updates.position) {
            const emailNodes = prev.filter(n => n.type === 'email');
            const currentIndex = emailNodes.findIndex(n => n.id === nodeId);
            
            if (currentIndex !== -1) {
            // Constrain to vertical stack (professional workflow layout)
            updates.position = {
              x: 300, // Fixed horizontal position for 800px width
              y: Math.max(40, updates.position.y), // Minimum Y position
            };
            }
          }
          return { ...node, ...updates };
        }
        return node;
      });

      // Auto-reorder nodes to maintain vertical stacking
      if (updates.position) {
        const emailNodes = updatedNodes.filter(n => n.type === 'email');
        const triggerNode = updatedNodes.find(n => n.type === 'trigger');
        const otherNodes = updatedNodes.filter(n => n.type !== 'email' && n.type !== 'trigger');
        
        // Sort email nodes by Y position
        const sortedEmailNodes = emailNodes.sort((a, b) => a.position.y - b.position.y);
        
        // Reassign positions for proper vertical stacking (comfortable spacing)
        const reorderedNodes = sortedEmailNodes.map((node, index) => ({
          ...node,
          position: {
            x: 300,
            y: 100 + (index * 250),
          },
        }));

        // Rebuild connections
        const newConnections: Connection[] = [];
        if (triggerNode && reorderedNodes.length > 0) {
          newConnections.push({
            id: 'conn-trigger',
            from: triggerNode.id,
            to: reorderedNodes[0].id,
          });
        }
        
        for (let i = 0; i < reorderedNodes.length - 1; i++) {
          newConnections.push({
            id: `conn-${i}`,
            from: reorderedNodes[i].id,
            to: reorderedNodes[i + 1].id,
          });
        }
        
        setConnections(newConnections);
        
        return [triggerNode, ...reorderedNodes, ...otherNodes].filter((node): node is Node => node !== undefined);
      }

      return updatedNodes;
    });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const addConnection = useCallback((from: string, to: string) => {
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      from,
      to,
    };
    setConnections(prev => [...prev, newConnection]);
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  }, []);


  const handleConnectionStart = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  }, []);

  const handleConnectionEnd = useCallback((nodeId: string) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      addConnection(connectionStart, nodeId);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  }, [isConnecting, connectionStart, addConnection]);

  const handleSave = useCallback(() => {
    const sequenceData = {
      nodes,
      connections,
      formData,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(sequenceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-sequence-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Sequence saved');
  }, [nodes, connections, formData]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const sequenceData = JSON.parse(e.target?.result as string);
            setNodes(sequenceData.nodes || []);
            setConnections(sequenceData.connections || []);
            setFormData(sequenceData.formData || null);
            console.log('Sequence loaded');
          } catch (error) {
            console.error('Error loading sequence:', error);
            alert('Error loading sequence file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleExport = useCallback(() => {
    const emailNodes = nodes.filter(n => n.type === 'email');
    const exportData = {
      sequence: emailNodes.map(node => ({
        position: node.data.sequencePosition || 0,
        subject: node.data.subject || 'No Subject',
        content: node.data.content || 'No Content',
        type: node.type,
      })),
      connections: connections.map(conn => ({
        from: conn.from,
        to: conn.to,
      })),
      metadata: {
        totalEmails: emailNodes.length,
        createdAt: new Date().toISOString(),
        formData: formData,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-sequence-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Sequence exported');
  }, [nodes, connections, formData]);

  return (
    <div className="h-screen flex flex-col bg-gray-50" style={{ maxHeight: '800px', maxWidth: '800px' }}>
      <div className="bg-white border-b border-gray-200 px-3 py-1.5">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          ← Back to Form Generator
        </Link>
      </div>
      <Toolbar 
        formData={formData}
        nodeCount={nodes.length}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
      />
      
      <div className="flex-1 relative overflow-auto" style={{ maxHeight: '600px' }}>
        <Canvas
          ref={canvasRef}
          nodes={nodes}
          connections={connections}
          selectedNode={selectedNode}
          isConnecting={isConnecting}
          connectionStart={connectionStart}
          onNodeClick={handleNodeClick}
          onNodeUpdate={updateNode}
          onNodeDelete={deleteNode}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
          onConnectionDelete={deleteConnection}
          onNodePaletteOpen={handleNodePaletteOpen}
        />
      </div>

      {/* Modals */}
      <NodePaletteModal
        isOpen={showNodePalette}
        onClose={() => setShowNodePalette(false)}
        onNodeAdd={addNode}
        position={nodePalettePosition}
      />
      
      <PropertiesModal
        isOpen={showProperties}
        onClose={() => setShowProperties(false)}
        selectedNode={selectedNode}
        onNodeUpdate={updateNode}
      />
    </div>
  );
}

function generateEmailForPosition(position: number, formData: FormData | null) {
  if (!formData) {
    return {
      subject: `Email ${position}`,
      content: 'Auto-generated email content',
    };
  }

  // Generate email based on position and form data
  const emailTemplates = [
    {
      subject: `Welcome to ${formData.productDescription.split(' ')[0]}!`,
      content: `🎯 Welcome new user and introduce the product\n\n📝 • Thank you for signing up\n• Here's what you can expect\n\n🚀 Get Started\n\n💬 ${formData.toneOfVoice}`,
    },
    {
      subject: `Why ${formData.targetAudience.split(' ')[0]}s Love Our Product`,
      content: `🎯 Educate about product benefits\n\n📝 • Key features and benefits\n• Customer testimonials\n\n🚀 Learn More\n\n💬 ${formData.toneOfVoice}`,
    },
    {
      subject: `Don't Miss Out - Limited Time Offer!`,
      content: `🎯 Create urgency and drive action\n\n📝 • Special offer details\n• Limited time availability\n\n🚀 Claim Offer\n\n💬 ${formData.toneOfVoice}`,
    },
    {
      subject: `Final Reminder - Your Offer Expires Soon`,
      content: `🎯 Last chance conversion\n\n📝 • Final call to action\n• What happens next\n\n🚀 Act Now\n\n💬 ${formData.toneOfVoice}`,
    },
  ];

  const template = emailTemplates[Math.min(position - 1, emailTemplates.length - 1)];
  return {
    subject: template.subject,
    content: template.content,
  };
}

function getDefaultNodeData(type: NodeType) {
  switch (type) {
    case 'email':
      return {
        subject: 'New Email',
        content: '',
        template: 'default',
      };
    case 'wait':
      return {
        duration: 1,
        unit: 'days',
      };
    case 'trigger':
      return {
        event: 'signup',
        conditions: [],
      };
    case 'ab-test':
      return {
        variantA: { subject: 'Variant A', content: '' },
        variantB: { subject: 'Variant B', content: '' },
        split: 50,
      };
    default:
      return {};
  }
}