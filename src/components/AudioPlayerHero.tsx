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
  Share2,
  Moon,
  RadioTower,
  Smartphone,
  Check,
} from 'lucide-react';
import { RadioBossStatus } from '../types/radio';
import { AudioVisualizer } from './AudioVisualizer';
import { sendChatReaction, DEFAULT_ZENO_STREAM_URL, DEFAULT_ZENO_EMBED_URL } from '../services/api';
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
  const [quality] = useState<'64' | '128' | '320'>('128');
  const [isLowLatency] = useState<boolean>(true);

  // Player Mode: 'custom' (Studio HD player with visualizer) or 'zeno_embed' (Official Zeno FM live widget player)
  const [playerMode, setPlayerMode] = useState<'custom' | 'zeno_embed'>('custom');

  // Share state
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
        setAudioError('Menghubungkan ke siaran langsung radio... Ketuk tombol putar.');
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

      const targetStream = DEFAULT_ZENO_STREAM_URL;
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
        setAudioError('Ketuk tombol putar (Play) untuk mulai mendengarkan siaran langsung.');
      }
    }
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
    const shareData = {
      title: 'Dengarkan Eklesia Radio - Streaming Online',
      text: 'Mari dengarkan siaran lagu rohani & firman Tuhan di Eklesia Radio!',
      url: currentOrigin,
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
      navigator.clipboard.writeText(currentOrigin);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-md sm:shadow-lg">
      {/* Background ambient lighting - subtle and realistic */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

      {/* Top Banner: Status & Server Information */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'animate-ping bg-emerald-500' : 'bg-slate-400'}`} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-600' : 'bg-slate-400'}`} />
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-wider text-slate-800 uppercase truncate">
            {isPlaying ? 'ON AIR MENGUDARA' : 'SIARAN LANGSUNG TERHUBUNG'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1">
            <RadioTower className="h-3 w-3 text-amber-500 shrink-0" />
            <span>Server Otomatis Aktif</span>
          </span>
        </div>

        {/* Player Mode Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setPlayerMode('custom')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                playerMode === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
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
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                playerMode === 'zeno_embed'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Widget Siaran
            </button>
          </div>

          {/* Share Button - Subtle Sky Blue */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 text-xs text-sky-700 transition-colors cursor-pointer shrink-0 font-medium"
            title="Bagikan Tautan Radio"
          >
            {copiedShare ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-600">Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-sky-600" />
                <span className="hidden sm:inline text-[11px] font-bold">Bagikan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODE 1: OFFICIAL LIVE EMBED WIDGET PLAYER */}
      {playerMode === 'zeno_embed' ? (
        <div className="relative z-10 mt-4 space-y-3">
          <div className="rounded-2xl overflow-hidden border border-amber-300/80 bg-slate-50 shadow-inner p-1">
            <iframe
              src={DEFAULT_ZENO_EMBED_URL}
              title="Eklesia Radio Live Player"
              width="100%"
              height="220"
              frameBorder="0"
              scrolling="no"
              className="w-full rounded-xl"
              allow="autoplay"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Widget Siaran Langsung Terkoneksi ke Server RadioBOSS &amp; Zeno</span>
            </div>
            <span className="text-amber-600 font-semibold text-[11px]">24 Jam Non-Stop</span>
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
                className={`hidden sm:block absolute -right-4 h-44 w-44 lg:h-52 lg:w-52 rounded-full bg-slate-900 p-2 shadow-2xl transition-transform duration-700 border-2 border-slate-800 pointer-events-none ${
                  isPlaying ? 'translate-x-5 rotate-180 animate-[spin_10s_linear_infinite]' : 'translate-x-0'
                }`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
                  <Disc3 className="h-10 w-10 text-amber-400" />
                </div>
              </div>

              {/* Front Album Card with realistic shadow & border */}
              <div className="relative z-10 h-44 w-44 sm:h-48 sm:w-48 lg:h-56 lg:w-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl shrink-0">
                <img
                  src={currentTrack?.albumArt || stationHeroCover}
                  alt={currentTrack?.title || 'Eklesia Radio Live'}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = stationHeroCover;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Quality badge overlay */}
                <div className="absolute top-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-700 backdrop-blur-sm border border-amber-200/80 shadow-xs">
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
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                <span className="font-bold text-amber-600 truncate max-w-[200px] sm:max-w-none">
                  {currentShow?.name || 'Eklesia Radio Siaran Rohani'}
                </span>
                <span>·</span>
                <span className="truncate max-w-[140px] sm:max-w-none font-medium text-slate-600">Host: {currentShow?.host || 'Studio'}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline font-mono tabular-nums text-slate-500">{currentShow?.time || 'Live 24 Jam'}</span>
              </div>

              {/* Song Title & Artist */}
              <h1 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 line-clamp-2 break-words">
                {currentTrack?.title || 'Eklesia Radio Live Broadcast'}
              </h1>
              <p className="mt-0.5 text-sm sm:text-base font-semibold text-slate-600 truncate">
                {currentTrack?.artist || 'Lagu Pujian Rohani &amp; Firman'}
              </p>

              {/* Metadata tags */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                {currentTrack?.album && <span className="truncate max-w-[180px]">Album: <strong className="text-slate-700 font-semibold">{currentTrack.album}</strong></span>}
                {currentTrack?.genre && <span>· <span className="text-slate-600 font-medium">{currentTrack.genre}</span></span>}
                {currentTrack?.bpm && <span>· <span className="font-mono tabular-nums text-slate-600">{currentTrack.bpm} BPM</span></span>}
              </div>
            </div>

            {/* Progress Bar Timeline */}
            <div className="mt-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                <span>{formatTime(currentTrack?.pos || 0)}</span>
                <span className="text-slate-400 text-[10px]">Live Audio Broadcast</span>
                <span>{formatTime(currentTrack?.duration || 240)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
              <div className="flex items-center gap-3">
                {/* Primary Play Button - Vibrant & Tactile */}
                <button
                  onClick={togglePlay}
                  disabled={isBuffering}
                  className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-500/35 ring-4 ring-amber-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-75 cursor-pointer shrink-0"
                  aria-label={isPlaying ? 'Jeda Siaran' : 'Putar Audio Radio'}
                >
                  {isBuffering ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                    className="rounded-lg p-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4.5 w-4.5 text-slate-400" />
                    ) : (
                      <Volume2 className="h-4.5 w-4.5 text-slate-700" />
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
                    className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
                    aria-label="Volume audio"
                  />
                </div>

                {/* Sleep Timer Toggle - Purple Accent */}
                <div className="relative">
                  <button
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer ${
                      sleepTimerRemaining
                        ? 'bg-purple-100 text-purple-700 font-bold border border-purple-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Timer Tidur (Mati Otomatis)"
                  >
                    <Moon className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-[11px] font-medium">
                      {sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m` : 'Timer'}
                    </span>
                  </button>

                  {showSleepMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-36 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl z-30 text-xs space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold px-2 py-0.5">Timer Tidur</div>
                      {[
                        { label: 'Nonaktif', val: null },
                        { label: '15 Menit', val: 15 },
                        { label: '30 Menit', val: 30 },
                        { label: '60 Menit', val: 60 },
                        { label: '90 Menit', val: 90 },
                      ].map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSleepTimerMinutes(t.val);
                            setShowSleepMenu(false);
                          }}
                          className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                            sleepTimerMinutes === t.val
                              ? 'bg-amber-500 text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Request Button - Emerald Accent */}
              <button
                onClick={onRequestClick}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Music className="h-3.5 w-3.5 text-emerald-600" />
                <span>+ Request Lagu</span>
              </button>
            </div>

            {/* Audio Error message */}
            {audioError && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                {audioError}
              </div>
            )}

            {/* Next Song Peek & Reaction Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-slate-50 p-2.5 sm:p-3 border border-slate-200/90">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                <span className="font-bold text-slate-700 shrink-0">Berikutnya:</span>
                <span className="text-slate-900 font-semibold truncate">
                  {status?.nextTrack?.title || 'Lagu Rohani Pilihan'}
                </span>
              </div>

              {/* Reactions Buttons with subtle colorful highlights */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleReaction('heart')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 transition-all cursor-pointer shadow-2xs ${
                    activeReactionPulse === 'heart' ? 'scale-125 bg-rose-100 ring-2 ring-rose-300' : ''
                  }`}
                  title="Beri Cinta / Berkat"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  <span className="font-mono tabular-nums text-[11px]">{reactions.heart}</span>
                </button>
                <button
                  onClick={() => handleReaction('fire')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-orange-600 transition-all cursor-pointer shadow-2xs ${
                    activeReactionPulse === 'fire' ? 'scale-125 bg-orange-100 ring-2 ring-orange-300' : ''
                  }`}
                  title="Semangat"
                >
                  <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                  <span className="font-mono tabular-nums text-[11px]">{reactions.fire}</span>
                </button>
                <button
                  onClick={() => handleReaction('music')}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-amber-700 transition-all cursor-pointer shadow-2xs ${
                    activeReactionPulse === 'music' ? 'scale-125 bg-amber-100 ring-2 ring-amber-300' : ''
                  }`}
                  title="Pujian Musik"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
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
