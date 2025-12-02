import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ViewState } from './types';
import { INITIAL_KNOWLEDGE_BASE } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHAT);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // The Knowledge Base is now static (loaded from files at build time)
  // We don't need state for it anymore since users can't change it in the UI.
  const knowledgeBase = INITIAL_KNOWLEDGE_BASE;

  const renderContent = () => {
    switch (currentView) {
      case ViewState.CHAT:
        return <ChatInterface knowledgeBase={knowledgeBase} />;
      case ViewState.SETTINGS:
        return (
          <div className="p-10 max-w-2xl mx-auto h-full overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">설정</h2>
             
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
               <h3 className="text-lg font-semibold mb-4">데이터베이스 정보</h3>
               <div className="space-y-2 text-sm text-slate-600">
                 <p><strong>총 문서 수:</strong> {knowledgeBase.length}개</p>
                 <p><strong>데이터 소스:</strong> GitHub Repository (./data folder)</p>
                 <p><strong>최신 업데이트:</strong> {new Date().toLocaleDateString()}</p>
                 <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-xs">
                   ✅ <strong>자동 연동 중:</strong> 'data' 폴더에 있는 JSON 파일들이 자동으로 로드되었습니다.<br/>
                   파일명의 날짜(예: 2512)가 최신일수록 우선적으로 답변에 사용됩니다.
                 </div>
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold mb-4">애플리케이션 정보</h3>
               <div className="space-y-2 text-sm text-slate-600">
                 <p><strong>Version:</strong> 1.2.0 (File-based RAG)</p>
                 <p><strong>Model:</strong> Google Gemini 2.5 Flash</p>
               </div>
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
