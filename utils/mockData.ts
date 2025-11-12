
import type { Node } from '../types';
import { NodeType } from '../types';

export const initialData: Node[] = [
  {
    id: '1',
    name: 'My Library',
    type: NodeType.FOLDER,
    children: [
      {
        id: '2',
        name: 'Cloud Computing',
        type: NodeType.FOLDER,
        children: [
          { id: '3', name: 'AWS Intro Video', type: NodeType.URL, content: 'https://www.youtube.com/watch?v=a9__D53Wsus' },
          { id: '4', name: 'Serverless Architectures', type: NodeType.FILE },
          { id: '5', name: 'DynamoDB Notes', type: NodeType.NOTE, content: 'DynamoDB is a key-value and document database...\n- Partition key is crucial for data distribution.\n- Sort key can be used for range queries.' },
        ],
      },
      {
        id: '6',
        name: 'Frontend Development',
        type: NodeType.FOLDER,
        children: [
          { id: '7', name: 'React Docs', type: NodeType.URL, content: 'https://react.dev' },
          { id: '8', name: 'Tailwind CSS', type: NodeType.URL, content: 'https://tailwindcss.com' },
        ],
      },
      {
        id: '9',
        name: 'Project Ideas',
        type: NodeType.NOTE,
        content: '1. Build a personal study hub.\n2. Create a serverless image processing pipeline.\n3. Develop a real-time chat application with WebSockets.',
      },
      {
        id: '10',
        name: 'Placeholder PDF',
        type: NodeType.FILE,
      }
    ],
  },
];
