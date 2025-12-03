import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ViewState } from './types';
import { INITIAL_KNOWLEDGE_BASE, SKIPPED_FILES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHAT);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const knowledgeBase = INITIAL_KNOWLEDGE_BASE;
  const isDataEmpty = knowledgeBase.length === 0;

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
               
               {isDataEmpty && SKIPPED_FILES.length === 0 ? (
                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                   <p className="text-red-700 font-bold mb-1">⚠️ 데이터가 로드되지 않았습니다!</p>
                   <p className="text-red-600 text-sm">
                     Render 설정의 <strong>Publish Directory</strong>가 <code>dist</code> 로 설정되어 있는지 확인해주세요.
                   </p>
                 </div>
               ) : (
                 <div className="space-y-2 text-sm text-slate-600">
                   <p><strong>총 문서 수:</strong> {knowledgeBase.length}개</p>
                   <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-xs">
                     ✅ <strong>작동 중:</strong> 정상 파일들이 로드되었습니다.
                   </div>
                 </div>
               )}

               {/* 🚨 ERROR REPORT SECTION */}
               {SKIPPED_FILES.length > 0 && (
                 <div className="mt-6 mb-4">
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     <h4 className="font-bold text-red-700 flex items-center mb-2">
                       <span className="text-xl mr-2">🚫</span> 로드 실패한 파일 ({SKIPPED_FILES.length}개)
                     </h4>
                     <p className="text-xs text-red-600 mb-2">
                       아래 파일들에 <strong>오타(쉼표, 따옴표 등)</strong>가 있어 제외되었습니다. 
                       GitHub에서 수정하면 자동으로 반영됩니다.
                     </p>
                     <ul className="list-disc ml-4 text-xs font-mono text-red-800">
                       {SKIPPED_FILES.map(f => (
                         <li key={f}>{f}</li>
                       ))}
                     </ul>
                   </div>
                 </div>
               )}

               <h4 className="font-semibold text-sm mt-6 mb-2 text-slate-700">인식 성공한 파일:</h4>
               <div className="bg-slate-100 rounded-lg p-3 max-h-40 overflow-y-auto text-xs font-mono space-y-1">
                 {knowledgeBase.length === 0 ? (
                   <span className="text-slate-400 italic">표시할 파일이 없습니다.</span>
                 ) : (
                   knowledgeBase.map((item, idx) => (
                     <div key={item.id + idx} className="flex justify-between">
                       <span className="truncate w-2/3">{item.title}</span>
                       <span className="text-blue-600">{item.dateCode || '-'}</span>
                     </div>
                   ))
                 )}
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
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">Cheolsan Land AI</h1>
          <button onClick={() => setIsMobileOpen(true)} className="text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
