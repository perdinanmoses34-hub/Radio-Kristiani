import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Users,
  Zap,
  Disc3,
  Heart,
  Flame,
  Music,
  Sparkles,
} from 'lucide-react';
import { RadioBossStatus } from '../types/radio';
import { AudioVisualizer } from './AudioVisualizer';
import { sendChatReaction } from '../services/api';
import { stationHeroCover } from '../assets/images';

interface AudioPlayerHeroProps {
  status: RadioBossStatus | null;
  onRequestClick: () => void;
  onRefreshStatus: () => void;
}

export const AudioPlayerHero: React.FC<AudioPlayerHeroProps> = ({
  status,
  onRequestClick,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [quality, setQuality] = useState<'64' | '128' | '320'>('128');
  const [isLowLatency, setIsLowLatency] = useState<boolean>(true);
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
        setAudioError('Stream audio sedang menghubungkan...');
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

      const streamUrl = status?.streamUrl || 'https://stream.zeno.fm/f3wvbbqmdg8uv';
      const targetUrl = isLowLatency ? `${streamUrl}?cb=${Date.now()}` : streamUrl;

      if (audio.src !== targetUrl) {
        audio.src = targetUrl;
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
        setAudioError('Ketuk tombol putar sekali lagi untuk mengaktifkan siaran.');
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

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-2xl">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-600/10 blur-3xl" />

      {/* Top Station Status Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'animate-ping bg-emerald-400' : 'bg-neutral-500'}`} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-wider text-neutral-200 uppercase truncate">
            {isPlaying ? 'ON AIR LIVE' : 'STREAM STANDBY'}
          </span>
          <span className="hidden sm:inline text-neutral-600">·</span>
          <span className="hidden sm:inline text-xs text-neutral-400 truncate">
            RadioBOSS Remote Studio
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1 text-neutral-300">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-mono tabular-nums font-semibold text-neutral-100">
              {status?.listeners ?? 194}
            </span>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">Pendengar</span>
          </div>

          <button
            onClick={() => setIsLowLatency(!isLowLatency)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 sm:py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              isLowLatency
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Low Latency</span>
          </button>
        </div>
      </div>

      {/* Main Track Presentation Deck */}
      <div className="relative z-10 mt-4 sm:mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
        {/* Album Artwork & Contained Vinyl Disc */}
        <div className="flex items-center justify-center lg:col-span-4">
          <div className="relative flex items-center justify-center max-w-full">
            {/* Spinning vinyl disc peek (contained safely with overflow protection) */}
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
                alt={currentTrack?.title || 'Album Art'}
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
                {currentShow?.name || 'Radio Kristiani On-Air'}
              </span>
              <span>·</span>
              <span className="truncate max-w-[140px] sm:max-w-none">Host: {currentShow?.host || 'Studio'}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-mono tabular-nums text-neutral-400">{currentShow?.time || 'Live'}</span>
            </div>

            {/* Song Title & Artist with Zero Overflow Protection */}
            <h1 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white line-clamp-2 break-words">
              {currentTrack?.title || 'Memuat Siaran Radio...'}
            </h1>
            <p className="mt-0.5 text-sm sm:text-base font-semibold text-neutral-300 truncate">
              {currentTrack?.artist || 'RadioBOSS Studio Engine'}
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

              {/* Quality Badges */}
              <div className="hidden xs:flex items-center rounded-lg bg-neutral-800/80 p-0.5 border border-neutral-700/50">
                {(['64', '128', '320'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                      quality === q
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {q}k
                  </button>
                ))}
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
    </section>
  );
};
