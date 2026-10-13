import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Music, User, Radio, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/radio';
import { fetchChatData, sendChatMessage } from '../services/api';

interface LiveChatProps {
  onRequestClick: () => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({ onRequestClick }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('radio_user_nick') || 'Pendengar_' + Math.floor(100 + Math.random() * 900);
  });
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll chat messages periodically
  useEffect(() => {
    let isMounted = true;
    const loadChat = async () => {
      try {
        const data = await fetchChatData();
        if (isMounted) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        // silent fallback
      }
    };

    loadChat();
    const interval = setInterval(loadChat, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await sendChatMessage({
        sender: nickname,
        text,
      });
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveNick = (newNick: string) => {
    const trimmed = newNick.trim() || 'Pendengar';
    setNickname(trimmed);
    localStorage.setItem('radio_user_nick', trimmed);
    setIsEditingNick(false);
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-[480px] sm:h-[520px] w-full max-w-full rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-md">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50/90">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800">Live Interaksi &amp; Obrolan</h2>
          <span className="text-[11px] font-mono tabular-nums text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 font-bold">
            Realtime
          </span>
        </div>

        {/* User Nickname Picker */}
        <div className="flex items-center text-xs">
          {isEditingNick ? (
            <input
              type="text"
              defaultValue={nickname}
              onBlur={(e) => handleSaveNick(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNick((e.target as HTMLInputElement).value)}
              autoFocus
              className="w-28 rounded-lg bg-white px-2 py-0.5 text-xs text-slate-800 border border-amber-400 outline-none shadow-xs"
            />
          ) : (
            <button
              onClick={() => setIsEditingNick(true)}
              className="flex items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
              title="Ubah Nama Panggilan"
            >
              <User className="h-3 w-3 text-slate-400" />
              <span className="max-w-[100px] truncate font-semibold text-slate-700">{nickname}</span>
              <span className="text-[10px] text-slate-400">(edit)</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2 shadow-2xs"
              >
                <Radio className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700">{msg.sender}</span>
                    <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-slate-600">{msg.text}</p>
                </div>
              </div>
            );
          }

          if (msg.isRequest) {
            return (
              <div
                key={msg.id}
                className="rounded-xl bg-amber-50/70 border border-amber-200 p-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-900">{msg.sender}</span>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1 rounded">
                      Request Lagu
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                </div>
                <p className="mt-1 text-slate-700 text-xs pl-3.5 border-l-2 border-amber-400">{msg.text}</p>
                {msg.requestDetails && (
                  <div className="mt-1.5 ml-3.5 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <Music className="h-3 w-3" />
                    <span>{msg.requestDetails.artist} - {msg.requestDetails.title}</span>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-4.5 w-4.5 rounded-full ${msg.avatarColor || 'bg-amber-500'} flex items-center justify-center text-[9px] font-black text-white uppercase shadow-2xs`}
                  >
                    {msg.sender.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800">{msg.sender}</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-slate-400">{msg.timestamp}</span>
              </div>
              <p className="mt-1 pl-6 text-slate-700 break-words">{msg.text}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emoji and request shortcuts */}
      <div className="border-t border-slate-200 bg-slate-50/90 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          {['📻', '❤️', '🔥', '🎵', '👍', '☕'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="p-1 rounded hover:bg-slate-200/80 transition-colors cursor-pointer text-xs"
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={onRequestClick}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
        >
          <Music className="h-3 w-3" />
          <span>Kirim Request</span>
        </button>
      </div>

      {/* Input chat form */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-2.5 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Tulis pesan atau salam sebagai ${nickname}...`}
          className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 shadow-sm shadow-amber-500/25"
          aria-label="Kirim Pesan"
        >
          <Send className="h-3.5 w-3.5 fill-current" />
        </button>
      </form>
    </div>
  );
};
