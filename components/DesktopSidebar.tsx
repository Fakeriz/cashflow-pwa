'use client';

import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  CalendarClock, 
  Repeat, 
  Globe2, 
  Database, 
  User, 
  LogOut, 
  Plus, 
  Sun, 
  Moon,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './ui/button';

export type DesktopNavTab = 'overview' | 'transactions' | 'forecast' | 'recurring';

interface DesktopSidebarProps {
  activeTab: DesktopNavTab;
  onTabChange: (tab: DesktopNavTab) => void;
  onOpenAddModal: () => void;
  onOpenCurrencyModal: () => void;
  onOpenSyncModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  transactionCount: number;
  recurringCount: number;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  baseCurrency?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenCurrencyModal,
  onOpenSyncModal,
  onOpenAuthModal,
  currentUser,
  onLogout,
  transactionCount,
  recurringCount,
  isSupabaseConnected,
  isSyncing,
  baseCurrency = 'IDR',
}) => {
  const { isDark, toggleTheme } = useTheme();
  const currencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.IDR;

  const navItems = [
    {
      id: 'overview',
      label: 'Home',
      icon: TrendingUp,
      badge: null,
      tab: 'overview' as DesktopNavTab,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: Receipt,
      badge: transactionCount > 0 ? transactionCount.toString() : null,
      tab: 'transactions' as DesktopNavTab,
    },
    {
      id: 'forecast',
      label: 'Analytics',
      icon: CalendarClock,
      badge: '30D',
      tab: 'forecast' as DesktopNavTab,
    },
    {
      id: 'recurring',
      label: 'Recurring',
      icon: Repeat,
      badge: recurringCount > 0 ? recurringCount.toString() : null,
      tab: 'recurring' as DesktopNavTab,
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col justify-between w-64 xl:w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 h-screen sticky top-0 transition-colors z-30 select-none overflow-y-auto"
    >
      {/* Top Section: Brand, CTA, & Primary Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Cashflow
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Web
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Pelacak kas & valas pintar
            </p>
          </div>
        </div>

        {/* Primary CTA Button: Add Transaction */}
        <Button
          id="sidebar-add-tx-btn"
          onClick={onOpenAddModal}
          className="w-full h-11 text-xs font-bold shadow-sm flex items-center justify-center gap-2 rounded-2xl"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Transaksi Cepat</span>
        </Button>

        {/* Main Navigation List */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 block mb-2">
            Menu Utama
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                onClick={() => onTabChange(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation / Management: Settings & Database */}
        <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 block mb-2">
            Pengaturan & Integrasi
          </span>

          {/* Multi-Currency / Settings */}
          <button
            id="sidebar-nav-settings"
            type="button"
            onClick={onOpenCurrencyModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4" />
              <span>Settings (Mata Uang)</span>
            </div>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>{currencyInfo.flag}</span>
              <span>{currencyInfo.code}</span>
            </span>
          </button>

          {/* Supabase Cloud Sync */}
          <button
            id="sidebar-nav-sync"
            type="button"
            onClick={onOpenSyncModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4" />
              <span>Cloud Database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected
                    ? 'bg-zinc-950 dark:bg-zinc-100 animate-pulse'
                    : 'bg-zinc-400 dark:bg-zinc-600'
                }`}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {isSyncing ? 'Sync...' : isSupabaseConnected ? 'Terkoneksi' : 'Lokal'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Section: Profile, Theme, & Status */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
        {/* Theme Mode Toggle Row */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tampilan / Tema
          </span>
          <button
            id="sidebar-theme-toggle"
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition"
            title="Ganti Mode Terang / Gelap"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* User Profile Card */}
        {currentUser ? (
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {currentUser.fullName || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Kelola Profil</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
                title="Keluar dari akun"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Sinkronkan data antar perangkat dengan akun Supabase
            </p>
            <Button
              id="sidebar-login-btn"
              variant="outline"
              size="sm"
              onClick={onOpenAuthModal}
              className="w-full text-xs font-bold h-9 flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk / Daftar Akun</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
