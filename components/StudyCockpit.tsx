import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Node, LayoutType } from '../types';
import { NodeType } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import QuickNoteEditor from './QuickNoteEditor';
import AddNodeModal from './AddNodeModal';
import SettingsModal from './SettingsModal';
import { initialData } from '../utils/mockData';
import { findNode, addNodeToTree, removeNodeFromTree, updateNodeInTree } from '../utils/treeUtils';

const StudyCockpit: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(() => {
    try {
      const savedNodes = localStorage.getItem('myStudyHubNodes');
      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        if (Array.isArray(parsedNodes)) {
          return parsedNodes;
        }
      }
    } catch (error) {
      console.error("Failed to parse nodes from localStorage", error);
    }
    return initialData;
  });

  const [activeNodeId, setActiveNodeId] = useState<string | null>('1');
  const [layout, setLayout] = useState<LayoutType>('SINGLE' as LayoutType);
  const [pane1Content, setPane1Content] = useState<Node | null>(null);
  const [pane2Content, setPane2Content] = useState<Node | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalParentNode, setAddModalParentNode] = useState<Node | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // AWS Configuration
  const [apiGatewayEndpoint, setApiGatewayEndpoint] = useState<string | null>(() => {
    return localStorage.getItem('apiGatewayUploadEndpoint') ?? 'https://kw8xjol386.execute-api.eu-north-1.amazonaws.com/upload-url';
  });
  const [apiGatewayDownloadEndpoint, setApiGatewayDownloadEndpoint] = useState<string | null>(() => {
    return localStorage.getItem('apiGatewayDownloadEndpoint') ?? 'https://kw8xjol386.execute-api.eu-north-1.amazonaws.com/download-url';
  });
  const [apiGatewayDeleteEndpoint, setApiGatewayDeleteEndpoint] = useState<string | null>(() => {
    return localStorage.getItem('apiGatewayDeleteEndpoint') ?? 'https://kw8xjol386.execute-api.eu-north-1.amazonaws.com/delete-object';
  });


  // Persist nodes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('myStudyHubNodes', JSON.stringify(nodes));
    } catch (error) {
      console.error("Failed to save nodes to localStorage", error);
    }
  }, [nodes]);


  const handleSaveSettings = (uploadEndpoint: string, downloadEndpoint: string, deleteEndpoint: string) => {
    setApiGatewayEndpoint(uploadEndpoint);
    localStorage.setItem('apiGatewayUploadEndpoint', uploadEndpoint);
    setApiGatewayDownloadEndpoint(downloadEndpoint);
    localStorage.setItem('apiGatewayDownloadEndpoint', downloadEndpoint);
    setApiGatewayDeleteEndpoint(deleteEndpoint);
    localStorage.setItem('apiGatewayDeleteEndpoint', deleteEndpoint);
    setIsSettingsModalOpen(false);
  };

  const activeFolder = useMemo(() => {
    if (!activeNodeId) return findNode(nodes, '1');
    const activeNode = findNode(nodes, activeNodeId);
    return activeNode?.type === NodeType.FOLDER ? activeNode : findNode(nodes, '1');
  }, [activeNodeId, nodes]);
  
  const handleOpenAddModal = useCallback((parentId: string) => {
    const parentNode = findNode(nodes, parentId);
    if (parentNode && parentNode.type === NodeType.FOLDER) {
        setAddModalParentNode(parentNode);
        setIsAddModalOpen(true);
    }
  }, [nodes]);

  const handleAddNode = useCallback((parentId: string, name: string, type: NodeType, content?: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      name,
      type,
      content,
      ...(type === NodeType.FOLDER && { children: [] }),
    };
    setNodes(prevNodes => addNodeToTree(prevNodes, parentId, newNode));
    // If a file was added, close the modal now that the parent has handled it
    if (type === NodeType.FILE) {
        setIsAddModalOpen(false);
    }
  }, []);

  const handleSaveQuickNote = useCallback((name: string, type: NodeType, content?: string) => {
      if (activeFolder) {
          handleAddNode(activeFolder.id, name, type, content);
      }
  }, [activeFolder, handleAddNode]);

  const handleUpdateNode = useCallback((nodeId: string, newName: string, newContent?: string) => {
    setNodes(prevNodes => updateNodeInTree(prevNodes, nodeId, newName, newContent));
  }, []);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    const nodeToDelete = findNode(nodes, nodeId);

    if (nodeToDelete?.type === NodeType.FILE && nodeToDelete.content) {
      if (!apiGatewayDeleteEndpoint) {
        alert("Cannot delete file: S3 delete endpoint is not configured in settings.");
        return;
      }
      try {
        const endpoint = new URL(apiGatewayDeleteEndpoint);
        endpoint.searchParams.append('key', nodeToDelete.content);

        const response = await fetch(endpoint.toString(), {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete file from S3.');
        }
      } catch (error) {
        console.error("Failed to delete S3 object:", error);
        alert(`Error deleting file from cloud storage: ${error instanceof Error ? error.message : String(error)}`);
        return; // Stop the deletion process if the backend fails
      }
    }

    setNodes(prevNodes => removeNodeFromTree(prevNodes, nodeId));
    if(pane1Content?.id === nodeId) setPane1Content(null);
    if(pane2Content?.id === nodeId) setPane2Content(null);
  }, [nodes, pane1Content, pane2Content, apiGatewayDeleteEndpoint]);

  const handleDropInPane = (pane: 'pane1' | 'pane2', item: Node) => {
    if (item.type === NodeType.FOLDER) return;
    if (pane === 'pane1') {
      setPane1Content(item);
    } else {
      setPane2Content(item);
    }
  };
  
  const breadcrumbs = useMemo(() => {
    if (!activeNodeId) return [{ id: '1', name: 'My Library' }];
    const path: { id: string; name: string }[] = [];
    const findPath = (currentNodes: Node[], targetId: string, currentPath: { id: string; name: string }[]): boolean => {
      for (const node of currentNodes) {
        const newPath = [...currentPath, { id: node.id, name: node.name }];
        if (node.id === targetId) {
          path.push(...newPath);
          return true;
        }
        if (node.children && findPath(node.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };
    findPath(nodes, activeNodeId, []);
    return path.length > 0 ? path : [{ id: '1', name: 'My Library' }];
  }, [activeNodeId, nodes]);

  return (
    <div className="flex flex-col h-screen font-sans text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-900">
      <Header layout={layout} setLayout={setLayout} onOpenSettings={() => setIsSettingsModalOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          nodes={nodes}
          activeNodeId={activeNodeId}
          setActiveNodeId={setActiveNodeId}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onUpdateNode={handleUpdateNode}
          onOpenAddModal={handleOpenAddModal}
        />
        <main className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center flex-shrink-0 p-2 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                    <span
                        className={`text-sm cursor-pointer ${index === breadcrumbs.length - 1 ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        onClick={() => setActiveNodeId(crumb.id)}
                    >
                        {crumb.name}
                    </span>
                    {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">/</span>}
                    </React.Fragment>
                ))}
            </div>
            <ContentArea
                layout={layout}
                pane1Content={pane1Content}
                pane2Content={pane2Content}
                setPane1Content={setPane1Content}
                setPane2Content={setPane2Content}
                onDrop={handleDropInPane}
                apiGatewayDownloadEndpoint={apiGatewayDownloadEndpoint}
            />
            <QuickNoteEditor 
                onAddNode={handleSaveQuickNote}
                activeFolderName={activeFolder?.name ?? 'My Library'}
            />
        </main>
      </div>
      <AddNodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddNode={handleAddNode}
        parentNode={addModalParentNode}
        apiGatewayEndpoint={apiGatewayEndpoint}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSettings}
        currentUploadEndpoint={apiGatewayEndpoint}
        currentDownloadEndpoint={apiGatewayDownloadEndpoint}
        currentDeleteEndpoint={apiGatewayDeleteEndpoint}
      />
    </div>
  );
};

export default StudyCockpit;