import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Radio, User, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { RadioShow } from '../types/radio';
import { fetchSchedule } from '../services/api';
import { studioMicBroadcast } from '../assets/images';

interface ScheduleGuideProps {
  onOpenAdminSchedule?: () => void;
  isAdminLoggedIn?: boolean;
}

export const ScheduleGuide: React.FC<ScheduleGuideProps> = ({
  onOpenAdminSchedule,
  isAdminLoggedIn = false,
}) => {
  const [schedule, setSchedule] = useState<RadioShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    loadSchedule();
  }, []);

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-md">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={studioMicBroadcast}
            alt="Radio Broadcasting Studio"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Calendar className="h-4 w-4" />
                <span>Jadwal Siaran Harian RadioBOSS</span>
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                Program Acara &amp; On-Air Host
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-2xl font-medium">
                Susunan program siaran 24 jam non-stop yang dikelola langsung melalui scheduler otomatis RadioBOSS.
              </p>
            </div>

            {onOpenAdminSchedule && (
              <button
                onClick={onOpenAdminSchedule}
                className="flex items-center gap-1.5 self-start sm:self-end px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Sliders className="h-3.5 w-3.5 text-slate-950" />
                <span>{isAdminLoggedIn ? 'Atur Jadwal (Admin)' : 'Atur Jadwal (Login Admin)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((show) => (
          <div
            key={show.id}
            className={`relative rounded-2xl p-5 border transition-all shadow-2xs ${
              show.isLiveNow
                ? 'bg-gradient-to-br from-amber-50/70 via-white to-white border-2 border-amber-400 shadow-md ring-2 ring-amber-100'
                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Live now indicator */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-amber-600 font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>{show.time}</span>
              </div>
              {show.isLiveNow && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  SEDANG MENGUDARA
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600">
              {show.name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Penyiar / Host:</span>
              <strong className="text-slate-800 font-semibold">{show.host}</strong>
            </div>

            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {show.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
