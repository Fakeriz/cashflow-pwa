'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  CreditCard, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Coins
} from 'lucide-react';
import { BankAccount, Transaction } from '@/lib/types';
import { calculateWalletStats } from '@/lib/wallets';
import { formatCurrency } from '@/lib/currency';

interface WalletCardDeckProps {
  wallets: BankAccount[];
  activeWalletIndex: number;
  onSelectWallet: (index: number) => void;
  onOpenAddWalletModal: () => void;
  onOpenPulseModal?: (wallet: BankAccount) => void;
  transactions: Transaction[];
  hideBalance: boolean;
  onToggleHideBalance: () => void;
}

export const WalletCardDeck: React.FC<WalletCardDeckProps> = ({
  wallets,
  activeWalletIndex,
  onSelectWallet,
  onOpenAddWalletModal,
  onOpenPulseModal,
  transactions,
  hideBalance,
  onToggleHideBalance,
}) => {
  const [direction, setDirection] = useState<number>(0);

  const safeWallets: BankAccount[] = Array.isArray(wallets) && wallets.length > 0 ? wallets : [
    {
      id: 'default-wallet',
      name: 'Main Wallet',
      type: 'bank',
      currency: 'IDR',
      initialBalance: 0,
      categoryTag: 'UTAMA',
    }
  ];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalCards = safeWallets.length;
  const activeWallet = safeWallets[activeWalletIndex] || safeWallets[0];

  const handleNext = () => {
    if (activeWalletIndex < totalCards - 1) {
      setDirection(1);
      onSelectWallet(activeWalletIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeWalletIndex > 0) {
      setDirection(-1);
      onSelectWallet(activeWalletIndex - 1);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 40;
    const velocityThreshold = 200;

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      if (activeWalletIndex < totalCards - 1) {
        setDirection(1);
        onSelectWallet(activeWalletIndex + 1);
      }
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      if (activeWalletIndex > 0) {
        setDirection(-1);
        onSelectWallet(activeWalletIndex - 1);
      }
    }
  };

  // Helper to render wallet logo / badge matching screenshot
  const renderWalletBadge = (wallet?: BankAccount | null) => {
    const name = (wallet?.name || '').toLowerCase();
    const isTnG = name.includes('tng') || name.includes('touch');
    const isJago = name.includes('jago');

    if (isTnG) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 p-1 flex items-center justify-center shadow-md border border-white/20">
          <div className="text-center leading-[0.75]">
            <span className="text-[7px] font-extrabold text-white block tracking-tighter">Touch</span>
            <span className="text-[8px] font-black text-amber-300 block tracking-tight">&apos;nGO</span>
            <span className="text-[6px] font-bold text-white/90 block">eWallet</span>
          </div>
        </div>
      );
    }

    if (isJago) {
      return (
        <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700/80 p-2 flex items-center justify-center shadow-inner">
          <CreditCard className="w-5 h-5 text-amber-400" />
        </div>
      );
    }

    // Default by type
    if (wallet?.type === 'bank') {
      return (
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 p-2 flex items-center justify-center shadow-inner">
          <Building2 className="w-5 h-5 text-amber-400" />
        </div>
      );
    }

    if (wallet?.type === 'cash') {
      return (
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 p-2 flex items-center justify-center shadow-inner">
          <Coins className="w-5 h-5 text-emerald-400" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 p-2 flex items-center justify-center shadow-inner">
        <Wallet className="w-5 h-5 text-sky-400" />
      </div>
    );
  };

  return (
    <div className="w-full select-none">
      {/* Swipeable / Stacked Card Container */}
      <div className="relative w-full mx-auto pt-2 pb-1">
        {/* Visual Stack Effect: Background card peeking out from behind */}
        {activeWalletIndex < totalCards - 1 && (
          <div 
            className="absolute -top-1 left-3 right-3 sm:left-6 sm:right-6 h-48 sm:h-52 rounded-[28px] bg-gradient-to-r from-zinc-800/80 via-zinc-900/90 to-zinc-950/90 border border-zinc-700/40 shadow-sm transform scale-[0.96] opacity-60 z-0 pointer-events-none transition-all duration-300"
          />
        )}
        {activeWalletIndex > 0 && activeWalletIndex === totalCards - 1 && (
          <div 
            className="absolute -top-1 left-3 right-3 sm:left-6 sm:right-6 h-48 sm:h-52 rounded-[28px] bg-gradient-to-r from-zinc-800/80 via-zinc-900/90 to-zinc-950/90 border border-zinc-700/40 shadow-sm transform scale-[0.96] opacity-60 z-0 pointer-events-none transition-all duration-300"
          />
        )}

        {/* Active Card with gesture dragging */}
        <div className="relative z-10 overflow-visible touch-pan-y">
          <motion.div
            key={activeWallet.id}
            initial={{ opacity: 0.85, x: direction * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing"
          >
            {/* The Luxury Card */}
            <div 
              id={`wallet-card-${activeWallet.id}`}
              className="relative w-full h-52 sm:h-56 rounded-[28px] overflow-hidden p-5 sm:p-6 text-white shadow-2xl transition-all duration-300 border border-zinc-800/80"
              style={{
                background: 'linear-gradient(135deg, #090d16 0%, #0d131f 45%, #0a0e17 100%)',
              }}
            >
              {/* Subtle background curved wave lines mimicking the screenshot */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
                viewBox="0 0 400 240" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M-50 40 C 100 120, 250 -30, 450 60" 
                  stroke="currentColor" 
                  strokeWidth="0.8" 
                  className="text-amber-500/40" 
                />
                <path 
                  d="M-40 80 C 120 160, 270 20, 460 110" 
                  stroke="currentColor" 
                  strokeWidth="0.8" 
                  className="text-amber-500/30" 
                />
                <path 
                  d="M-20 180 C 150 90, 300 240, 480 160" 
                  stroke="currentColor" 
                  strokeWidth="0.6" 
                  className="text-sky-500/20" 
                />
                <circle cx="350" cy="50" r="140" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
                <circle cx="350" cy="50" r="200" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" />
              </svg>

              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Top Row: Logo Badge + Name/Type + Tag (e.g. BELANJE) */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderWalletBadge(activeWallet)}
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                        {activeWallet.name}
                      </h2>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                        {activeWallet.type === 'ewallet' ? 'E-WALLET' : activeWallet.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Top Right Tag (BELANJE) */}
                  <div className="flex items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                      {activeWallet.categoryTag || 'BELANJE'}
                    </span>
                  </div>
                </div>

                {/* Middle: BALANCE Label + Eye + Large Amount */}
                <div className="my-auto pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>BALANCE</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHideBalance();
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-white transition"
                      title={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                      aria-label="Toggle balance visibility"
                    >
                      {hideBalance ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Amount Display */}
                  {(() => {
                    const stats = calculateWalletStats(activeWallet, safeTransactions);
                    const curr = activeWallet?.currency || 'MYR';
                    const symbol = curr === 'MYR' ? 'RM' : curr === 'IDR' ? 'Rp' : curr === 'USD' ? '$' : curr;
                    const balanceVal = typeof stats?.currentBalance === 'number' && !isNaN(stats.currentBalance) ? stats.currentBalance : 0;
                    const formatted = balanceVal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    const [intPart, decPart] = formatted.split('.');

                    return (
                      <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
                        <span className="text-lg sm:text-xl font-bold text-zinc-300">
                          {symbol}
                        </span>
                        {hideBalance ? (
                          <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
                            ••••••
                          </span>
                        ) : (
                          <div className="flex items-baseline">
                            <span className="text-3xl sm:text-4xl font-extrabold text-white">
                              {intPart}
                            </span>
                            <span className="text-lg sm:text-xl font-bold text-zinc-300">
                              .{decPart || '00'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Row: INCOME, SPENDING, and TAP FOR PULSE */}
                <div className="flex items-end justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-6 sm:gap-8">
                    {/* Income */}
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block">
                        INCOME
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        {hideBalance ? '••••' : (() => {
                          const stats = calculateWalletStats(activeWallet, safeTransactions);
                          const symbol = (activeWallet?.currency || 'MYR') === 'MYR' ? 'RM' : '';
                          const inc = typeof stats?.totalIncome === 'number' && !isNaN(stats.totalIncome) ? stats.totalIncome : 0;
                          return `${symbol} ${inc.toFixed(2)}`;
                        })()}
                      </span>
                    </div>

                    {/* Spending */}
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block">
                        SPENDING
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        {hideBalance ? '••••' : (() => {
                          const stats = calculateWalletStats(activeWallet, safeTransactions);
                          const symbol = (activeWallet?.currency || 'MYR') === 'MYR' ? 'RM' : '';
                          const spd = typeof stats?.totalSpending === 'number' && !isNaN(stats.totalSpending) ? stats.totalSpending : 0;
                          return `${symbol} ${spd.toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Tap For Pulse button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenPulseModal && activeWallet) onOpenPulseModal(activeWallet);
                    }}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition group py-1"
                    title="Buka statistik kesehatan & pulse kartu"
                  >
                    <Activity className="w-3 h-3 text-amber-400/80 group-hover:text-amber-300 animate-pulse" />
                    <span>TAP FOR PULSE</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pagination Indicators & Add Wallet Button (`[pill] [dot] [+]`) */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-1">
        {/* Left Arrow for desktop */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeWalletIndex === 0}
          className={`p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed`}
          aria-label="Kartu sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carousel Dots */}
        <div className="flex items-center gap-1.5">
          {safeWallets.map((wallet, index) => {
            const isActive = index === activeWalletIndex;
            return (
              <button
                key={wallet?.id || `wallet-dot-${index}`}
                type="button"
                onClick={() => {
                  setDirection(index > activeWalletIndex ? 1 : -1);
                  onSelectWallet(index);
                }}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'w-6 h-1.5 rounded-full bg-zinc-950 dark:bg-white'
                    : 'w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                }`}
                title={`Buka dompet ${wallet?.name || ''}`}
                aria-label={`Pindah ke dompet ${wallet?.name || ''}`}
              />
            );
          })}

          {/* Plus (+) indicator button right next to dots as shown in screenshot */}
          <button
            id="carousel-add-wallet-btn"
            type="button"
            onClick={onOpenAddWalletModal}
            className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center transition shadow-xs text-xs font-bold"
            title="Tambah Akun / Wallet Card Baru"
            aria-label="Tambah Akun / Wallet Card Baru"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* Right Arrow for desktop */}
        <button
          type="button"
          onClick={handleNext}
          disabled={activeWalletIndex === totalCards - 1}
          className={`p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed`}
          aria-label="Kartu berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
