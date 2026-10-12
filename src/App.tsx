import React, { useState, useEffect, useCallback } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AudioPlayerHero } from './components/AudioPlayerHero';
import { LiveChat } from './components/LiveChat';
import { SongHistoryList } from './components/SongHistoryList';
import { ScheduleGuide } from './components/ScheduleGuide';
import { SongRequestModal } from './components/SongRequestModal';
import { RadioBossStatus } from './types/radio';
import { fetchRadioStatus } from './services/api';
import {
  Calendar,
  Music,
  Radio,
  RadioTower,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'chat' | 'schedule' | 'history'>('player');
  const [status, setStatus] = useState<RadioBossStatus | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [prefillRequest, setPrefillRequest] = useState<{ artist: string; title: string }>({
    artist: '',
    title: '',
  });

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchRadioStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Status poll error:', err);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    // Poll every 3 seconds for real-time now-playing metadata
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  const handleOpenRequestModal = (artist = '', title = '') => {
    setPrefillRequest({ artist, title });
    setIsRequestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300 w-full max-w-full overflow-x-hidden relative">
      {/* Clean Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRequestClick={() => handleOpenRequestModal()}
        stationName={status?.stationName || 'Eklesia Radio'}
      />

      {/* Main Content Area - with mobile bottom nav safe padding (pb-24) */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 py-3 sm:py-6 pb-24 md:pb-8">
        {/* TAB 1: PLAYER (STUDIO UTAMA & PEMUTAR) */}
        {activeTab === 'player' && (
          <div className="space-y-5">
            {/* Split layout on desktop: Player Left + Live Chat Right */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
              <div className="lg:col-span-8 space-y-4">
                <AudioPlayerHero
                  status={status}
                  onRequestClick={() => handleOpenRequestModal()}
                  onRefreshStatus={loadStatus}
                />

                {/* 3 Quick Preview Cards Below Player */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Current Program Card */}
                  <div
                    onClick={() => setActiveTab('schedule')}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 hover:border-neutral-700 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Acara Siaran</span>
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] group-hover:underline">Jadwal →</span>
                    </div>
                    <div className="mt-1.5">
                      <h3 className="text-sm font-bold text-white truncate">
                        {status?.currentShow?.name || 'Renungan Pagi & Pujian'}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Host: {status?.currentShow?.host || 'Penyiar Studio'}
                      </p>
                    </div>
                  </div>

                  {/* Song History Preview Card */}
                  <div
                    onClick={() => setActiveTab('history')}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 hover:border-neutral-700 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Music className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Daftar Lagu</span>
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] group-hover:underline">Riwayat →</span>
                    </div>
                    <div className="mt-1.5">
                      <h3 className="text-sm font-bold text-white truncate">
                        Rotasi & Antrean Request
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Lagu rohani yang baru saja diputar
                      </p>
                    </div>
                  </div>

                  {/* Radio Server Status Card */}
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 select-none">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <RadioTower className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Status Server</span>
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px]">Terhubung</span>
                    </div>
                    <div className="mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        <h3 className="text-sm font-bold text-white truncate">
                          RadioBOSS &amp; Zeno FM
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Streaming online aktif 24 jam
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Live Listener Chat (Always visible on large screens) */}
              <div className="hidden lg:block lg:col-span-4 w-full">
                <LiveChat onRequestClick={() => handleOpenRequestModal()} />
              </div>
            </div>

            {/* Song History on desktop player view */}
            <div className="hidden sm:block pt-2">
              <SongHistoryList
                onRequestSong={(artist, title) => handleOpenRequestModal(artist, title)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CHAT (OBROLAN & REQUEST PENDENGAR) */}
        {activeTab === 'chat' && (
          <div className="w-full max-w-3xl mx-auto space-y-4">
            <LiveChat onRequestClick={() => handleOpenRequestModal()} />
          </div>
        )}

        {/* TAB 3: SCHEDULE (JADWAL ACARA) */}
        {activeTab === 'schedule' && (
          <div className="w-full max-w-full overflow-hidden">
            <ScheduleGuide />
          </div>
        )}

        {/* TAB 4: HISTORY (DAFTAR LAGU & ANTREAN REQUEST) */}
        {activeTab === 'history' && (
          <div className="w-full max-w-full overflow-hidden">
            <SongHistoryList
              onRequestSong={(artist, title) => handleOpenRequestModal(artist, title)}
            />
          </div>
        )}
      </main>

      {/* Android Mobile Bottom Navigation Bar (Visible only on phone/tablet < md) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Modal Song Request */}
      <SongRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        prefillArtist={prefillRequest.artist}
        prefillTitle={prefillRequest.title}
      />

      {/* Clean Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-neutral-800 bg-neutral-950 py-5 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-neutral-300">{status?.stationName || 'Eklesia Radio'}</span>
            <span>·</span>
            <span>Streaming Online &amp; Otomatisasi RadioBOSS</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Audio Latensi Rendah</span>
            <span>·</span>
            <span>Radio Server Connected</span>
            <span>·</span>
            <span>24 Jam Non-Stop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
