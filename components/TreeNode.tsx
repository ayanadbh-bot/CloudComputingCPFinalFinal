import React, { useState } from 'react';
import type { Node } from '../types';
import { NodeType } from '../types';
import FileTree from './FileTree';

const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0111.293 2.707l4 4A1 1 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const NoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;

const NodeIcon: React.FC<{ type: NodeType }> = ({ type }) => {
  switch (type) {
    case NodeType.FOLDER: return <FolderIcon />;
    case NodeType.URL: return <LinkIcon />;
    case NodeType.FILE: return <FileIcon />;
    case NodeType.NOTE: return <NoteIcon />;
    default: return null;
  }
};

interface TreeNodeProps {
  node: Node;
  onSelectNode: (id: string) => void;
  selectedNodeId: string | null;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, newName: string, newContent?: string) => void;
  onAddNode: (parentId: string, name: string, type: NodeType, content?: string) => void;
  onOpenAddModal: (parentId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelectNode, selectedNodeId, onDeleteNode, onUpdateNode, onAddNode, onOpenAddModal }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === NodeType.FOLDER;
  const isSelected = selectedNodeId === node.id;

  const handleDragStart = (e: React.DragEvent) => {
    if (isFolder) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(node));
  };
  
  const handleAddItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node.id);
    onOpenAddModal(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${node.name}"?`)) {
      onDeleteNode(node.id);
    }
  };

  return (
    <div className="text-sm">
      <div
        onClick={() => {
            onSelectNode(node.id);
            if(isFolder) setIsOpen(!isOpen);
        }}
        onDragStart={handleDragStart}
        draggable={!isFolder}
        className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer group ${
          isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${!isFolder && 'cursor-grab'}`}
      >
        <div className="flex items-center flex-1 truncate">
          {isFolder && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 mr-1 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          )}
          <NodeIcon type={node.type} />
          <span className="truncate">{node.name}</span>
        </div>
        <div className="items-center hidden ml-2 space-x-1 group-hover:flex">
          {isFolder && (
            <button onClick={handleAddItem} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600" title="Add Item">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button onClick={handleDelete} className="p-1 text-red-500 rounded hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
        </div>
      </div>
      {isFolder && isOpen && node.children && (
        <div className="pl-4 border-l border-gray-200 dark:border-gray-600 ml-2.5">
          <FileTree 
            nodes={node.children} 
            onSelectNode={onSelectNode} 
            selectedNodeId={selectedNodeId}
            onDeleteNode={onDeleteNode}
            onUpdateNode={onUpdateNode}
            onAddNode={onAddNode}
            onOpenAddModal={onOpenAddModal}
          />
        </div>
      )}
    </div>
  );
};

export default TreeNode;