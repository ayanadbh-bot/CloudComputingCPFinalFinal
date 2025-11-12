import React, { useState, useRef, useCallback } from 'react';
import { NodeType } from '../types';

interface QuickNoteEditorProps {
  onAddNode: (name: string, type: NodeType, content?: string) => void;
  activeFolderName: string;
}

const QuickNoteEditor: React.FC<QuickNoteEditorProps> = ({ onAddNode, activeFolderName }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [height, setHeight] = useState(224); // h-56
  const [isResizing, setIsResizing] = useState(false);
  const lastHeight = useRef(224);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      const noteName = `Note - ${new Date().toLocaleString()}`;
      onAddNode(noteName, NodeType.NOTE, noteContent);
      setNoteContent('');
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
        const collapsing = !prev;
        if (collapsing) {
            lastHeight.current = height;
            setHeight(49); // h-12 + 1px border
        } else {
            setHeight(lastHeight.current);
        }
        return collapsing;
    });
  };

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && editorRef.current) {
        const newHeight = editorRef.current.getBoundingClientRect().bottom - mouseMoveEvent.clientY;
        if (newHeight > 100 && newHeight < 500) {
          setHeight(newHeight);
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


  return (
    <div
      ref={editorRef}
      style={{ height: `${height}px` }}
      className="relative flex flex-col flex-shrink-0 bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-200 ease-in-out"
    >
      {/* Resizer Handle */}
      {!isCollapsed && (
          <div
          className="absolute top-0 left-0 w-full h-2 cursor-row-resize"
          onMouseDown={startResizing}
          />
      )}

      <div className="flex items-center justify-between flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
        <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Quick Note</h3>
            {!isCollapsed && <p className="text-xs text-gray-500 dark:text-gray-400">Notes will be saved to: <span className="font-medium text-indigo-600 dark:text-indigo-400">{activeFolderName}</span></p>}
        </div>
        <button
            onClick={handleToggleCollapse}
            className="p-1 text-gray-500 rounded-md hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title={isCollapsed ? "Expand Note Editor" : "Collapse Note Editor"}
        >
            {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            )}
        </button>
      </div>
      
      {!isCollapsed && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full flex-1 p-2 text-sm text-gray-900 bg-white border-0 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-0"
            />
            <button
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border-t border-indigo-700 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
            >
                Save Note
            </button>
          </div>
      )}
    </div>
  );
};

export default QuickNoteEditor;
