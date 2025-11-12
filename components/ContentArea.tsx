import React from 'react';
import type { Node, LayoutType } from '../types';
import ViewerPane from './ViewerPane';

interface ContentAreaProps {
  layout: LayoutType;
  pane1Content: Node | null;
  pane2Content: Node | null;
  setPane1Content: (content: Node | null) => void;
  setPane2Content: (content: Node | null) => void;
  onDrop: (pane: 'pane1' | 'pane2', item: Node) => void;
  apiGatewayDownloadEndpoint: string | null;
}

const ContentArea: React.FC<ContentAreaProps> = ({
  layout,
  pane1Content,
  pane2Content,
  setPane1Content,
  setPane2Content,
  onDrop,
  apiGatewayDownloadEndpoint,
}) => {
  return (
    <div className="flex flex-1 p-4 space-x-4 bg-gray-200 dark:bg-gray-900/80">
      <ViewerPane
        content={pane1Content}
        onClose={() => setPane1Content(null)}
        onDrop={(item) => onDrop('pane1', item)}
        paneId="pane1"
        apiGatewayDownloadEndpoint={apiGatewayDownloadEndpoint}
      />
      {layout === 'SPLIT' && (
        <ViewerPane
          content={pane2Content}
          onClose={() => setPane2Content(null)}
          onDrop={(item) => onDrop('pane2', item)}
          paneId="pane2"
          apiGatewayDownloadEndpoint={apiGatewayDownloadEndpoint}
        />
      )}
    </div>
  );
};

export default ContentArea;