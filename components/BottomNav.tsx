'use client';

import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  CalendarClock, 
  Repeat, 
  Plus
} from 'lucide-react';

export type ActiveTab = 'overview' | 'transactions' | 'forecast' | 'recurring';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  isSupabaseConnected: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 pb-safe transition-colors shadow-lg"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Ringkasan */}
        <button
          id="nav-tab-overview"
          type="button"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Ringkasan</span>
        </button>

        {/* Tab 2: Transaksi */}
        <button
          id="nav-tab-transactions"
          type="button"
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'transactions'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === 'transactions' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Transaksi</span>
        </button>

        {/* Floating Action Button (FAB) besar di bawah untuk Tambah Transaksi Cepat */}
        <button
          id="nav-quick-add-btn"
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center justify-center w-14 h-14 -mt-7 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xl hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition-all border-2 border-white dark:border-zinc-900 ring-4 ring-zinc-100 dark:ring-zinc-900/50"
          title="Tambah Transaksi Cepat (FAB)"
          aria-label="Tambah Transaksi Cepat"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Tab 3: Forecast */}
        <button
          id="nav-tab-forecast"
          type="button"
          onClick={() => onTabChange('forecast')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'forecast'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CalendarClock className={`w-5 h-5 ${activeTab === 'forecast' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Forecast</span>
        </button>

        {/* Tab 4: Tagihan Rutin */}
        <button
          id="nav-tab-recurring"
          type="button"
          onClick={() => onTabChange('recurring')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'recurring'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Repeat className={`w-5 h-5 ${activeTab === 'recurring' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Tagihan</span>
        </button>
      </div>
    </nav>
  );
};
