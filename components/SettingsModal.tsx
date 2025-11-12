import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (uploadEndpoint: string, downloadEndpoint: string, deleteEndpoint: string) => void;
  currentUploadEndpoint: string | null;
  currentDownloadEndpoint: string | null;
  currentDeleteEndpoint: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentUploadEndpoint, currentDownloadEndpoint, currentDeleteEndpoint }) => {
  const [uploadEndpoint, setUploadEndpoint] = useState('');
  const [downloadEndpoint, setDownloadEndpoint] = useState('');
  const [deleteEndpoint, setDeleteEndpoint] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUploadEndpoint(currentUploadEndpoint || '');
      setDownloadEndpoint(currentDownloadEndpoint || '');
      setDeleteEndpoint(currentDeleteEndpoint || '');
    }
  }, [isOpen, currentUploadEndpoint, currentDownloadEndpoint, currentDeleteEndpoint]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(uploadEndpoint, downloadEndpoint, deleteEndpoint);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AWS Configuration</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Provide your API Gateway endpoint URLs for uploading, viewing, and deleting files from Amazon S3.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="api-gateway-upload-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              File Upload Endpoint URL
            </label>
            <input
              type="url"
              id="api-gateway-upload-endpoint"
              value={uploadEndpoint}
              onChange={e => setUploadEndpoint(e.target.value)}
              placeholder="https://.../upload-url"
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           <div>
            <label htmlFor="api-gateway-download-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              File View/Download Endpoint URL
            </label>
            <input
              type="url"
              id="api-gateway-download-endpoint"
              value={downloadEndpoint}
              onChange={e => setDownloadEndpoint(e.target.value)}
              placeholder="https://.../download-url"
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="api-gateway-delete-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              File Deletion Endpoint URL
            </label>
            <input
              type="url"
              id="api-gateway-delete-endpoint"
              value={deleteEndpoint}
              onChange={e => setDeleteEndpoint(e.target.value)}
              placeholder="https://.../delete-object"
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Find the base "Invoke URL" in the AWS Console under API Gateway &gt; Your API &gt; Stages, then append your specific route (e.g., `/delete-object`).
           </p>
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;