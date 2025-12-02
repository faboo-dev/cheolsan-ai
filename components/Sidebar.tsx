import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isMobileOpen, setIsMobileOpen, isAdmin }) => {
  const navItems = [
    { id: ViewState.CHAT, label: '여행 챗봇', icon: '💬' },
    // Only show Knowledge Base in Admin Mode
    ...(isAdmin ? [{ id: ViewState.KNOWLEDGE, label: '콘텐츠 관리 (Admin)', icon: '📚' }] : []),
    { id: ViewState.SETTINGS, label: '설정', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:relative z-30
        w-64 h-full bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-blue-400">Cheolsan</span>Land AI
          </h1>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-bold text-slate-300 mb-1">System Status</p>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Online</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
               Mode: {isAdmin ? 'Administrator' : 'User'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;