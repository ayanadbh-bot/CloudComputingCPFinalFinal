
import React from 'react';
import type { LayoutType } from '../types';

interface HeaderProps {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ layout, setLayout, onOpenSettings }) => {
  return (
    <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 text-white bg-gray-800 border-b border-gray-700 shadow-md">
      <div className="flex items-center space-x-3">
         <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <h1 className="text-xl font-bold tracking-wider">MyStudyHub</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center p-1 bg-gray-700 rounded-lg">
          <button
            onClick={() => setLayout('SINGLE' as LayoutType)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              layout === 'SINGLE'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            Single View
          </button>
          <button
            onClick={() => setLayout('SPLIT' as LayoutType)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              layout === 'SPLIT'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            Split View
          </button>
        </div>
      </div>
       <div className="flex items-center space-x-4">
        <span className="text-sm">Welcome, Demo User</span>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button onClick={() => window.location.reload()} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
