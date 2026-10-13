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
    <div className="w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 lg:p-6 shadow-md">
      {/* Header and Segments */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/90 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-amber-500" />
            <span>Daftar Lagu &amp; Rotasi RadioBOSS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat pemutaran otomatis dan antrean lagu request dari pendengar
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Putar ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lagu berdasarkan judul, artis, atau album..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* History list */}
          <div className="space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Tidak ada lagu dalam daftar riwayat yang cocok.
              </div>
            ) : (
              filteredHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 hover:bg-slate-50/80 hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono tabular-nums text-xs font-semibold text-slate-400 w-5 text-right">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Thumbnail */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shadow-xs">
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
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="truncate font-medium">{item.artist}</span>
                        {item.album && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-400 truncate">{item.album}</span>
                          </>
                        )}
                        {item.requestedBy && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded border border-amber-200/60">Req: {item.requestedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action / time */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="text-slate-500 font-medium">{item.playedAt}</span>
                      <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                        {formatSeconds(item.duration)}
                      </span>
                    </div>

                    {/* Colorful quick request action button */}
                    <button
                      onClick={() => onRequestSong(item.artist, item.title)}
                      className="rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 p-2 text-amber-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      title="Request lagu ini lagi"
                    >
                      <Sparkles className="h-4 w-4 text-amber-600" />
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
            <div className="py-12 text-center text-xs text-slate-400">
              Belum ada lagu request dalam antrean RadioBOSS saat ini.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0 shadow-2xs">
                    <Music className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {req.artist} - {req.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="text-slate-700 font-semibold">Dari: {req.requesterName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono tabular-nums text-slate-400">{req.timestamp}</span>
                    </div>
                    {req.message && (
                      <p className="mt-1.5 text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      req.status === 'playing'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'queued'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
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
