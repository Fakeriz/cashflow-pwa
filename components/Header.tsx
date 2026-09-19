'use client';

import React, { useState } from 'react';
import { 
  Database, 
  TrendingUp, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Plus, 
  Bell 
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';
import { useTheme } from '@/hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';
import { Button } from './ui/button';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  baseCurrency?: string;
  onOpenCurrencyModal?: () => void;
  activeTab?: string;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenSyncModal,
  onOpenAuthModal,
  currentUser,
  onLogout,
  isSupabaseConnected,
  isSyncing,
  baseCurrency = 'IDR',
  onOpenCurrencyModal,
  activeTab = 'overview',
  onOpenNotifications,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.IDR;

  // Breadcrumb / title map
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Ringkasan Cashflow',
      subtitle: 'Monitoring saldo, proyeksi, dan grafik arus kas',
    },
    transactions: {
      title: 'Riwayat Transaksi',
      subtitle: 'Daftar transaksi masuk, keluar, dan konversi valas',
    },
    forecast: {
      title: 'Forecast & Runway',
      subtitle: 'Proyeksi ketahanan kas 30 hari ke depan',
    },
    recurring: {
      title: 'Tagihan Rutin',
      subtitle: 'Pengelolaan langganan dan pengeluaran berkala',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const userName = currentUser?.fullName || 'Hafizh';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-3 sm:px-6 transition-colors">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* ============================================================ */}
        {/* MOBILE GREETING (Matching screenshot: Avatar + "Hi, Hafizh") */}
        {/* ============================================================ */}
        <div className="flex md:hidden items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60 transition active:scale-95 shadow-2xs"
            title="Profil Pengguna"
          >
            <User className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
              Hi, {userName}
            </h1>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP BREADCRUMB & TITLE (Shown only on Desktop md+)      */}
        {/* ============================================================ */}
        <div className="hidden md:flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-950 dark:text-white leading-tight">
                {currentTabInfo.title}
              </h1>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">|</span>
              <span suppressHydrationWarning className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span suppressHydrationWarning>{todayFormatted || 'Today'}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ACTION ITEMS (Shared between Mobile & Desktop)              */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Bell Button (Round button matching screenshot) */}
          <button
            id="header-notification-bell-btn"
            type="button"
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-2xs relative"
            title="Notifikasi & Pemberitahuan"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title={`Beralih ke mode ${isDark ? 'Terang (Light)' : 'Gelap (Dark)'}`}
            aria-label="Toggle Light / Dark theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Currency Switcher Badge */}
          {onOpenCurrencyModal && (
            <button
              id="header-currency-switcher-btn"
              type="button"
              onClick={onOpenCurrencyModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition"
              title="Ganti mata uang atau cek kurs valas"
            >
              <span>{currencyInfo.flag}</span>
              <span className="font-bold">{currencyInfo.code}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden xs:inline">
                ({currencyInfo.symbol})
              </span>
            </button>
          )}

          {/* Supabase Status Button (Shown on desktop & tablet, hidden on tiny mobile) */}
          <button
            id="supabase-status-badge"
            type="button"
            onClick={onOpenSyncModal}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isSupabaseConnected
                ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-100'
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
            title="Konfigurasi sinkronisasi cloud Supabase"
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">
              {isSyncing ? 'Syncing...' : isSupabaseConnected ? 'Cloud Sync' : 'Supabase'}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseConnected
                  ? 'bg-zinc-950 dark:bg-zinc-100 animate-pulse'
                  : 'bg-zinc-400 dark:bg-zinc-600'
              }`}
            />
          </button>

          {/* User Profile / Supabase Auth Button */}
          <div className="relative">
            {currentUser ? (
              <button
                id="header-user-profile-btn"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">
                  {currentUser.fullName || currentUser.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            ) : (
              <Button
                id="header-login-btn"
                variant="outline"
                size="sm"
                onClick={onOpenAuthModal}
                className="h-8.5 px-3 text-xs font-semibold gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Button>
            )}

            {/* User Dropdown Menu */}
            {currentUser && showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-xl z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="font-bold text-zinc-950 dark:text-white truncate">
                      {currentUser.fullName || 'Pengguna'}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-600 dark:text-zinc-400">
                      <ShieldCheck className="w-3 h-3 text-zinc-950 dark:text-zinc-100" />
                      <span>Data difilter per User ID</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition flex items-center justify-between"
                  >
                    <span>Detail Profil & Akun</span>
                    <span className="text-[10px] text-zinc-400">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSyncModal();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition flex items-center justify-between"
                  >
                    <span>Status Database Supabase</span>
                    <span className="text-[10px] text-zinc-400">→</span>
                  </button>

                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold transition flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Desktop quick add button */}
          <Button
            id="header-quick-add-btn"
            type="button"
            onClick={onOpenAddModal}
            size="sm"
            className="hidden lg:flex items-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
