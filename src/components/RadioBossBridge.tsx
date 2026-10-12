import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Radio,
  ExternalLink,
  Save,
  HelpCircle,
  Copy,
  Check,
  Terminal,
  Zap,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RadioBossConfig } from '../types/radio';
import {
  fetchRadioSettings,
  updateRadioSettings,
  testRadioConnection,
  fetchWebhookLogs,
  simulateMetadataPush,
} from '../services/api';

export const RadioBossBridge: React.FC = () => {
  const [config, setConfig] = useState<RadioBossConfig>({
    mode: 'simulation',
    host: '127.0.0.1',
    port: 9000,
    password: '',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    stationName: 'RadioBOSS Stream',
    autoSyncSeconds: 3,
  });

  const [bridgeTab, setBridgeTab] = useState<'webhook' | 'settings' | 'guide'>('webhook');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency: number;
    message?: string;
    error?: string;
    currentSong?: string;
  } | null>(null);

  // Webhook state & logs
  const [webhookLogs, setWebhookLogs] = useState<Array<{
    id: string;
    timestamp: string;
    artist: string;
    title: string;
    raw: string;
    method: string;
  }>>([]);
  const [currentLiveTrack, setCurrentLiveTrack] = useState<any>(null);
  const [isSimulatingPush, setIsSimulatingPush] = useState(false);
  const [simArtist, setSimArtist] = useState('Sheila on 7');
  const [simTitle, setSimTitle] = useState('Sephia');
  const [simSuccess, setSimSuccess] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrlFull = `${appOrigin}/api/radioboss/webhook?artist=%artist&title=%title&album=%album&duration=%duration`;
  const webhookUrlSimple = `${appOrigin}/api/radioboss/webhook?casttitle=%casttitle`;

  const loadSettingsAndLogs = async () => {
    try {
      const [settingsData, logsData] = await Promise.all([
        fetchRadioSettings().catch(() => null),
        fetchWebhookLogs().catch(() => null),
      ]);

      if (settingsData?.config) {
        setConfig((prev) => ({
          ...prev,
          ...settingsData.config,
          password: settingsData.config.password || '',
        }));
      }

      if (logsData) {
        setWebhookLogs(logsData.logs || []);
        setCurrentLiveTrack(logsData.current || null);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
    const interval = setInterval(async () => {
      try {
        const logsData = await fetchWebhookLogs();
        setWebhookLogs(logsData.logs || []);
        setCurrentLiveTrack(logsData.current || null);
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateRadioSettings(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testRadioConnection({
        host: config.host,
        port: config.port,
        password: config.password,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        latency: 0,
        error: err.message || 'Koneksi gagal',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulatePush = async () => {
    if (!simArtist.trim() || !simTitle.trim()) return;
    setIsSimulatingPush(true);
    try {
      await simulateMetadataPush({
        artist: simArtist.trim(),
        title: simTitle.trim(),
        album: 'RadioBOSS Live Broadcast',
        duration: 230,
      });
      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 3000);
      const logsData = await fetchWebhookLogs();
      setWebhookLogs(logsData.logs || []);
      setCurrentLiveTrack(logsData.current || null);
    } catch (err) {
      console.error('Simulate push error:', err);
    } finally {
      setIsSimulatingPush(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 backdrop-blur-xl w-full max-w-full overflow-hidden">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Radio className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                Koneksi RadioBOSS Ultimate 7.1
              </h2>
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 border border-neutral-700 shrink-0">
                v7.1.1.4
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              Stasiun: <strong className="text-neutral-200">{config.stationName}</strong>
            </p>
          </div>
        </div>

        {/* Sub-tab navigation buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-950 p-1 border border-neutral-800 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setBridgeTab('webhook')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              bridgeTab === 'webhook'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Webhook / Push URL
          </button>
          <button
            onClick={() => setBridgeTab('settings')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              bridgeTab === 'settings'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pengaturan Server API
          </button>
          <button
            onClick={() => setBridgeTab('guide')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              bridgeTab === 'guide'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Panduan RadioBOSS
          </button>
        </div>
      </div>

      {/* TAB 1: WEBHOOK & METADATA PUSH (EASIEST & MOST ROBUST FOR BROADCASTERS) */}
      {bridgeTab === 'webhook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Webhook Setup */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  URL Webhook Pembaruan Lagu Real-Time
                </h3>
              </div>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                Salin link ini ke RadioBOSS Anda. Setiap kali lagu berganti (<strong>On track start</strong>), RadioBOSS akan otomatis mengirim metadata lagu ke aplikasi ini tanpa perlu setting IP publik atau port forwarding!
              </p>
            </div>

            {/* Primary Webhook Box */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-300">
                1. Webhook Lengkap (Artis, Judul, Album, Durasi):
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-neutral-950 p-2.5 border border-neutral-800">
                <input
                  type="text"
                  readOnly
                  value={webhookUrlFull}
                  className="flex-1 bg-transparent text-xs font-mono text-amber-300 outline-none select-all truncate"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrlFull, 'full')}
                  className="flex items-center gap-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-xs text-neutral-200 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedUrl === 'full' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <label className="block text-xs font-semibold text-neutral-300 mt-2">
                2. Webhook Alternatif (Format %casttitle):
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-neutral-950 p-2.5 border border-neutral-800">
                <input
                  type="text"
                  readOnly
                  value={webhookUrlSimple}
                  className="flex-1 bg-transparent text-xs font-mono text-neutral-400 outline-none select-all truncate"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrlSimple, 'simple')}
                  className="flex items-center gap-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-xs text-neutral-200 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedUrl === 'simple' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Simulation Card */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Uji Kirim Metadata Lagu (Simulasi RadioBOSS)</span>
                </span>
                <span className="text-[11px] text-neutral-400">Test Update Sekarang</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Nama Artis</label>
                  <input
                    type="text"
                    value={simArtist}
                    onChange={(e) => setSimArtist(e.target.value)}
                    className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Judul Lagu</label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-neutral-500">
                  Klik untuk melihat judul lagu berganti langsung di player & chat!
                </span>
                <button
                  onClick={handleSimulatePush}
                  disabled={isSimulatingPush}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-neutral-950 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isSimulatingPush ? 'Mengirim...' : 'Kirim Uji'}</span>
                </button>
              </div>

              {simSuccess && (
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Metadata berhasil diperbarui! Cek pemutar audio di atas.</span>
                </div>
              )}
            </div>
          </div>

          {/* Webhook Activity Feed */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span>Log Ping Masuk RadioBOSS</span>
              </h3>
              <span className="text-[11px] font-mono tabular-nums text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live Sinkron
              </span>
            </div>

            {/* Currently Active Live Track */}
            {currentLiveTrack && (
              <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                  Metadata Aktif Saat Ini
                </span>
                <div className="mt-1 font-bold text-white text-sm">
                  {currentLiveTrack.artist} - {currentLiveTrack.title}
                </div>
                <div className="mt-0.5 text-neutral-400 text-[11px]">
                  Durasi: {Math.floor(currentLiveTrack.duration / 60)}:
                  {String(currentLiveTrack.duration % 60).padStart(2, '0')} · Album:{' '}
                  {currentLiveTrack.album || 'RadioBOSS'}
                </div>
              </div>
            )}

            {/* History Logs */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2 max-h-[320px] text-xs">
              {webhookLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Menunggu ping metadata pertama dari RadioBOSS atau tombol uji di sebelah kiri.
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-neutral-200">
                        {log.artist} - {log.title}
                      </span>
                      <span className="font-mono tabular-nums text-neutral-500">{log.timestamp}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-neutral-500 truncate">
                      {log.method} · {log.raw}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVER SETTINGS & REMOTE CONTROL API (PULL MODE) */}
      {bridgeTab === 'settings' && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Sliders className="h-4 w-4 text-amber-400" />
            <span>Pengaturan Server & Remote Control RadioBOSS</span>
          </h3>

          <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
            {/* Mode selection */}
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">
                Mode Integrasi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'simulation' })}
                  className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                    config.mode === 'simulation'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-amber-300">Auto-Pilot Simulator + Webhook</div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Memutar rotasi katalog otomatis saat RadioBOSS offline, dan langsung beralih ke lagu RadioBOSS saat webhook diterima.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, mode: 'live' })}
                  className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                    config.mode === 'live'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-emerald-300">Live Remote API Client</div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Server web secara aktif meminta data ke IP PC RadioBOSS Anda pada port 9000 melalui query HTTP.
                  </p>
                </button>
              </div>
            </div>

            {/* Host & Port */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-neutral-300 mb-1">
                  Host / IP Address RadioBOSS (Menu Settings &gt; API)
                </label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="127.0.0.1, IP publik, atau domain"
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Port API RadioBOSS
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value, 10) || 9000 })}
                  placeholder="9000"
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* API Password */}
            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                Password API RadioBOSS
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Password yang diatur pada menu API di RadioBOSS"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Buka RadioBOSS &gt; Settings &gt; API &gt; tentukan Password.
              </span>
            </div>

            {/* Stream URL */}
            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                URL Audio Streaming Siaran (Icecast / Shoutcast / Server Encoder)
              </label>
              <input
                type="url"
                value={config.streamUrl}
                onChange={(e) => setConfig({ ...config, streamUrl: e.target.value })}
                placeholder="http://ip-server:8000/live atau stream URL Anda"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                required
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Diatur pada menu Settings &gt; Broadcast di RadioBOSS. Link audio ini diputar oleh browser pendengar.
              </span>
            </div>

            {/* Station name & Sync interval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Nama Stasiun (Sesuai Station info di RadioBOSS)
                </label>
                <input
                  type="text"
                  value={config.stationName}
                  onChange={(e) => setConfig({ ...config, stationName: e.target.value })}
                  placeholder="RadioBOSS Stream"
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Interval Pembaruan (Detik)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.autoSyncSeconds}
                  onChange={(e) => setConfig({ ...config, autoSyncSeconds: parseInt(e.target.value, 10) || 3 })}
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-semibold text-neutral-200 border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isTesting ? 'Menguji Sambungan...' : 'Uji Koneksi (Test Ping)'}</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-neutral-950 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Pengaturan berhasil disimpan ke sistem server streaming!</span>
              </div>
            )}

            {testResult && (
              <div
                className={`rounded-xl border p-3 text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.success ? testResult.message : 'Koneksi Gagal'}
                  </div>
                  {testResult.success ? (
                    <div className="mt-1 space-y-0.5 text-[11px] text-emerald-400">
                      <div>Latensi respon API: <strong className="font-mono tabular-nums">{testResult.latency} ms</strong></div>
                      {testResult.currentSong && <div>Metadata terdeteksi: {testResult.currentSong}</div>}
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-rose-300/90 leading-relaxed">
                      {testResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 3: VISUAL GUIDE MATCHING THEIR RADIOBOSS 7.1.1.4 SCREENSHOT */}
      {bridgeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Broadcast -> Metadata (Exact match to screenshot) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  1
                </span>
                <span>Broadcast &gt; Metadata (Sesuai Foto)</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-white">
                Format Judul & Nama Stasiun
              </h4>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                Pada tampilan yang Anda kirim:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Station Name: <strong>RadioBOSS Stream</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Title format: <code className="bg-neutral-800 text-amber-300 px-1 rounded font-mono">%artist - %title</code></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Update title: <strong>On track start</strong></span>
                </li>
              </ul>
              <p className="mt-3 text-[11px] text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                💡 Pengaturan format Anda sudah 100% pas! Sistem kami membaca pemisah <code className="text-amber-300 font-mono"> - </code> untuk membagi nama artis dan judul lagu.
              </p>
            </div>
          </div>

          {/* Card 2: Audio Streaming Setup */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  2
                </span>
                <span>Menu 'Broadcast' (Encoder Audio)</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-white">
                Streaming Suara ke Pendengar
              </h4>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                Di panel kiri RadioBOSS tepat di atas <em>Metadata</em>, klik menu <strong>Broadcast</strong>.
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
                <li>• Tambahkan encoder Icecast atau Shoutcast baru.</li>
                <li>• Format audio direkomendasikan: <strong>MP3 128kbps</strong> atau <strong>AAC+ 64kbps</strong>.</li>
                <li>• Salin link output streaming dan tempelkan pada tab <strong>Pengaturan Server API</strong> di aplikasi ini.</li>
              </ul>
              <p className="mt-3 text-[11px] text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                🔊 Setelah URL diisi, tombol Play di aplikasi web akan memutar langsung siaran musik Anda!
              </p>
            </div>
          </div>

          {/* Card 3: API & Web Remote Control */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  3
                </span>
                <span>Menu 'API' (Remote Control)</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-white">
                Request Lagu & Kontrol Siaran
              </h4>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                Di daftar menu sebelah kiri screenshot Anda (di bawah <em>DTMF</em>), klik menu <strong>API</strong>.
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
                <li>• Centang <strong>Enable API</strong>.</li>
                <li>• Port default: <code className="bg-neutral-800 text-amber-300 px-1 rounded font-mono">9000</code>.</li>
                <li>• Buat Password API.</li>
              </ul>
              <p className="mt-3 text-[11px] text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                🎶 Dengan mengaktifkan API, request lagu dari pendengar di web akan langsung diselipkan ke playlist antrean RadioBOSS secara otomatis!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
