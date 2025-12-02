import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, KnowledgeItem } from '../types';
import MessageBubble from './MessageBubble';
import { generateResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  knowledgeBase: KnowledgeItem[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ knowledgeBase }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "안녕하세요! **철산랜드 AI 여행 챗봇**입니다.\n\n세부 호핑투어나 맛집, 여행 준비물에 대해 궁금한 점을 물어보세요.\n\n예: '썬마호핑 가격이 얼마야?', '호핑 준비물 알려줘'",
      sender: Sender.BOT,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Add dummy thinking message
    const thinkingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingMsgId,
      text: '',
      sender: Sender.BOT,
      timestamp: new Date(),
      isThinking: true
    }]);

    try {
      // Prepare history for API
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.sender === Sender.USER ? 'user' : 'model' as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

      const response = await generateResponse(userMsg.text, knowledgeBase, history);

      // Remove thinking message and add real response
      setMessages(prev => prev.filter(m => m.id !== thinkingMsgId).concat({
        id: Date.now().toString(),
        text: response.text || '죄송합니다. 답변을 생성하지 못했습니다.',
        sender: Sender.BOT,
        timestamp: new Date(),
        retrievedContext: response.relevantDocs // Store the retrieved docs
      }));

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== thinkingMsgId).concat({
        id: Date.now().toString(),
        text: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (API Key를 확인해주세요)",
        sender: Sender.BOT,
        timestamp: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scrollbar-hide">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto relative flex items-end bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="세부 여행에 대해 물어보세요..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-12 min-h-[50px] max-h-[120px] text-slate-800 placeholder-slate-400 scrollbar-hide"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          철산랜드 AI는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;