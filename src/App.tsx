import React, { useState, useEffect, useCallback } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { AudioPlayerHero } from './components/AudioPlayerHero';
import { LiveChat } from './components/LiveChat';
import { SongHistoryList } from './components/SongHistoryList';
import { ScheduleGuide } from './components/ScheduleGuide';
import { RadioBossBridge } from './components/RadioBossBridge';
import { SongRequestModal } from './components/SongRequestModal';
import { RadioBossStatus } from './types/radio';
import { fetchRadioStatus } from './services/api';
import {
  Radio,
  Music,
  Calendar,
  MessageSquare,
  Server,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'schedule' | 'history' | 'bridge'>('player');
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* 3-Zone Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRequestClick={() => handleOpenRequestModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {activeTab === 'player' && (
          <div className="space-y-8">
            {/* Desktop 2-column or Mobile stack: Player Hero + Live Listener Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Audio Player Deck */}
              <div className="lg:col-span-8">
                <AudioPlayerHero
                  status={status}
                  onRequestClick={() => handleOpenRequestModal()}
                  onRefreshStatus={loadStatus}
                />

                {/* Quick Info Cards Row */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current Program */}
                  <div
                    onClick={() => setActiveTab('schedule')}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        Jadwal Siaran
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] group-hover:underline">Lihat Semua →</span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {status?.currentShow?.name || 'Sore Santai & Request'}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Host: {status?.currentShow?.host || 'DJ Studio'} ({status?.currentShow?.time || '14:00 - 18:00'})
                      </p>
                    </div>
                  </div>

                  {/* Song History Preview */}
                  <div
                    onClick={() => setActiveTab('history')}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Music className="h-3.5 w-3.5 text-amber-400" />
                        Daftar Lagu
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] group-hover:underline">Riwayat →</span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        Rotasi & Antrean Request
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Lihat track yang baru saja mengudara di radio
                      </p>
                    </div>
                  </div>

                  {/* RadioBOSS Bridge Status */}
                  <div
                    onClick={() => setActiveTab('bridge')}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-amber-400" />
                        RadioBOSS Bridge
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] group-hover:underline">Kelola →</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <h3 className="text-sm font-bold text-white truncate">
                          {status?.mode === 'live' ? 'RadioBOSS Terhubung' : 'Simulator Aktif'}
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        Metadata terupdate otomatis real-time
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Listener Chat & Song Request Bar */}
              <div className="lg:col-span-4">
                <LiveChat onRequestClick={() => handleOpenRequestModal()} />
              </div>
            </div>

            {/* Song History Section on the main view */}
            <div className="pt-4">
              <SongHistoryList
                onRequestSong={(artist, title) => handleOpenRequestModal(artist, title)}
              />
            </div>
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleGuide />}

        {activeTab === 'history' && (
          <SongHistoryList
            onRequestSong={(artist, title) => handleOpenRequestModal(artist, title)}
          />
        )}

        {activeTab === 'bridge' && <RadioBossBridge />}
      </main>

      {/* Song Request Modal */}
      <SongRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        prefillArtist={prefillRequest.artist}
        prefillTitle={prefillRequest.title}
      />

      {/* Clean Footer */}
      <footer className="mt-12 border-t border-neutral-800 bg-neutral-950 py-6 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-neutral-300">RadioBoss Stream Studio</span>
            <span>·</span>
            <span>Sistem Penyiaran Radio & Otomatisasi Terintegrasi</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Latensi Rendah</span>
            <span>·</span>
            <span>RadioBOSS Remote API</span>
            <span>·</span>
            <span>Audio WebStream 24/7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
