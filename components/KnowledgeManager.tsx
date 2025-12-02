import React, { useState } from 'react';
import { KnowledgeItem } from '../types';

interface KnowledgeManagerProps {
  knowledgeBase: KnowledgeItem[];
  setKnowledgeBase: React.Dispatch<React.SetStateAction<KnowledgeItem[]>>;
}

const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ knowledgeBase, setKnowledgeBase }) => {
  const [newItem, setNewItem] = useState<{ title: string; url: string; content: string; type: 'youtube' | 'blog' }>({
    title: '',
    url: '',
    content: '',
    type: 'blog'
  });

  const handleAdd = () => {
    if (!newItem.title || !newItem.content) return;
    
    const item: KnowledgeItem = {
      id: Date.now().toString(),
      ...newItem
    };

    setKnowledgeBase(prev => [...prev, item]);
    setNewItem({ title: '', url: '', content: '', type: 'blog' });
  };

  const handleDelete = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">🗂️</span>
          <h2 className="text-2xl font-bold text-slate-800">철산랜드 콘텐츠 관리 (Admin)</h2>
        </div>
        
        <p className="text-slate-600 mb-8 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm">
          ⚠️ <strong>관리자 전용 페이지입니다.</strong><br/>
          여기에 등록된 YouTube 자막 및 블로그 콘텐츠는 사용자의 질문에 따라 <strong>검색(RAG)</strong>되어 AI에게 제공됩니다.<br/>
          정확한 답변을 위해 콘텐츠 내용을 구체적으로 입력해주세요.
        </p>

        {/* Add New Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">새 콘텐츠 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
              <input 
                type="text" 
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 철산랜드 호핑 준비물"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL (Youtube/Blog)</label>
              <input 
                type="text" 
                value={newItem.url}
                onChange={e => setNewItem({...newItem, url: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="mb-4">
             <label className="block text-sm font-medium text-slate-700 mb-1">타입</label>
             <select 
               value={newItem.type}
               onChange={e => setNewItem({...newItem, type: e.target.value as 'youtube' | 'blog'})}
               className="w-full md:w-1/3 border border-slate-300 rounded-lg p-2"
             >
               <option value="blog">블로그 글</option>
               <option value="youtube">유튜브 자막/설명</option>
             </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">내용 (텍스트 추출)</label>
            <textarea 
              value={newItem.content}
              onChange={e => setNewItem({...newItem, content: e.target.value})}
              className="w-full border border-slate-300 rounded-lg p-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="영상 자막 내용이나 블로그 본문 텍스트를 입력하세요. AI가 이 내용을 바탕으로 답변합니다."
            />
          </div>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            콘텐츠 추가하기
          </button>
        </div>

        {/* List Section */}
        <h3 className="text-lg font-semibold mb-4 text-slate-700">등록된 콘텐츠 목록 ({knowledgeBase.length})</h3>
        <div className="space-y-4">
          {knowledgeBase.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 hover:border-blue-300 transition-colors">
              <div className="flex-shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  item.type === 'youtube' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {item.type.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-800 mb-1">{item.title}</h4>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mb-2 block">
                  {item.url}
                </a>
                <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">{item.content}</p>
              </div>
              <div className="flex-shrink-0 flex items-center">
                 <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                 >
                   삭제
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeManager;