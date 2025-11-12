import React, { useState, useEffect } from 'react';
import type { Node } from '../types';
import { NodeType } from '../types';

interface ViewerPaneProps {
  content: Node | null;
  onClose: () => void;
  onDrop: (item: Node) => void;
  paneId: string;
  apiGatewayDownloadEndpoint: string | null;
}

const getEmbedUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (e) {
        console.error("Invalid URL for embedding:", url);
    }
    return null;
};

const FileViewer: React.FC<{ node: Node, apiGatewayDownloadEndpoint: string | null }> = ({ node, apiGatewayDownloadEndpoint }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchFileUrl = async () => {
            if (!apiGatewayDownloadEndpoint) {
                setError('File viewer is not configured. Please set the Download API Endpoint in settings.');
                setIsLoading(false);
                return;
            }
            if (!node.content) {
                 setError('File node is missing the S3 object key.');
                 setIsLoading(false);
                 return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const endpoint = new URL(apiGatewayDownloadEndpoint);
                endpoint.searchParams.append('key', node.content);

                const response = await fetch(endpoint.toString());
                if (!response.ok) {
                    throw new Error(`Failed to fetch download URL: ${response.statusText}`);
                }
                const data = await response.json();
                if (isMounted) {
                    setFileUrl(data.downloadUrl);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchFileUrl();

        return () => {
            isMounted = false;
        };
    }, [node.content, apiGatewayDownloadEndpoint, node.name]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
                <svg className="w-8 h-8 mr-3 -ml-1 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading file...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold">Could not load file</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    
    if (fileUrl) {
        const extension = node.name.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') {
            return <iframe src={fileUrl} title={node.name} className="w-full h-full border-0" />;
        }
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '')) {
             return (
                <div className="flex items-center justify-center w-full h-full p-4 overflow-auto bg-gray-200 dark:bg-gray-900">
                    <img src={fileUrl} alt={node.name} className="object-contain max-w-full max-h-full" />
                </div>
             );
        }
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
            return <iframe src={officeViewerUrl} title={node.name} frameBorder="0" className="w-full h-full" />;
        }

        // Fallback for other file types
        return (
             <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-white dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{node.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Preview is not available for this file type.</p>
                <a href={fileUrl} download={node.name} className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download File
                </a>
            </div>
        )
    }

    return null;
}

const ContentViewer: React.FC<{ content: Node, apiGatewayDownloadEndpoint: string | null }> = ({ content, apiGatewayDownloadEndpoint }) => {
  switch (content.type) {
    case NodeType.URL:
      const embedUrl = getEmbedUrl(content.content || '');
      if (embedUrl) {
          return (
              <iframe
                  src={embedUrl}
                  title={content.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
          );
      }
      return (
        <div className="w-full h-full p-4 overflow-auto bg-white dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">{content.name}</h2>
            <p className="mb-4">This content cannot be embedded. You can visit it here:</p>
            <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
                {content.content}
            </a>
        </div>
      );
    case NodeType.NOTE:
      return (
        <div className="w-full h-full p-6 overflow-y-auto bg-white dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold border-b pb-2 dark:border-gray-600">{content.name}</h2>
          <pre className="text-base text-gray-800 whitespace-pre-wrap font-sans dark:text-gray-200">{content.content}</pre>
        </div>
      );
    case NodeType.FILE:
        return <FileViewer node={content} apiGatewayDownloadEndpoint={apiGatewayDownloadEndpoint} />;
    default:
      return null;
  }
};


const ViewerPane: React.FC<ViewerPaneProps> = ({ content, onClose, onDrop, apiGatewayDownloadEndpoint }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const item = JSON.parse(e.dataTransfer.getData('application/json'));
      if(item.id && item.name && item.type) {
        onDrop(item);
      }
    } catch (error) {
        console.error("Failed to parse dropped data:", error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 ${isDragOver ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
    >
      {content ? (
        <>
          <div className="absolute top-0 right-0 z-10 p-2">
            <button onClick={onClose} className="p-1.5 text-gray-500 bg-white rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden rounded-lg">
            <ContentViewer content={content} apiGatewayDownloadEndpoint={apiGatewayDownloadEndpoint} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 8.188a9 9 0 1112.728 0M5 5a9 9 0 0112.728 0" /></svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-200">Drop a resource here</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Drag any link, file, or note from the library on the left to view it.</p>
        </div>
      )}
    </div>
  );
};

export default ViewerPane;