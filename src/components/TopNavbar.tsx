import React from 'react';
import { Music, RadioTower, ShieldCheck, Lock } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'player' | 'chat' | 'schedule' | 'history';
  onSelectTab: (tab: 'player' | 'chat' | 'schedule' | 'history') => void;
  onRequestClick: () => void;
  onAdminClick: () => void;
  isAdminLoggedIn?: boolean;
  stationName?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  onRequestClick,
  onAdminClick,
  isAdminLoggedIn = false,
  stationName = 'Eklesia Radio',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-b border-neutral-800/90 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3.5">
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

        {/* Zone 3: Action Buttons (Request Lagu + Khusus Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dedicated Admin Login/Dashboard Button */}
          <button
            onClick={onAdminClick}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-all cursor-pointer border ${
              isAdminLoggedIn
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title={isAdminLoggedIn ? 'Buka Panel Kelola Admin' : 'Masuk Khusus Admin'}
            aria-label="Tombol Masuk Admin"
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden xs:inline sm:inline">Admin</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-neutral-400 group-hover:text-amber-400" />
                <span>Admin</span>
              </>
            )}
          </button>

          {/* Request Lagu Button */}
          <button
            onClick={onRequestClick}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-neutral-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
            aria-label="Request Lagu"
          >
            <Music className="h-3.5 w-3.5 fill-current" />
            <span className="hidden xs:inline">Request</span>
            <span className="xs:hidden">Lagu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

