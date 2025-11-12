
export enum NodeType {
  FOLDER = 'FOLDER',
  URL = 'URL',
  FILE = 'FILE',
  NOTE = 'NOTE',
}

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  children?: Node[];
  content?: string; // For URL or NOTE content
}

export enum LayoutType {
  SINGLE = 'SINGLE',
  SPLIT = 'SPLIT',
}
