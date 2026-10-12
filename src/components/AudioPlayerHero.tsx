import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Disc3,
  Heart,
  Flame,
  Music,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Check,
  Share2,
  Moon,
  Copy,
  RadioTower,
  Smartphone,
} from 'lucide-react';
import { RadioBossStatus } from '../types/radio';
import { AudioVisualizer } from './AudioVisualizer';
import { sendChatReaction, parseZenoInput } from '../services/api';
import { stationHeroCover } from '../assets/images';

interface AudioPlayerHeroProps {
  status: RadioBossStatus | null;
  onRequestClick: () => void;
  onRefreshStatus: () => void;
}

export const AudioPlayerHero: React.FC<AudioPlayerHeroProps> = ({
  status,
  onRequestClick,
  onRefreshStatus,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [quality, setQuality] = useState<'64' | '128' | '320'>('128');
  const [isLowLatency, setIsLowLatency] = useState<boolean>(true);

  // Player Mode: 'custom' (Studio HD player with visualizer) or 'zeno_embed' (Official Zeno FM live widget player)
  const [playerMode, setPlayerMode] = useState<'custom' | 'zeno_embed'>('custom');

  // Zeno FM URL settings state
  const [zenoUrlInput, setZenoUrlInput] = useState(() => {
    return localStorage.getItem('zeno_station_url') || 'https://stream.zeno.fm/f3wvbbqmdg8uv';
  });
  const [showZenoModal, setShowZenoModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sleep Timer state (minutes)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const [reactions, setReactions] = useState<{ heart: number; fire: number; clap: number; music: number }>({
    heart: 320,
    fire: 145,
    clap: 210,
    music: 280,
  });
  const [activeReactionPulse, setActiveReactionPulse] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<any>(null);

  const currentTrack = status?.currentTrack;
  const currentShow = status?.currentShow;

  // Parse current Zeno URL
  const parsedZeno = parseZenoInput(zenoUrlInput);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = currentTrack && currentTrack.duration > 0
    ? Math.min(100, Math.max(0, ((currentTrack.pos || 0) / currentTrack.duration) * 100))
    : 0;

  // Manage Audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => {
        setIsBuffering(false);
        setIsPlaying(true);
        setAudioError(null);
      });
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('error', () => {
        setIsBuffering(false);
        setIsPlaying(false);
        setAudioError('Stream audio sedang menghubungkan ke server Zeno FM...');
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerMinutes && sleepTimerMinutes > 0) {
      setSleepTimerRemaining(sleepTimerMinutes * 60);
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);

      sleepTimerRef.current = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(sleepTimerRef.current);
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            setSleepTimerMinutes(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSleepTimerRemaining(null);
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    }

    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimerMinutes]);

  // Handle Play/Pause toggle
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      setIsBuffering(true);

      const targetStream = parsedZeno.streamUrl;
      const finalUrl = isLowLatency ? `${targetStream}?cb=${Date.now()}` : targetStream;

      if (audio.src !== finalUrl) {
        audio.src = finalUrl;
        audio.load();
      }

      try {
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err: any) {
        console.warn('Audio play failed:', err);
        setIsBuffering(false);
        setIsPlaying(false);
        setAudioError('Ketuk tombol putar sekali lagi untuk mengaktifkan siaran Zeno FM di browser Anda.');
      }
    }
  };

  const handleSaveZenoUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = zenoUrlInput.trim();
    localStorage.setItem('zeno_station_url', cleanUrl);

    // Save to radio_config
    try {
      const existing = localStorage.getItem('radio_config');
      const cfg = existing ? JSON.parse(existing) : {};
      cfg.streamUrl = parsedZeno.streamUrl;
      cfg.zenoStationUrl = cleanUrl;
      localStorage.setItem('radio_config', JSON.stringify(cfg));
    } catch {
      // ignore
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowZenoModal(false);
    }, 1500);

    // If audio is currently playing, reload new stream
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      const targetStream = parsedZeno.streamUrl;
      audioRef.current.src = `${targetStream}?cb=${Date.now()}`;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }

    onRefreshStatus();
  };

  const handleReaction = async (type: 'heart' | 'fire' | 'clap' | 'music') => {
    setActiveReactionPulse(type);
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    try {
      const updated = await sendChatReaction(type);
      setReactions((prev) => ({ ...prev, ...updated }));
    } catch {
      // optimistic
    }
    setTimeout(() => setActiveReactionPulse(null), 600);
  };

  const handleShare = async () => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const shareUrl = `${currentOrigin}?stream=${encodeURIComponent(parsedZeno.streamUrl)}`;
    const shareData = {
      title: 'Dengarkan Eklesia Radio - Streaming Online',
      text: 'Mari dengarkan siaran lagu rohani & renungan di Eklesia Radio!',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or failed, fallback to copy
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-6 lg:p-7 backdrop-blur-xl shadow-2xl">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-600/10 blur-3xl" />

      {/* QUICK ZENO FM STREAM BAR (Prominent on top) */}
      <div className="relative z-10 mb-4 rounded-2xl bg-neutral-950 p-2.5 sm:p-3 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'animate-ping bg-emerald-400' : 'bg-neutral-500'}`} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
          </span>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
            Zeno FM Live
          </span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="text-[11px] font-mono text-neutral-300 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
            {parsedZeno.streamUrl}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowZenoModal(true)}
            className="flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 text-xs transition-all cursor-pointer shadow-sm active:scale-95"
            title="Ganti / Tempel Link Zeno FM"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Tempel Link Zeno</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Mode Selector & Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] sm:text-xs font-bold tracking-wider text-neutral-200 uppercase truncate">
            {isPlaying ? 'ON AIR MENGUDARA' : 'STREAM AKTIF'}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-[11px] font-semibold text-neutral-400 truncate">
            Server: RadioBOSS &amp; Zeno FM
          </span>
        </div>

        {/* Player Mode Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
            <button
              onClick={() => setPlayerMode('custom')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                playerMode === 'custom'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pemutar Studio
            </button>
            <button
              onClick={() => {
                if (isPlaying && audioRef.current) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
                setPlayerMode('zeno_embed');
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                playerMode === 'zeno_embed'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Widget Resmi Zeno
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1.5 text-xs text-neutral-300 transition-colors cursor-pointer shrink-0"
            title="Bagikan Tautan Radio"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">Bagikan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* POPUP MODAL: TEMPEL LINK ZENO FM */}
      {showZenoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-neutral-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tempelkan Link Siaran Zeno FM</h3>
                  <p className="text-xs text-neutral-400">Hubungkan server RadioBOSS Anda via Zeno FM</p>
                </div>
              </div>
              <button
                onClick={() => setShowZenoModal(false)}
                className="rounded-xl p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveZenoUrl} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1.5">
                  URL Stream atau Link Stasiun Zeno FM:
                </label>
                <input
                  type="text"
                  value={zenoUrlInput}
                  onChange={(e) => setZenoUrlInput(e.target.value)}
                  placeholder="https://stream.zeno.fm/f3wvbbqmdg8uv atau https://zeno.fm/radio/..."
                  required
                  className="w-full rounded-2xl bg-neutral-950 border border-neutral-700 px-3.5 py-3 font-mono text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Parsed Preview */}
              <div className="rounded-2xl bg-neutral-950 p-3.5 border border-neutral-800 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>URL Audio Siaran yang Diputar:</span>
                  <span className="text-amber-400 font-bold">{parsedZeno.type.toUpperCase()}</span>
                </div>
                <div className="font-mono text-amber-300 truncate">
                  {parsedZeno.streamUrl}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">Coba Contoh Link:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZenoUrlInput('https://stream.zeno.fm/f3wvbbqmdg8uv')}
                    className="rounded-lg bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 px-2.5 py-1 text-[11px] text-neutral-300 transition-colors cursor-pointer"
                  >
                    Stream Eklesia Radio
                  </button>
                  <button
                    type="button"
                    onClick={() => setZenoUrlInput('https://zeno.fm/radio/eklesia-radio')}
                    className="rounded-lg bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 px-2.5 py-1 text-[11px] text-neutral-300 transition-colors cursor-pointer"
                  >
                    Halaman Web Zeno
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowZenoModal(false)}
                  className="rounded-xl px-4 py-2.5 font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 font-bold text-neutral-950 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {saveSuccess ? 'Tersimpan!' : 'Simpan & Putar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODE 1: OFFICIAL ZENO.FM LIVE EMBED WIDGET PLAYER */}
      {playerMode === 'zeno_embed' ? (
        <div className="relative z-10 mt-4 space-y-3">
          <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-950 shadow-xl p-1">
            <iframe
              src={parsedZeno.embedUrl}
              title="Eklesia Radio Zeno FM Live Player"
              width="100%"
              height="220"
              frameBorder="0"
              scrolling="no"
              className="w-full rounded-xl"
              allow="autoplay"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Widget resmi Zeno FM aktif (Memutar siaran RadioBOSS Anda)</span>
            </div>
            <a
              href={zenoUrlInput}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Buka di Zeno.FM</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        /* MODE 2: CUSTOM STUDIO HD PLAYER DECK */
        <div className="relative z-10 mt-4 sm:mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
          {/* Album Artwork & Contained Vinyl Disc */}
          <div className="flex items-center justify-center lg:col-span-4">
            <div className="relative flex items-center justify-center max-w-full">
              {/* Spinning vinyl disc peek */}
              <div
                className={`hidden sm:block absolute -right-4 h-44 w-44 lg:h-52 lg:w-52 rounded-full bg-neutral-950 p-2 shadow-2xl transition-transform duration-700 border border-neutral-700/60 pointer-events-none ${
                  isPlaying ? 'translate-x-5 rotate-180 animate-[spin_10s_linear_infinite]' : 'translate-x-0'
                }`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full border border-neutral-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black">
                  <Disc3 className="h-10 w-10 text-amber-500/80" />
                </div>
              </div>

              {/* Front Album Card */}
              <div className="relative z-10 h-44 w-44 sm:h-48 sm:w-48 lg:h-56 lg:w-56 overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-800 shadow-2xl shrink-0">
                <img
                  src={currentTrack?.albumArt || stationHeroCover}
                  alt={currentTrack?.title || 'Eklesia Radio Live'}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = stationHeroCover;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

                {/* Quality badge overlay */}
                <div className="absolute top-2 left-2 rounded bg-neutral-950/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-400 backdrop-blur-sm border border-neutral-800">
                  {quality}k HD
                </div>

                {/* Visualizer overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                  <AudioVisualizer isPlaying={isPlaying} barCount={20} height={26} />
                </div>
              </div>
            </div>
          </div>

          {/* Track Metadata & Program Info */}
          <div className="flex flex-col justify-between lg:col-span-8 min-w-0">
            <div>
              {/* Show / Program Kicker */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-neutral-400">
                <span className="font-semibold text-amber-400 truncate max-w-[200px] sm:max-w-none">
                  {currentShow?.name || 'Eklesia Radio Siaran Rohani'}
                </span>
                <span>·</span>
                <span className="truncate max-w-[140px] sm:max-w-none">Host: {currentShow?.host || 'Studio'}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline font-mono tabular-nums text-neutral-400">{currentShow?.time || 'Live 24 Jam'}</span>
              </div>

              {/* Song Title & Artist */}
              <h1 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white line-clamp-2 break-words">
                {currentTrack?.title || 'Eklesia Radio Live Broadcast'}
              </h1>
              <p className="mt-0.5 text-sm sm:text-base font-semibold text-neutral-300 truncate">
                {currentTrack?.artist || 'RadioBOSS Playout & Zeno FM'}
              </p>

              {/* Metadata tags */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-400">
                {currentTrack?.album && <span className="truncate max-w-[180px]">Album: <strong className="text-neutral-200">{currentTrack.album}</strong></span>}
                {currentTrack?.genre && <span>· <span className="text-neutral-300">{currentTrack.genre}</span></span>}
                {currentTrack?.bpm && <span>· <span className="font-mono tabular-nums text-neutral-300">{currentTrack.bpm} BPM</span></span>}
              </div>
            </div>

            {/* Progress Bar Timeline */}
            <div className="mt-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-400">
                <span>{formatTime(currentTrack?.pos || 0)}</span>
                <span className="text-neutral-500 text-[10px]">Live Audio Timeline</span>
                <span>{formatTime(currentTrack?.duration || 240)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/70">
              <div className="flex items-center gap-3">
                {/* Primary Play Button */}
                <button
                  onClick={togglePlay}
                  disabled={isBuffering}
                  className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-75 cursor-pointer shrink-0"
                  aria-label={isPlaying ? 'Jeda Siaran' : 'Putar Audio Radio'}
                >
                  {isBuffering ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4.5 w-4.5 text-neutral-500" />
                    ) : (
                      <Volume2 className="h-4.5 w-4.5 text-neutral-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-amber-500"
                    aria-label="Volume audio"
                  />
                </div>

                {/* Sleep Timer Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer ${
                      sleepTimerRemaining
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    title="Timer Tidur (Mati Otomatis)"
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span className="text-[11px]">
                      {sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m` : 'Timer'}
                    </span>
                  </button>

                  {showSleepMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-36 rounded-2xl bg-neutral-950 border border-neutral-800 p-2 shadow-2xl z-30 text-xs space-y-1">
                      <div className="text-[10px] text-neutral-400 font-bold px-2 py-0.5">Timer Tidur</div>
                      {[
                        { label: 'Nonaktif', val: null },
                        { label: '15 Menit', val: 15 },
                        { label: '30 Menit', val: 30 },
                        { label: '60 Menit', val: 60 },
                      ].map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSleepTimerMinutes(t.val);
                            setShowSleepMenu(false);
                          }}
                          className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                            sleepTimerMinutes === t.val
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Request Button */}
              <button
                onClick={onRequestClick}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:border-amber-500/50 cursor-pointer active:scale-95"
              >
                <Music className="h-3.5 w-3.5 text-amber-400" />
                <span>+ Request Lagu</span>
              </button>
            </div>

            {/* Audio Error message */}
            {audioError && (
              <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
                {audioError}
              </div>
            )}

            {/* Next Song Peek & Reaction Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-neutral-950/70 p-2.5 sm:p-3 border border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                <span className="font-semibold text-neutral-300 shrink-0">Berikutnya:</span>
                <span className="text-white font-medium truncate">
                  {status?.nextTrack?.title || 'Lagu Pujian RadioBOSS'}
                </span>
              </div>

              {/* Reactions Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleReaction('heart')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-rose-300 transition-all cursor-pointer ${
                    activeReactionPulse === 'heart' ? 'scale-125 bg-rose-500/20' : ''
                  }`}
                  title="Beri Cinta / Berkat"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  <span className="font-mono tabular-nums text-[11px]">{reactions.heart}</span>
                </button>
                <button
                  onClick={() => handleReaction('fire')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-orange-300 transition-all cursor-pointer ${
                    activeReactionPulse === 'fire' ? 'scale-125 bg-orange-500/20' : ''
                  }`}
                  title="Semangat"
                >
                  <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  <span className="font-mono tabular-nums text-[11px]">{reactions.fire}</span>
                </button>
                <button
                  onClick={() => handleReaction('music')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-amber-300 transition-all cursor-pointer ${
                    activeReactionPulse === 'music' ? 'scale-125 bg-amber-500/20' : ''
                  }`}
                  title="Pujian Musik"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-mono tabular-nums text-[11px]">{reactions.music}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
