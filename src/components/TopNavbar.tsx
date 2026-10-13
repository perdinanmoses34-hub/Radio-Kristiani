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
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('player')}
          className="flex items-center gap-2.5 text-left cursor-pointer group min-w-0 shrink"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-black shadow-md shadow-amber-500/25 shrink-0 ring-1 ring-amber-400/40">
            <RadioTower className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              {stationName}
            </span>
            <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Live Streaming &amp; RadioBOSS Playout
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <button
            onClick={() => onSelectTab('player')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'player'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/70 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Siaran Langsung
          </button>
          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/70 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Obrolan &amp; Komunitas
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/70 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Daftar Lagu &amp; Antrean
          </button>
          <button
            onClick={() => onSelectTab('schedule')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/70 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Jadwal Acara
          </button>
        </nav>

        {/* Zone 3: Action Buttons (Request Lagu + Khusus Admin) with distinct colored buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dedicated Admin Login/Dashboard Button */}
          <button
            onClick={onAdminClick}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-all cursor-pointer border ${
              isAdminLoggedIn
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 shadow-xs'
            }`}
            title={isAdminLoggedIn ? 'Buka Panel Kelola Admin' : 'Masuk Khusus Admin'}
            aria-label="Tombol Masuk Admin"
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden xs:inline sm:inline">Admin</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Admin</span>
              </>
            )}
          </button>

          {/* Request Lagu Button - Colorful Accent */}
          <button
            onClick={onRequestClick}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition-all shadow-sm shadow-amber-500/30 cursor-pointer active:scale-95"
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

