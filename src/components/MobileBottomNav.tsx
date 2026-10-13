import React from 'react';
import { Radio, MessageSquare, ListMusic, Calendar } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'player' | 'chat' | 'schedule' | 'history';
  onSelectTab: (tab: 'player' | 'chat' | 'schedule' | 'history') => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const tabs = [
    { id: 'player' as const, label: 'Siaran', icon: Radio },
    { id: 'chat' as const, label: 'Obrolan', icon: MessageSquare, badge: unreadCount },
    { id: 'history' as const, label: 'Lagu', icon: ListMusic },
    { id: 'schedule' as const, label: 'Jadwal', icon: Calendar },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 px-1 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
      aria-label="Navigasi Utama Mobile"
    >
      <div className="grid grid-cols-4 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Tab Icon with active pill */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
                    isActive ? 'bg-amber-50 text-amber-600 border border-amber-200/80 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Tab Label */}
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'text-amber-700 font-bold' : 'text-slate-500 font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
