'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, useCallback } from 'react';
import { animate } from 'animejs';

export default function RetroChat({ repoContext, onChatUpdate }: { repoContext: string, onChatUpdate: (messages: any[]) => void }) {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { repoContext },
    })
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const animatedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const stableOnChatUpdate = useCallback(onChatUpdate, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    stableOnChatUpdate(messages);
  }, [messages, stableOnChatUpdate]);

  useEffect(() => {
    if (!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      const lastMsg = messages[messages.length - 1];
      if (!animatedMessageIds.current.has(lastMsg.id)) {
        animatedMessageIds.current.add(lastMsg.id);
        const lastMsgEl = document.getElementById(`msg-${lastMsg.id}`);
        if (lastMsgEl) {
          animate(lastMsgEl, {
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 500,
            easing: 'easeOutQuad'
          });
        }
      }
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-retro-black/90 pixel-border p-4">
      <h3 className="text-retro-purple text-xl mb-4">AI ASSISTANT</h3>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-xs mb-1 ${m.role === 'user' ? 'text-retro-green' : 'text-retro-purple'}`}>
              {m.role === 'user' ? 'JUDGE' : 'AI'}
            </span>
            <div id={`msg-${m.id}`} className={`p-3 max-w-[80%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-retro-green/20 pixel-border-green' : 'bg-retro-purple/20 pixel-border'}`}>
              {m.parts?.map((part, i) => part.type === 'text' ? <span key={i}>{part.text}</span> : null)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-retro-purple animate-pulse">AI IS TYPING...</div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="ASK ABOUT THE CODE..."
          className="flex-1 bg-transparent pixel-border p-3 text-white outline-none focus:pixel-border-green"
        />
        <button type="submit" disabled={isLoading || !input} className="bg-retro-purple text-white px-6 py-3 pixel-shadow pixel-shadow-hover disabled:opacity-50 disabled:cursor-not-allowed">
          SEND
        </button>
      </form>
    </div>
  );
}