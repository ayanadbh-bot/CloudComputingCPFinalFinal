
import type { Node } from '../types';

export const findNode = (nodes: Node[], nodeId: string): Node | null => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const addNodeToTree = (nodes: Node[], parentId: string, newNode: Node): Node[] => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addNodeToTree(node.children, parentId, newNode),
      };
    }
    return node;
  });
};

export const removeNodeFromTree = (nodes: Node[], nodeId: string): Node[] => {
  return nodes.filter(node => node.id !== nodeId).map(node => {
    if (node.children) {
      return {
        ...node,
        children: removeNodeFromTree(node.children, nodeId),
      };
    }
    return node;
  });
};

export const updateNodeInTree = (nodes: Node[], nodeId: string, newName: string, newContent?: string): Node[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          name: newName,
          ...(newContent !== undefined && { content: newContent }),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, nodeId, newName, newContent),
        };
      }
      return node;
    });
};
