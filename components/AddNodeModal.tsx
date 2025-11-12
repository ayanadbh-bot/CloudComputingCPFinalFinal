import React, { useState, useRef, useEffect } from 'react';
import type { Node } from '../types';
import { NodeType } from '../types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (parentId: string, name:string, type: NodeType, content?: string) => void;
  parentNode: Node | null;
  apiGatewayEndpoint: string | null;
}

type AddType = 'FOLDER' | 'URL' | 'FILE';

const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onAddNode, parentNode, apiGatewayEndpoint }) => {
  const [addType, setAddType] = useState<AddType>('FOLDER');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFileuploadConfigured = apiGatewayEndpoint && apiGatewayEndpoint.trim() !== '';

  useEffect(() => {
    // Reset form when modal opens or changes parent
    if (isOpen) {
      setAddType('FOLDER');
      setName('');
      setUrl('');
      setFile(null);
      setIsUploading(false);
    }
  }, [isOpen, parentNode]);

  if (!isOpen || !parentNode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    if (!name.trim() && addType !== 'FILE') {
        alert('Name is required.');
        return;
    }

    switch (addType) {
      case 'FOLDER':
        onAddNode(parentNode.id, name, NodeType.FOLDER);
        onClose();
        break;
      case 'URL':
        if (!url.trim()) {
            alert('URL is required.');
            return;
        }
        try {
            // Basic URL validation
            new URL(url);
            onAddNode(parentNode.id, name, NodeType.URL, url);
            onClose();
        } catch (_) {
            alert('Please enter a valid URL.');
            return;
        }
        break;
      case 'FILE':
        if (!isFileuploadConfigured) {
          alert('File upload is not configured. Please set the API Gateway Endpoint in the settings.');
          return;
        }
        if (!file) {
            alert('A file must be selected.');
            return;
        }
        setIsUploading(true);
        try {
            // 1. Get pre-signed URL from our backend, now including the fileType
            const presignUrlEndpoint = new URL(apiGatewayEndpoint!);
            presignUrlEndpoint.searchParams.append('fileName', file.name);
            presignUrlEndpoint.searchParams.append('fileType', file.type);

            const response = await fetch(presignUrlEndpoint.toString());
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Could not get an upload URL. Server responded with: ${errorText}`);
            }
            const { uploadUrl, key } = await response.json();

            // 2. Upload file directly to S3 using the pre-signed URL
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                const errorXml = await uploadResponse.text();
                console.error("S3 Error Response:", errorXml);
                const codeMatch = errorXml.match(/<Code>(.*?)<\/Code>/);
                const messageMatch = errorXml.match(/<Message>(.*?)<\/Message>/);
                const errorMessage = codeMatch && messageMatch ? `${codeMatch[1]}: ${messageMatch[1]}` : 'S3 upload failed.';
                throw new Error(errorMessage);
            }

            // 3. Add the node to the UI state
            onAddNode(parentNode.id, file.name, NodeType.FILE, key);

        } catch (error) {
            console.error('Upload process failed:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsUploading(false);
        }
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add to "{parentNode.name}"</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <div className="flex mt-1 space-x-2">
              {(['FOLDER', 'URL', 'FILE'] as AddType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAddType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    addType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  } ${type === 'FILE' && !isFileuploadConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={type === 'FILE' && !isFileuploadConfigured}
                  title={type === 'FILE' && !isFileuploadConfigured ? 'Configure API Gateway Endpoint in settings to enable file uploads.' : ''}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {addType !== 'FILE' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {addType === 'URL' && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
                placeholder="https://example.com"
                className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {addType === 'FILE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                File Upload
              </label>
              <div className="flex items-center justify-center w-full px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                <div className="space-y-1 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="relative font-medium text-indigo-600 bg-white rounded-md dark:bg-gray-800 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </button>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {file ? (
                    <p className="text-xs text-gray-500">{file.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Select a file to upload to S3</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="relative px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed dark:disabled:bg-indigo-800"
            >
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              )}
              <span className={isUploading ? 'opacity-0' : 'opacity-100'}>
                {addType === 'FILE' ? 'Upload & Add' : 'Add Item'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;