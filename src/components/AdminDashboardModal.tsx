import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Music,
  Sliders,
  Radio,
  Plus,
  Trash2,
  Save,
  Play,
  RotateCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Smartphone,
  Eye,
  User,
} from 'lucide-react';
import { RadioShow } from '../types/radio';
import {
  adminFetchSchedule,
  adminSaveSchedule,
  adminFetchSongs,
  adminAddSong,
  adminDeleteSong,
  adminPlaySongNow,
  adminUpdateDisplay,
  fetchRadioSettings,
  logoutAdmin,
  DEFAULT_ZENO_STREAM_URL,
} from '../services/api';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: { email: string; name: string } | null;
  onLogout: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'songs' | 'display' | 'radioboss'>('schedule');

  // Schedule state
  const [scheduleList, setScheduleList] = useState<RadioShow[]>([]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // New Show Form state
  const [newShowName, setNewShowName] = useState('');
  const [newShowHost, setNewShowHost] = useState('');
  const [newShowTime, setNewShowTime] = useState('');
  const [newShowDesc, setNewShowDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Song catalog & rotation state
  const [songList, setSongList] = useState<any[]>([]);
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongAlbum, setNewSongAlbum] = useState('');
  const [newSongDuration, setNewSongDuration] = useState('240');
  const [songActionMessage, setSongActionMessage] = useState<string | null>(null);

  // Display Settings state
  const [stationName, setStationName] = useState('Eklesia Radio');
  const [streamUrl, setStreamUrl] = useState(DEFAULT_ZENO_STREAM_URL);
  const [whatsappNumber, setWhatsappNumber] = useState('081234567890');
  const [displaySuccess, setDisplaySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [sched, songsData, settingsData] = await Promise.all([
        adminFetchSchedule(),
        adminFetchSongs(),
        fetchRadioSettings(),
      ]);
      setScheduleList(sched || []);
      setSongList(songsData.songs || []);
      if (settingsData?.config) {
        setStationName(settingsData.config.stationName || 'Eklesia Radio');
        setStreamUrl(settingsData.config.streamUrl || DEFAULT_ZENO_STREAM_URL);
        if (settingsData.config.whatsappNumber) {
          setWhatsappNumber(settingsData.config.whatsappNumber);
        }
      }
    } catch (e) {
      console.warn('Error loading admin initial data:', e);
    }
  };

  if (!isOpen) return null;

  // Handle Schedule actions
  const handleSaveAllSchedule = async () => {
    setIsSavingSchedule(true);
    setScheduleSuccess(null);
    try {
      const res = await adminSaveSchedule(scheduleList);
      setScheduleSuccess(res.message || 'Jadwal berhasil disimpan untuk seluruh pengguna!');
      setTimeout(() => setScheduleSuccess(null), 4000);
    } catch (err: any) {
      alert('Gagal menyimpan jadwal: ' + err.message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleAddShow = () => {
    if (!newShowName.trim() || !newShowTime.trim()) {
      alert('Mohon isi nama acara dan jam tayang.');
      return;
    }

    const newShow: RadioShow = {
      id: `show-${Date.now()}`,
      name: newShowName.trim(),
      host: newShowHost.trim() || 'Penyiar Studio',
      time: newShowTime.trim(),
      description: newShowDesc.trim() || 'Program rohani pilihan untuk pendengar setia.',
    };

    setScheduleList([...scheduleList, newShow]);
    setNewShowName('');
    setNewShowHost('');
    setNewShowTime('');
    setNewShowDesc('');
    setShowAddForm(false);
  };

  const handleDeleteShow = (id: string) => {
    if (confirm('Hapus program acara ini dari jadwal siaran?')) {
      setScheduleList(scheduleList.filter((s) => s.id !== id));
    }
  };

  const handleUpdateShowField = (id: string, field: keyof RadioShow, val: string) => {
    setScheduleList(
      scheduleList.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Handle Song actions
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongArtist.trim() || !newSongTitle.trim()) return;

    try {
      const res = await adminAddSong({
        artist: newSongArtist.trim(),
        title: newSongTitle.trim(),
        album: newSongAlbum.trim() || 'Pujian Rohani',
        duration: parseInt(newSongDuration, 10) || 240,
      });
      setSongActionMessage(res.message);
      setNewSongArtist('');
      setNewSongTitle('');
      setNewSongAlbum('');
      const updated = await adminFetchSongs();
      setSongList(updated.songs || []);
      setTimeout(() => setSongActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSong = async (idx: number) => {
    if (confirm('Hapus lagu ini dari rotasi lagu?')) {
      try {
        const res = await adminDeleteSong(idx);
        setSongActionMessage(res.message);
        const updated = await adminFetchSongs();
        setSongList(updated.songs || []);
        setTimeout(() => setSongActionMessage(null), 3000);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handlePlaySongNow = async (song: any) => {
    try {
      const res = await adminPlaySongNow({
        artist: song.artist,
        title: song.title,
        album: song.album,
        duration: song.duration,
      });
      setSongActionMessage(res.message);
      setTimeout(() => setSongActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Display settings action
  const handleSaveDisplaySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisplaySuccess(null);
    try {
      const res = await adminUpdateDisplay({
        stationName,
        streamUrl,
        whatsappNumber,
      });
      setDisplaySuccess(res.message || 'Pengaturan tampilan berhasil diperbarui.');
      setTimeout(() => setDisplaySuccess(null), 4000);
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan tampilan: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Admin */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Panel Admin Studio Eklesia
                </h2>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  ADMIN AKTIF
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Login sebagai: <span className="text-neutral-200 font-mono">{adminUser?.email || 'tn.timbu@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logoutAdmin();
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-neutral-800 bg-neutral-950/40 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'schedule'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Kelola Jadwal Siaran ({scheduleList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('songs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'songs'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music className="h-4 w-4" />
            <span>Kelola Lagu &amp; Rotasi ({songList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'display'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Pengaturan Tampilan Aplikasi</span>
          </button>

          <button
            onClick={() => setActiveTab('radioboss')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'radioboss'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>Panduan RadioBOSS &amp; Zeno</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SCHEDULE MANAGEMENT */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Jadwal Program Siaran</h3>
                  <p className="text-xs text-neutral-400">
                    Atur nama acara, waktu tayang, dan penyiar. Perubahan akan langsung terlihat di tab &quot;Jadwal Acara&quot; seluruh pengguna.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-400" />
                    <span>{showAddForm ? 'Batal Tambah' : 'Tambah Acara'}</span>
                  </button>
                  <button
                    onClick={handleSaveAllSchedule}
                    disabled={isSavingSchedule}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSavingSchedule ? 'Menyimpan...' : 'Simpan Semua Jadwal'}</span>
                  </button>
                </div>
              </div>

              {scheduleSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              {/* Add Show Form */}
              {showAddForm && (
                <div className="rounded-2xl border border-amber-500/40 bg-neutral-950 p-4 space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Formulir Tambah Acara Baru
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Nama Acara / Program
                      </label>
                      <input
                        type="text"
                        value={newShowName}
                        onChange={(e) => setNewShowName(e.target.value)}
                        placeholder="Contoh: Renungan Fajar"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Nama Penyiar / Host
                      </label>
                      <input
                        type="text"
                        value={newShowHost}
                        onChange={(e) => setNewShowHost(e.target.value)}
                        placeholder="Contoh: Pdt. Maria"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Jam Tayang (WIB)
                      </label>
                      <input
                        type="text"
                        value={newShowTime}
                        onChange={(e) => setNewShowTime(e.target.value)}
                        placeholder="05:00 - 07:00 WIB"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Deskripsi Acara
                    </label>
                    <input
                      type="text"
                      value={newShowDesc}
                      onChange={(e) => setNewShowDesc(e.target.value)}
                      placeholder="Penjelasan singkat tema acara..."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddShow}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                    >
                      Tambahkan ke Daftar
                    </button>
                  </div>
                </div>
              )}

              {/* Schedule List */}
              <div className="space-y-3">
                {scheduleList.map((show, idx) => (
                  <div
                    key={show.id || idx}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-800 text-[11px] font-bold text-amber-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={show.name}
                          onChange={(e) => handleUpdateShowField(show.id, 'name', e.target.value)}
                          className="bg-transparent font-bold text-sm text-white focus:outline-none border-b border-transparent focus:border-amber-500"
                          title="Ubah nama acara"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteShow(show.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus acara ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">
                          Waktu Siaran
                        </span>
                        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                          <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={show.time}
                            onChange={(e) => handleUpdateShowField(show.id, 'time', e.target.value)}
                            className="bg-transparent w-full text-neutral-200 focus:outline-none font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">
                          Penyiar / Host
                        </span>
                        <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                          <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={show.host}
                            onChange={(e) => handleUpdateShowField(show.id, 'host', e.target.value)}
                            className="bg-transparent w-full text-neutral-200 focus:outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">
                        Deskripsi Acara
                      </span>
                      <input
                        type="text"
                        value={show.description || ''}
                        onChange={(e) => handleUpdateShowField(show.id, 'description', e.target.value)}
                        className="w-full bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                        placeholder="Deskripsi singkat acara..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SONGS & ROTATION MANAGEMENT */}
          {activeTab === 'songs' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <h3 className="text-sm font-bold text-white">Kelola Rotasi Lagu &amp; Siaran Langsung</h3>
                <p className="text-xs text-neutral-400">
                  Admin dapat menambahkan lagu baru, menghapus lagu, atau langsung memutar (*Play Now*) lagu tertentu untuk seluruh pengguna radio.
                </p>
              </div>

              {songActionMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{songActionMessage}</span>
                </div>
              )}

              {/* Add Song Form */}
              <form onSubmit={handleAddSong} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Tambah Lagu Baru ke Rotasi Radio</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Penyanyi / Artis *
                    </label>
                    <input
                      type="text"
                      value={newSongArtist}
                      onChange={(e) => setNewSongArtist(e.target.value)}
                      required
                      placeholder="Contoh: NDC Worship"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Judul Lagu *
                    </label>
                    <input
                      type="text"
                      value={newSongTitle}
                      onChange={(e) => setNewSongTitle(e.target.value)}
                      required
                      placeholder="Contoh: Waktu Tuhan"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Album / Label
                    </label>
                    <input
                      type="text"
                      value={newSongAlbum}
                      onChange={(e) => setNewSongAlbum(e.target.value)}
                      placeholder="Contoh: Purify"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      Durasi (detik)
                    </label>
                    <input
                      type="number"
                      value={newSongDuration}
                      onChange={(e) => setNewSongDuration(e.target.value)}
                      placeholder="240"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    + Tambahkan Lagu ke Daftar
                  </button>
                </div>
              </form>

              {/* Songs Table */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Daftar Lagu di Rotasi ({songList.length} Lagu)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Klik tombol &quot;Putar Sekarang&quot; untuk langsung menampilkan lagu di pemutar pengguna
                  </span>
                </div>
                <div className="divide-y divide-neutral-800/80">
                  {songList.map((song, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-neutral-500 w-5 shrink-0 text-center">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {song.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">
                            {song.artist} {song.album ? `· ${song.album}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <button
                          type="button"
                          onClick={() => handlePlaySongNow(song)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                          title="Langsung putar lagu ini di aplikasi semua pendengar"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Putar Sekarang (On Air)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSong(idx)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus lagu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPLAY SETTINGS */}
          {activeTab === 'display' && (
            <form onSubmit={handleSaveDisplaySettings} className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <h3 className="text-sm font-bold text-white">Pengaturan Tampilan Aplikasi untuk Pengguna</h3>
                <p className="text-xs text-neutral-400">
                  Sesuaikan nama stasiun radio dan konfigurasi streaming tanpa perlu mengubah kode sumber.
                </p>
              </div>

              {displaySuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{displaySuccess}</span>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nama Stasiun Radio (Muncul di Header &amp; Pemutar)
                  </label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    required
                    placeholder="Eklesia Radio (Radio Kristiani)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Nama ini tampil di navigasi atas, pemutar audio, dan tab browser pendengar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    URL Streaming Zeno FM (Permanen Default)
                  </label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    required
                    placeholder="https://stream.zeno.fm/60otus84tj7tv"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Default aktif: <span className="font-mono text-amber-400">https://stream.zeno.fm/60otus84tj7tv</span> (Tautan ini tersembunyi dari pendengar biasa).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nomor WhatsApp Radio (Untuk Request Pendengar)
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    Simpan Tampilan Baru
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: RADIOBOSS GUIDE */}
          {activeTab === 'radioboss' && (
            <div className="space-y-4 text-xs text-neutral-300">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <h3 className="text-sm font-bold text-white mb-1">
                  Arsitektur Siaran: RadioBOSS → Zeno.FM → Aplikasi Eklesia
                </h3>
                <p className="text-neutral-400">
                  Berikut ringkasan bagaimana lagu dari laptop/komputer Anda dipancarkan ke seluruh pengguna handphone:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Langkah 1: Komputer Studio</span>
                  <h4 className="text-sm font-bold text-white">RadioBOSS Playout</h4>
                  <p className="text-neutral-400 text-[11px]">
                    Memutar lagu-lagu pujian dari koleksi komputer lokal Anda sesuai jadwal dan rotasi otomatis.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Langkah 2: Cloud Relay</span>
                  <h4 className="text-sm font-bold text-white">Zeno FM Server</h4>
                  <p className="text-neutral-400 text-[11px]">
                    Menerima encoder Icecast/Shoutcast dari RadioBOSS dan menyebarkannya via URL streaming resmi: <span className="font-mono text-amber-300">60otus84tj7tv</span>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Langkah 3: Pengguna / Pendengar</span>
                  <h4 className="text-sm font-bold text-white">Aplikasi Radio Eklesia</h4>
                  <p className="text-neutral-400 text-[11px]">
                    Pendengar cukup membuka web di handphone atau laptop dan menekan Putar. Tautan zeno terpasang otomatis dan tersembunyi.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <h4 className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Kredensial Admin Eklesia Radio</span>
                </h4>
                <p className="text-[11px] text-neutral-300">
                  Username: <strong className="text-white font-mono">tn.timbu@gmail.com</strong> | Password: <strong className="text-white font-mono">Eklesia_030918*</strong>. Anda dapat mengelola jadwal siaran dan rotasi lagu kapan saja dari perangkat manapun dengan menekan tombol **Admin** di pojok atas aplikasi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
