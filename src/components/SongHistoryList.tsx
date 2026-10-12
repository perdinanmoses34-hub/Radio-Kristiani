import React, { useState, useEffect } from 'react';
import { Music, Clock, Search, Disc, Play, CheckCircle2, ListMusic, Sparkles } from 'lucide-react';
import { SongHistoryItem, SongRequestItem } from '../types/radio';
import { fetchSongHistory, fetchSongRequests } from '../services/api';
import { stationHeroCover } from '../assets/images';

interface SongHistoryListProps {
  onRequestSong: (artist: string, title: string) => void;
}

export const SongHistoryList: React.FC<SongHistoryListProps> = ({ onRequestSong }) => {
  const [history, setHistory] = useState<SongHistoryItem[]>([]);
  const [requests, setRequests] = useState<SongRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'queue'>('history');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [histData, reqData] = await Promise.all([
        fetchSongHistory(),
        fetchSongRequests(),
      ]);
      setHistory(histData || []);
      setRequests(reqData || []);
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.album && item.album.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-xl p-3.5 sm:p-5 lg:p-6 shadow-xl">
      {/* Header and Segments */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-amber-400" />
            <span>Daftar Lagu & Rotasi RadioBOSS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Riwayat pemutaran otomatis dan antrean lagu request dari pendengar
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-950 p-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Riwayat Putar ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-amber-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Antrean Request ({requests.filter((r) => r.status === 'queued').length})
          </button>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'history' ? (
        <div className="mt-4">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lagu berdasarkan judul, artis, atau album..."
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {/* History list */}
          <div className="space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Tidak ada lagu dalam daftar riwayat yang cocok.
              </div>
            ) : (
              filteredHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-3 hover:bg-neutral-800/40 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono tabular-nums text-xs font-semibold text-neutral-500 w-5 text-right">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Thumbnail */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800 border border-neutral-800">
                      <img
                        src={item.albumArt || stationHeroCover}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = stationHeroCover;
                        }}
                      />
                    </div>

                    {/* Song details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span className="truncate">{item.artist}</span>
                        {item.album && (
                          <>
                            <span>·</span>
                            <span className="text-neutral-500 truncate">{item.album}</span>
                          </>
                        )}
                        {item.requestedBy && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 font-medium">Req: {item.requestedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action / time */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="text-neutral-400">{item.playedAt}</span>
                      <span className="font-mono tabular-nums text-neutral-500 text-[11px]">
                        {formatSeconds(item.duration)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRequestSong(item.artist, item.title)}
                      className="rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 p-2 text-neutral-300 transition-all cursor-pointer"
                      title="Request lagu ini lagi"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Requests queue list */
        <div className="mt-4 space-y-2">
          {requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Belum ada lagu request dalam antrean RadioBOSS saat ini.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Music className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {req.artist} - {req.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="text-neutral-300 font-medium">Dari: {req.requesterName}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-neutral-500">{req.timestamp}</span>
                    </div>
                    {req.message && (
                      <p className="mt-1 text-xs text-neutral-400 italic bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                      req.status === 'playing'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : req.status === 'queued'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {req.status === 'playing' ? 'Sedang Diputar' : req.status === 'queued' ? 'Dalam Antrean' : 'Selesai'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
