import React from 'react';
import type { Node } from '../types';
import { NodeType } from '../types';
import TreeNode from './TreeNode';

interface FileTreeProps {
  nodes: Node[];
  onSelectNode: (id: string) => void;
  selectedNodeId: string | null;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, newName: string, newContent?: string) => void;
  onAddNode: (parentId: string, name: string, type: NodeType, content?: string) => void;
  onOpenAddModal: (parentId: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ nodes, onSelectNode, selectedNodeId, onDeleteNode, onUpdateNode, onAddNode, onOpenAddModal }) => {
  return (
    <div>
      {nodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNodeId}
          onDeleteNode={onDeleteNode}
          onUpdateNode={onUpdateNode}
          onAddNode={onAddNode}
          onOpenAddModal={onOpenAddModal}
        />
      ))}
    </div>
  );
};

export default FileTree;