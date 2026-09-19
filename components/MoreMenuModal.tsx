'use client';

import React from 'react';
import { 
  X, 
  CreditCard, 
  ReceiptText, 
  Globe2, 
  Database, 
  Moon, 
  Sun, 
  LogOut, 
  User, 
  Plus,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './ui/button';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddWallet: () => void;
  onOpenRecurring: () => void;
  onOpenCurrency: () => void;
  onOpenSync: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  baseCurrency?: string;
  isSupabaseConnected?: boolean;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenAddWallet,
  onOpenRecurring,
  onOpenCurrency,
  onOpenSync,
  onOpenAuth,
  currentUser,
  onLogout,
  baseCurrency = 'MYR',
  isSupabaseConnected = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-t-[32px] sm:rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Menu & Pengaturan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kelola akun, tagihan, dan preferensi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* User Profile Banner */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'H'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  {currentUser?.fullName || 'Hafizh (Guest User)'}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {currentUser?.email || 'Data tersimpan lokal offline'}
                </p>
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs"
              >
                Masuk
              </button>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-1.5 pt-2">
            {/* Tambah Akun Wallet */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddWallet();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Tambah Kartu Wallet Baru
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    TnG, Bank Jago, BCA, Mandiri, Cash, dll.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Tagihan Rutin */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecurring();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <ReceiptText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Tagihan & Langganan Rutin (Bills)
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Pengelolaan pengeluaran berkala bulanan
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Mata Uang */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCurrency();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Mata Uang & Kurs Valas ({baseCurrency})
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Konfigurasi multi-valas & nilai tukar
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Supabase Cloud Sync */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSync();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Database Cloud Supabase
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Terhubung & tersinkronisasi otomatis
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Toggle Tema Gelap / Terang */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Mode Tampilan
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {isDark ? 'Mode Gelap (Dark Mode)' : 'Mode Terang (Light Mode)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <Button type="button" onClick={onClose} className="h-9 px-4 text-xs font-bold">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
