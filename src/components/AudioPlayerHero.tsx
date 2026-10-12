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
  Send,
  Sparkles,
  ExternalLink,
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
    heart: 284,
    fire: 142,
    clap: 95,
    music: 189,
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
        setAudioError('Stream audio sedang menghubungkan kembali...');
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
      // Low latency cache bust for fresh live stream buffer
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
        setAudioError('Klik putar sekali lagi untuk mengaktifkan audio siaran.');
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
      // optimistic update
    }
    setTimeout(() => setActiveReactionPulse(null), 600);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 md:p-8 backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />

      {/* Top station banner bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'animate-ping bg-emerald-400' : 'bg-neutral-500'}`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
            </span>
            <span className="text-xs font-semibold tracking-wider text-neutral-300">
              {isPlaying ? 'ON AIR LIVE' : 'STREAM STANDBY'}
            </span>
          </div>
          <span className="text-neutral-600">·</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Radio className="h-3.5 w-3.5 text-amber-400" />
            <span>RadioBOSS v7.0 Remote Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-mono tabular-nums font-semibold text-neutral-200">
              {status?.listeners ?? 186}
            </span>
            <span className="text-neutral-500">Pendengar Aktif</span>
          </div>

          <button
            onClick={() => setIsLowLatency(!isLowLatency)}
            title="Klik untuk ubah latensi streaming"
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              isLowLatency
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Low Latency {isLowLatency ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Track Presentation Deck */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Album Artwork & Vinyl Disc */}
        <div className="flex items-center justify-center lg:col-span-4">
          <div className="group relative flex items-center justify-center">
            {/* Spinning vinyl disc peek */}
            <div
              className={`absolute -right-6 h-40 w-40 sm:h-52 sm:w-52 rounded-full bg-neutral-950 p-2 shadow-2xl transition-transform duration-700 border border-neutral-700/60 ${
                isPlaying ? 'translate-x-6 rotate-180 animate-[spin_10s_linear_infinite]' : 'translate-x-0'
              }`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-neutral-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black">
                <Disc3 className="h-10 w-10 text-amber-500/80" />
              </div>
            </div>

            {/* Front Album Card */}
            <div className="relative z-10 h-44 w-44 sm:h-56 sm:w-56 overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-800 shadow-2xl">
              <img
                src={currentTrack?.albumArt || stationHeroCover}
                alt={currentTrack?.title || 'Album Art'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = stationHeroCover;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

              {/* Quality badge overlay */}
              <div className="absolute top-2.5 left-2.5 rounded bg-neutral-950/75 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-400 backdrop-blur-sm border border-neutral-800">
                {quality} kbps
              </div>

              {/* Visualizer overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                <AudioVisualizer isPlaying={isPlaying} barCount={20} height={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Track Metadata & Program Info */}
        <div className="flex flex-col justify-between lg:col-span-8">
          <div>
            {/* Show / Program Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-amber-400">{currentShow?.name || 'Live Broadcast Show'}</span>
              <span>·</span>
              <span>Host: {currentShow?.host || 'DJ Studio On-Air'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-neutral-400">{currentShow?.time || '14:00 - 18:00 WIB'}</span>
            </div>

            {/* Song Title & Artist */}
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl text-balance">
              {currentTrack?.title || 'Memuat Siaran Radio...'}
            </h1>
            <p className="mt-1 text-base sm:text-lg font-medium text-neutral-300">
              {currentTrack?.artist || 'RadioBOSS Automation'}
            </p>

            {/* Additional Song Metadata tags */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
              {currentTrack?.album && <span>Album: <strong className="text-neutral-200">{currentTrack.album}</strong></span>}
              {currentTrack?.genre && <span>· Genre: <span className="text-neutral-300">{currentTrack.genre}</span></span>}
              {currentTrack?.year && <span>· Rilis: <span className="font-mono tabular-nums text-neutral-300">{currentTrack.year}</span></span>}
              {currentTrack?.bpm && <span>· Tempo: <span className="font-mono tabular-nums text-neutral-300">{currentTrack.bpm} BPM</span></span>}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs font-mono tabular-nums text-neutral-400">
              <span>{formatTime(currentTrack?.pos || 0)}</span>
              <span className="text-neutral-500">Live Stream Timeline</span>
              <span>{formatTime(currentTrack?.duration || 240)}</span>
            </div>
          </div>

          {/* Audio Player Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-800/60">
            <div className="flex items-center gap-4">
              {/* Big Play/Pause Button */}
              <button
                onClick={togglePlay}
                disabled={isBuffering}
                className="flex h-13 w-13 items-center justify-center rounded-full bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-75 cursor-pointer"
                aria-label={isPlaying ? 'Jeda Siaran' : 'Putar Radio Streaming'}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-lg p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-neutral-300" />
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
                  className="h-1.5 w-20 sm:w-28 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-amber-500"
                  aria-label="Volume audio"
                />
              </div>

              {/* Quality Selector */}
              <div className="hidden sm:flex items-center rounded-lg bg-neutral-800/80 p-0.5 border border-neutral-700/50">
                {(['64', '128', '320'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`rounded px-2 py-1 text-[11px] font-mono font-medium transition-colors cursor-pointer ${
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

            {/* Quick Request Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={onRequestClick}
                className="flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:border-amber-500/50 cursor-pointer"
              >
                <Music className="h-3.5 w-3.5 text-amber-400" />
                <span>+ Request Lagu</span>
              </button>
            </div>
          </div>

          {/* Audio error message banner if any */}
          {audioError && (
            <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
              {audioError}
            </div>
          )}

          {/* Next Track Peek & Reactions Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-950/60 p-3 border border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Berikutnya:</span>
              <span className="text-white font-medium">
                {status?.nextTrack?.title || 'Lagu Pilihan RadioBOSS'}
              </span>
              <span className="text-neutral-500">oleh {status?.nextTrack?.artist || 'Artis'}</span>
            </div>

            {/* Live Listener Reactions */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-500 mr-1 hidden sm:inline">Reaksi:</span>
              <button
                onClick={() => handleReaction('heart')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-rose-300 transition-all cursor-pointer ${
                  activeReactionPulse === 'heart' ? 'scale-125 bg-rose-500/20' : ''
                }`}
              >
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span className="font-mono tabular-nums">{reactions.heart}</span>
              </button>
              <button
                onClick={() => handleReaction('fire')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-orange-300 transition-all cursor-pointer ${
                  activeReactionPulse === 'fire' ? 'scale-125 bg-orange-500/20' : ''
                }`}
              >
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                <span className="font-mono tabular-nums">{reactions.fire}</span>
              </button>
              <button
                onClick={() => handleReaction('music')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-neutral-800/70 hover:bg-neutral-800 text-amber-300 transition-all cursor-pointer ${
                  activeReactionPulse === 'music' ? 'scale-125 bg-amber-500/20' : ''
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono tabular-nums">{reactions.music}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
