import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Play,
  Pause,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Save,
  Radio,
  Smartphone,
  Share2,
  Sparkles,
  Volume2,
  MessageCircle,
  HelpCircle,
  RadioTower,
  RefreshCw,
} from 'lucide-react';
import { parseZenoInput } from '../services/api';
import { RadioBossConfig } from '../types/radio';

export const RadioBossBridge: React.FC = () => {
  const [zenoInput, setZenoInput] = useState(() => {
    return localStorage.getItem('zeno_station_url') || 'https://stream.zeno.fm/60otus84tj7tv';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('radio_whatsapp') || '081234567890';
  });
  const [stationName, setStationName] = useState(() => {
    return localStorage.getItem('radio_station_name') || 'Eklesia Radio (Radio Kristiani)';
  });

  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [testAudioError, setTestAudioError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Audio ref for live test button
  const testAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Parse current input
  const parsed = parseZenoInput(zenoInput);

  // Construct mobile shareable link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const mobileShareUrl = `${currentOrigin}?stream=${encodeURIComponent(parsed.streamUrl)}&station=${encodeURIComponent(stationName)}`;

  useEffect(() => {
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current.src = '';
      }
    };
  }, []);

  const handleToggleTestAudio = async () => {
    if (isTestingAudio) {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
      setIsTestingAudio(false);
      return;
    }

    setTestAudioError(null);
    try {
      if (!testAudioRef.current) {
        testAudioRef.current = new Audio();
      }
      const audio = testAudioRef.current;
      audio.src = `${parsed.streamUrl}?test=${Date.now()}`;
      await audio.play();
      setIsTestingAudio(true);
    } catch (err: any) {
      setIsTestingAudio(false);
      setTestAudioError('Tidak dapat memutar suara dari link ini. Pastikan penyiaran di RadioBOSS & Zeno FM sedang aktif.');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setZenoInput(text.trim());
        }
      }
    } catch {
      // clipboard permission denied
    }
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanZeno = zenoInput.trim();
    localStorage.setItem('zeno_station_url', cleanZeno);
    localStorage.setItem('radio_whatsapp', whatsappNumber.trim());
    localStorage.setItem('radio_station_name', stationName.trim());

    // Update radio_config object in localStorage
    try {
      const existing = localStorage.getItem('radio_config');
      const cfg: RadioBossConfig = existing ? JSON.parse(existing) : {
        mode: 'simulation',
        host: '127.0.0.1',
        port: 9000,
        streamUrl: parsed.streamUrl,
        stationName: stationName.trim(),
        autoSyncSeconds: 3,
      };
      cfg.streamUrl = parsed.streamUrl;
      cfg.zenoStationUrl = cleanZeno;
      cfg.stationName = stationName.trim();
      cfg.whatsappNumber = whatsappNumber.trim();
      localStorage.setItem('radio_config', JSON.stringify(cfg));
    } catch {
      // ignore
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(label);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleUsePreset = (url: string, name: string) => {
    setZenoInput(url);
    setStationName(name);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 shadow-lg">
              <LinkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Pengaturan Link Zeno FM
                </h1>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Cukup tempelkan link live dari Zeno FM. Server audio di-handle oleh RadioBOSS &amp; Zeno FM.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSaveSettings()}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-neutral-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0 active:scale-95"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CARD 1: TEMPELKAN LINK STREAMING ZENO FM */}
      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <RadioTower className="h-5 w-5 text-amber-400" />
            <span>Tempelkan Link Siaran Zeno FM</span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Mendukung semua format link Zeno FM
          </span>
        </div>

        <form onSubmit={(e) => handleSaveSettings(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              URL Stream / Halaman Stasiun Zeno FM <span className="text-amber-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={zenoInput}
                  onChange={(e) => setZenoInput(e.target.value)}
                  placeholder="Contoh: https://stream.zeno.fm/60otus84tj7tv atau https://zeno.fm/radio/eklesia-radio"
                  required
                  className="w-full rounded-2xl bg-neutral-950 border border-neutral-700/80 px-4 py-3 text-sm text-white font-mono placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-3 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                  title="Tempel dari Clipboard"
                >
                  <Copy className="h-4 w-4 text-amber-400" />
                  <span>Tempel</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleTestAudio}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                    isTestingAudio
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700'
                  }`}
                  title="Uji Putar Suara Stream"
                >
                  {isTestingAudio ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Hentikan Uji</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Uji Suara</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs font-bold text-neutral-950 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {saveSuccess ? 'Tersimpan!' : 'Simpan Link'}
                </button>
              </div>
            </div>

            {testAudioError && (
              <p className="mt-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                {testAudioError}
              </p>
            )}
          </div>

          {/* Auto-Detection Status Card */}
          <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-semibold text-neutral-300">Hasil Analisis Tautan Zeno FM:</span>
              <span className="font-mono text-amber-400 text-[11px]">
                {parsed.type === 'stream' ? 'Stream Audio Langsung' : parsed.type === 'station' ? 'Stasiun Zeno FM' : 'Kode Mount'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded-xl bg-neutral-900 p-2.5 border border-neutral-800/80">
                <span className="text-neutral-500 block text-[10px]">URL Audio Stream (Diputar oleh Aplikasi):</span>
                <span className="text-amber-300 truncate block mt-0.5">{parsed.streamUrl}</span>
              </div>
              <div className="rounded-xl bg-neutral-900 p-2.5 border border-neutral-800/80">
                <span className="text-neutral-500 block text-[10px]">URL Widget Player Resmi Zeno:</span>
                <span className="text-neutral-300 truncate block mt-0.5">{parsed.embedUrl}</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
              Pilihan Contoh Cepat (Klik untuk mencoba):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUsePreset('https://stream.zeno.fm/60otus84tj7tv', 'Eklesia Radio (Radio Kristiani)')}
                className="rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                📻 Stream Zeno Default (Eklesia Radio)
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('https://zeno.fm/radio/eklesia-radio', 'Radio Kristiani')}
                className="rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                🌐 Format Web Zeno (/radio/eklesia-radio)
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* CARD 2: TAUTAN KHUSUS UNTUK HANDPHONE & PENDENGAR */}
      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Smartphone className="h-5 w-5 text-amber-400" />
            <span>Link Siap Pakai untuk Buka di Handphone</span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Langsung memutar Zeno FM di HP
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Gunakan tautan di bawah ini untuk membuka aplikasi di HP Anda atau membagikannya ke jemaat dan pendengar setia:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={mobileShareUrl}
            className="flex-1 rounded-2xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-xs text-amber-300 font-mono select-all focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(mobileShareUrl, 'mobile_url')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-3 text-xs font-bold text-neutral-950 transition-colors cursor-pointer"
            >
              {copiedLink === 'mobile_url' ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin Link HP</span>
                </>
              )}
            </button>

            <a
              href={mobileShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-3 text-xs font-semibold text-white transition-colors cursor-pointer"
              title="Buka di tab baru"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Buka</span>
            </a>
          </div>
        </div>
      </section>

      {/* CARD 3: PENGATURAN RADIO & WHATSAPP OPERATOR */}
      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            <span>Kontak WhatsApp Operator / Studio Radio</span>
          </div>
          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Untuk menerima request lagu langsung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Nama Stasiun Radio
            </label>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="Contoh: Eklesia Radio (Radio Kristiani)"
              className="w-full rounded-2xl bg-neutral-950 border border-neutral-700 px-3.5 py-2.5 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Nomor WhatsApp Operator / DJ (Menerima Request Lagu)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-2xl bg-neutral-950 border border-neutral-700 px-3.5 py-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Saat pendengar request lagu, mereka bisa langsung klik tombol &quot;Kirim ke WhatsApp Operator&quot; sehingga lagu masuk ke chat Anda saat membuka RadioBOSS.
            </p>
          </div>
        </div>
      </section>

      {/* CARD 4: PANDUAN 3 LANGKAH RADIOBOSS KE ZENO FM */}
      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            <span>Panduan 3 Langkah Menghubungkan RadioBOSS ke Aplikasi Ini</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs">1</span>
              <span>Di RadioBOSS (Laptop)</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Buka menu <strong>Settings</strong> &gt; <strong>Broadcast</strong>. Tambahkan encoder Icecast/Shoutcast dengan data dari Zeno FM (Server, Port, Mount, Password). Centang <em>Broadcasting enabled</em>.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs">2</span>
              <span>Di Akun Zeno FM (Cloud)</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Buka stasiun Anda di Zeno FM, lalu salin <strong>Stream URL</strong> (contoh: <code className="text-amber-300 font-mono">https://stream.zeno.fm/xxxx</code>) atau link stasiun Anda.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs">3</span>
              <span>Di Aplikasi Ini</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Tempelkan link dari Zeno FM pada kolom di atas, lalu klik <strong>Simpan Link</strong>. Aplikasi ini akan otomatis memutar siaran Anda di HP dan laptop tanpa server lokal!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
