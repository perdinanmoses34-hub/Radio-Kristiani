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
    <div className="flex flex-col h-[480px] sm:h-[520px] w-full max-w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Live Interaksi & Obrolan</h2>
          <span className="text-[11px] font-mono tabular-nums text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
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
              className="w-28 rounded bg-neutral-800 px-2 py-0.5 text-xs text-white border border-amber-500/50 outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingNick(true)}
              className="flex items-center gap-1 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="Ubah Nama Panggilan"
            >
              <User className="h-3 w-3 text-neutral-500" />
              <span className="max-w-[100px] truncate font-medium">{nickname}</span>
              <span className="text-[10px] text-neutral-500">(edit)</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="rounded-lg bg-neutral-950/80 border border-neutral-800/80 p-2.5 text-xs text-neutral-300 flex items-start gap-2"
              >
                <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">{msg.sender}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{msg.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-neutral-300">{msg.text}</p>
                </div>
              </div>
            );
          }

          if (msg.isRequest) {
            return (
              <div
                key={msg.id}
                className="rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/30 p-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-neutral-200">{msg.sender}</span>
                    <span className="text-[10px] text-amber-400/90 font-medium bg-amber-400/10 px-1 rounded">
                      Request Lagu
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{msg.timestamp}</span>
                </div>
                <p className="mt-1 text-neutral-300 text-xs pl-3.5 border-l border-amber-500/40">{msg.text}</p>
                {msg.requestDetails && (
                  <div className="mt-1.5 ml-3.5 flex items-center gap-1 text-[11px] font-semibold text-amber-300">
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
                    className={`h-4 w-4 rounded-full ${msg.avatarColor || 'bg-amber-500'} flex items-center justify-center text-[9px] font-bold text-neutral-950 uppercase`}
                  >
                    {msg.sender.charAt(0)}
                  </div>
                  <span className="font-semibold text-neutral-300">{msg.sender}</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-neutral-500">{msg.timestamp}</span>
              </div>
              <p className="mt-1 pl-5.5 text-neutral-300 break-words">{msg.text}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emoji and request shortcuts */}
      <div className="border-t border-neutral-800/80 bg-neutral-950/40 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          {['📻', '❤️', '🔥', '🎵', '👍', '☕'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer text-xs"
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={onRequestClick}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
        >
          <Music className="h-3 w-3" />
          <span>Kirim Request</span>
        </button>
      </div>

      {/* Input chat form */}
      <form onSubmit={handleSendMessage} className="border-t border-neutral-800 p-2.5 bg-neutral-950/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Tulis pesan atau kirim salam sebagai ${nickname}...`}
          className="flex-1 rounded-xl bg-neutral-800/80 border border-neutral-700/60 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          aria-label="Kirim Pesan"
        >
          <Send className="h-3.5 w-3.5 fill-current" />
        </button>
      </form>
    </div>
  );
};
