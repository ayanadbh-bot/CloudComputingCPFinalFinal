import React, { useState, useRef, useCallback } from 'react';
import type { Node } from '../types';
import { NodeType } from '../types';
import FileTree from './FileTree';

interface SidebarProps {
  nodes: Node[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
  onAddNode: (parentId: string, name: string, type: NodeType, content?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, newName: string, newContent?: string) => void;
  onOpenAddModal: (parentId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  nodes,
  activeNodeId,
  setActiveNodeId,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
  onOpenAddModal,
}) => {
  const [width, setWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastWidth = useRef(350);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (newWidth > 250 && newWidth < 600) {
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );
  
  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
        const collapsing = !prev;
        if (collapsing) {
            lastWidth.current = width;
            setWidth(56); // w-14
        } else {
            setWidth(lastWidth.current);
        }
        return collapsing;
    });
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className="relative flex flex-col flex-shrink-0 bg-gray-50 border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out"
    >
      <button
            onClick={handleToggleCollapse}
            className="absolute top-1/2 -translate-y-1/2 z-10 w-6 h-10 bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300 text-gray-600 dark:text-gray-300 rounded-r-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ right: '-12px' }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            )}
        </button>

      {isCollapsed ? (
          <div className="flex items-center justify-center flex-1 py-4" title="My Library">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
        ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* File Tree */}
          <div className="flex-1 p-2 overflow-y-auto">
            <h2 className="px-2 pb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">My Library</h2>
            <FileTree
              nodes={nodes}
              onSelectNode={setActiveNodeId}
              selectedNodeId={activeNodeId}
              onDeleteNode={onDeleteNode}
              onUpdateNode={onUpdateNode}
              onAddNode={onAddNode}
              onOpenAddModal={onOpenAddModal}
            />
          </div>
        </div>
      )}
      
      {/* Resizer Handle */}
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize"
          onMouseDown={startResizing}
        />
      )}
    </aside>
  );
};

export default Sidebar;