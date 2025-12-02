import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;
  const [showContext, setShowContext] = useState(false);

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-md ${isBot ? 'bg-white mr-3' : 'bg-blue-600 ml-3'}`}>
          {isBot ? (
            <span className="text-xl">🤖</span>
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>

        {/* Bubble */}
        <div className={`relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
          isBot 
            ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}>
          {message.isThinking ? (
            <div className="flex space-x-2 h-6 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <>
              <div className={`markdown-body ${isBot ? '' : 'text-white'}`}>
                <ReactMarkdown 
                  components={{
                    a: ({node, ...props}) => (
                      <a {...props} className={`underline ${isBot ? 'text-blue-600 hover:text-blue-800' : 'text-white hover:text-slate-200'}`} target="_blank" rel="noopener noreferrer" />
                    ),
                    p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                    ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 mb-2" />,
                    ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                    h3: ({node, ...props}) => <h3 {...props} className="text-lg font-bold mt-4 mb-2 block border-b pb-1 border-slate-200/50" />,
                    strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
                    blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-slate-300 pl-3 italic my-2 text-slate-500" />
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>

              {/* RAG Context Visualization (Only for Bot and if context exists) */}
              {isBot && message.retrievedContext && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setShowContext(!showContext)}
                    className="flex items-center text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-1">{showContext ? '▼' : '▶'}</span>
                    <span>참조한 철산랜드 기록 ({message.retrievedContext.length}건)</span>
                  </button>
                  
                  {showContext && (
                    <div className="mt-2 space-y-2 bg-slate-50 p-2 rounded-lg text-xs text-slate-600">
                      {message.retrievedContext.length > 0 ? (
                        message.retrievedContext.map((item, idx) => (
                          <div key={idx} className="border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                            <p className="font-semibold text-slate-700 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mb-1">{item.url}</p>
                            <p className="line-clamp-2 bg-white p-1 rounded border border-slate-100 italic">
                              "{item.content.substring(0, 100)}..."
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="italic text-slate-400">관련된 기록을 찾지 못했습니다. (검색어 불일치 등)</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          <div className={`text-[10px] mt-2 text-right opacity-70 ${isBot ? 'text-slate-400' : 'text-blue-100'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;