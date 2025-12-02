import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import KnowledgeManager from './components/KnowledgeManager';
import { ViewState, KnowledgeItem } from './types';
import { INITIAL_KNOWLEDGE_BASE } from './constants';

const LOCAL_STORAGE_KEY = 'cheolsan_knowledge_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHAT);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Initialize from LocalStorage or fall back to Initial Data
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    return INITIAL_KNOWLEDGE_BASE;
  });
  
  const [isAdmin, setIsAdmin] = useState(false); // Default to User mode

  // Save to LocalStorage whenever knowledgeBase changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(knowledgeBase));
    } catch (e) {
      console.error("Failed to save to local storage", e);
    }
  }, [knowledgeBase]);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.CHAT:
        return <ChatInterface knowledgeBase={knowledgeBase} />;
      case ViewState.KNOWLEDGE:
        // Protect route
        if (!isAdmin) return <ChatInterface knowledgeBase={knowledgeBase} />;
        return <KnowledgeManager knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} />;
      case ViewState.SETTINGS:
        return (
          <div className="p-10 max-w-2xl mx-auto h-full overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">설정</h2>
             
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
               <h3 className="text-lg font-semibold mb-4">애플리케이션 정보</h3>
               <div className="space-y-2 text-sm text-slate-600">
                 <p><strong>Version:</strong> 1.1.0 (Persistence Update)</p>
                 <p><strong>Model:</strong> Google Gemini 2.5 Flash</p>
                 <p><strong>Status:</strong> Active</p>
                 <p className="text-xs text-green-600 mt-2">✅ 브라우저 저장소 연동됨 (새로고침해도 데이터 유지)</p>
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold mb-4">관리자 설정</h3>
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-medium text-slate-800">관리자 모드 활성화</p>
                   <p className="text-xs text-slate-500">콘텐츠(지식) 관리 메뉴를 표시합니다.</p>
                 </div>
                 <button 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAdmin ? 'bg-blue-600' : 'bg-slate-200'}`}
                 >
                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
               </div>
               {isAdmin && (
                 <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                   관리자 모드가 켜졌습니다. 사이드바에서 <strong>콘텐츠 관리</strong> 메뉴를 확인하세요.
                 </div>
               )}
             </div>
          </div>
        );
      default:
        return <ChatInterface knowledgeBase={knowledgeBase} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">Cheolsan Land AI</h1>
          <button onClick={() => setIsMobileOpen(true)} className="text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;