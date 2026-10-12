import React from 'react';
import { Music, RadioTower } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'player' | 'chat' | 'schedule' | 'history';
  onSelectTab: (tab: 'player' | 'chat' | 'schedule' | 'history') => void;
  onRequestClick: () => void;
  stationName?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  onRequestClick,
  stationName = 'Eklesia Radio',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-b border-neutral-800/90 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6 sm:py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('player')}
          className="flex items-center gap-2 text-left cursor-pointer group min-w-0 shrink"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <RadioTower className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
              {stationName}
            </span>
            <span className="hidden sm:block text-[10px] text-neutral-400 font-medium">
              Live Streaming & RadioBOSS Playout
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
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
            onClick={() => onSelectTab('chat')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Obrolan & Komunitas
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
            onClick={() => onSelectTab('schedule')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Jadwal Acara
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRequestClick}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-neutral-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
            aria-label="Request Lagu"
          >
            <Music className="h-3.5 w-3.5 fill-current" />
            <span>Request Lagu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
