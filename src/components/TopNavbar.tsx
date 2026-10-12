import React from 'react';
import { Radio, Music } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'player' | 'schedule' | 'history' | 'bridge';
  onSelectTab: (tab: 'player' | 'schedule' | 'history' | 'bridge') => void;
  onRequestClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  onRequestClick,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('player')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20">
            <Radio className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            RadioBoss Stream Studio
          </span>
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('player')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'player'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Siaran Langsung
          </button>
          <button
            onClick={() => onSelectTab('schedule')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Jadwal Acara
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Daftar Lagu & Antrean
          </button>
          <button
            onClick={() => onSelectTab('bridge')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'bridge'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Integrasi RadioBOSS
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRequestClick}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Music className="h-3.5 w-3.5 fill-current" />
            <span>Request Lagu</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-tabs for seamless thumb navigation */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-900 bg-neutral-900/40 px-4 py-2 gap-2 text-xs font-medium no-scrollbar">
        <button
          onClick={() => onSelectTab('player')}
          className={`whitespace-nowrap shrink-0 px-3 py-1 rounded-md transition-colors ${
            activeTab === 'player'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Siaran
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`whitespace-nowrap shrink-0 px-3 py-1 rounded-md transition-colors ${
            activeTab === 'history'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Daftar Lagu
        </button>
        <button
          onClick={() => onSelectTab('schedule')}
          className={`whitespace-nowrap shrink-0 px-3 py-1 rounded-md transition-colors ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Jadwal
        </button>
        <button
          onClick={() => onSelectTab('bridge')}
          className={`whitespace-nowrap shrink-0 px-3 py-1 rounded-md transition-colors ${
            activeTab === 'bridge'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          RadioBOSS Server
        </button>
      </div>
    </header>
  );
};
