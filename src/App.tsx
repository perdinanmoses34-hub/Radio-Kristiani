import React, { useState, useEffect, useCallback } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AudioPlayerHero } from './components/AudioPlayerHero';
import { LiveChat } from './components/LiveChat';
import { SongHistoryList } from './components/SongHistoryList';
import { ScheduleGuide } from './components/ScheduleGuide';
import { SongRequestModal } from './components/SongRequestModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RadioBossStatus } from './types/radio';
import { fetchRadioStatus, getAdminUser, verifyAdminSession } from './services/api';
import {
  Calendar,
  Music,
  Radio,
  RadioTower,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'chat' | 'schedule' | 'history'>('player');
  const [status, setStatus] = useState<RadioBossStatus | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [prefillRequest, setPrefillRequest] = useState<{ artist: string; title: string }>({
    artist: '',
    title: '',
  });

  // Admin state
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(() => getAdminUser());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

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

  useEffect(() => {
    // Check admin session validity
    verifyAdminSession().then((isValid) => {
      if (!isValid) {
        setAdminUser(null);
      }
    });
  }, []);

  const handleOpenRequestModal = (artist = '', title = '') => {
    setPrefillRequest({ artist, title });
    setIsRequestModalOpen(true);
  };

  const handleAdminClick = () => {
    if (adminUser) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (admin: { email: string; name: string }) => {
    setAdminUser(admin);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 w-full max-w-full overflow-x-hidden relative">
      {/* Clean Top Navigation Bar with Admin Button */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRequestClick={() => handleOpenRequestModal()}
        onAdminClick={handleAdminClick}
        isAdminLoggedIn={!!adminUser}
        stationName={status?.stationName || 'Eklesia Radio'}
      />

      {/* Main Content Area - with mobile bottom nav safe padding (pb-24) */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
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
                    className="group rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
                          <Calendar className="h-3.5 w-3.5" />
                        </span>
                        <span>Acara Siaran</span>
                      </span>
                      <span className="text-amber-600 font-semibold text-[11px] group-hover:underline">Jadwal →</span>
                    </div>
                    <div className="mt-2 pl-0.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {status?.currentShow?.name || 'Renungan Pagi & Pujian Jiwa'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Host: {status?.currentShow?.host || 'Penyiar Studio'}
                      </p>
                    </div>
                  </div>

                  {/* Song History Preview Card */}
                  <div
                    onClick={() => setActiveTab('history')}
                    className="group rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60 shrink-0">
                          <Music className="h-3.5 w-3.5" />
                        </span>
                        <span>Daftar Lagu</span>
                      </span>
                      <span className="text-indigo-600 font-semibold text-[11px] group-hover:underline">Riwayat →</span>
                    </div>
                    <div className="mt-2 pl-0.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        Rotasi & Antrean Request
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Lagu rohani yang baru saja diputar
                      </p>
                    </div>
                  </div>

                  {/* Radio Server Status Card */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs select-none">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0">
                          <RadioTower className="h-3.5 w-3.5" />
                        </span>
                        <span>Status Server</span>
                      </span>
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">Terhubung</span>
                    </div>
                    <div className="mt-2 pl-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          RadioBOSS &amp; Zeno FM
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
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
            <ScheduleGuide
              onOpenAdminSchedule={handleAdminClick}
              isAdminLoggedIn={!!adminUser}
            />
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

      {/* Modal Login Khusus Admin */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal Panel Kelola Admin (Mengatur jadwal, rotasi lagu, dan tampilan) */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
      />

      {/* Clean Light Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-slate-200/90 bg-white py-4 text-xs text-slate-500 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-800">{status?.stationName || 'Eklesia Radio'}</span>
            <span className="text-slate-300">·</span>
            <span>Streaming Online &amp; Otomatisasi RadioBOSS</span>
          </div>

          <div className="flex items-center gap-3.5 text-slate-500">
            <button
              onClick={handleAdminClick}
              className="font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{adminUser ? 'Panel Admin (Aktif)' : 'Portal Masuk Admin'}</span>
            </button>
            <span className="text-slate-300">·</span>
            <span>Audio Latensi Rendah</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Server Connected</span>
            </span>
            <span className="text-slate-300">·</span>
            <span>24 Jam Non-Stop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

