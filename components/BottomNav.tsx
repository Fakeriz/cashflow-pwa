'use client';

import React from 'react';
import { 
  Home, 
  ReceiptText, 
  Flag, 
  MoreHorizontal, 
  Plus 
} from 'lucide-react';

export type ActiveTab = 'overview' | 'transactions' | 'forecast' | 'recurring';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenMoreMenu?: () => void;
  isSupabaseConnected?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenMoreMenu,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 px-3 py-2 pb-safe transition-colors shadow-2xl"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* Tab 2: Transactions */}
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
          <ReceiptText className={`w-5 h-5 ${activeTab === 'transactions' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Transactions</span>
        </button>

        {/* Center: Elevated Floating Plus (+) Button (Matching Screenshot) */}
        <button
          id="nav-quick-add-btn"
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center justify-center w-13 h-13 -mt-6 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-zinc-950 ring-4 ring-zinc-100 dark:ring-zinc-900/60"
          title="Tambah Transaksi Cepat (+)"
          aria-label="Tambah Transaksi Cepat"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 3: Goals */}
        <button
          id="nav-tab-goals"
          type="button"
          onClick={() => onTabChange('forecast')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'forecast'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Flag className={`w-5 h-5 ${activeTab === 'forecast' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Goals</span>
        </button>

        {/* Tab 4: More */}
        <button
          id="nav-tab-more"
          type="button"
          onClick={() => {
            if (onOpenMoreMenu) {
              onOpenMoreMenu();
            } else {
              onTabChange('recurring');
            }
          }}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'recurring'
              ? 'text-zinc-950 dark:text-white font-bold scale-105'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
        </button>
      </div>
    </nav>
  );
};
