import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Radio, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { RadioShow } from '../types/radio';
import { fetchSchedule } from '../services/api';

export const ScheduleGuide: React.FC = () => {
  const [schedule, setSchedule] = useState<RadioShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await fetchSchedule();
        setSchedule(data || []);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSchedule();
  }, []);

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src="/src/assets/images/studio_mic_broadcast_1791802346111.jpg"
            alt="Radio Broadcasting Studio"
            className="h-full w-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Calendar className="h-4 w-4" />
              <span>Jadwal Siaran Harian RadioBOSS</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Program Acara & On-Air Host
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 max-w-2xl">
              Susunan program siaran 24 jam non-stop yang dikelola langsung melalui scheduler otomatis RadioBOSS.
            </p>
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((show) => (
          <div
            key={show.id}
            className={`relative rounded-2xl p-5 border transition-all ${
              show.isLiveNow
                ? 'bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-neutral-900/80 border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            {/* Live now indicator */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{show.time}</span>
              </div>
              {show.isLiveNow && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  SEDANG MENGUDARA
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-amber-400">
              {show.name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-400">
              <User className="h-3.5 w-3.5 text-neutral-500" />
              <span>Penyiar / Host:</span>
              <strong className="text-neutral-200">{show.host}</strong>
            </div>

            <p className="mt-2.5 text-xs text-neutral-300/90 leading-relaxed">
              {show.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
