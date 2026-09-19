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
  Sparkles,
  Type
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { useFontSize, FontSizePreset } from '@/hooks/useFontSize';
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
  const { fontSize, setFontSize } = useFontSize();

  if (!isOpen) return null;

  const fontPresets: { id: FontSizePreset; label: string; sub: string }[] = [
    { id: 'small', label: 'Kecil', sub: '90%' },
    { id: 'normal', label: 'Normal', sub: 'Default' },
    { id: 'large', label: 'Besar', sub: '110%' },
  ];

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
              Kelola akun, preferensi tampilan, dan kurs
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
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
                  {currentUser?.fullName || 'Hafizh (Pengguna Paralar)'}
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
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                title="Keluar dari akun"
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
                className="px-3 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                Masuk
              </button>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-2 pt-1">
            {/* 1. Pengaturan Ukuran Teks (Requirement 5) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                    <Type className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Ukuran Teks
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Sesuaikan skala kenyamanan membaca
                    </span>
                  </div>
                </div>
              </div>

              {/* Preset Selector Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {fontPresets.map((preset) => {
                  const isActive = fontSize === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`font-size-btn-${preset.id}`}
                      type="button"
                      onClick={() => setFontSize(preset.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition border cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white font-bold shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
                      }`}
                    >
                      <span className="text-xs">{preset.label}</span>
                      <span className="text-[10px] opacity-70 mt-0.5">{preset.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Real-time preview card */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-medium">
                  <span>Pratinjau Teks Real-Time</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {fontSize === 'small' ? 'Kecil (90%)' : fontSize === 'large' ? 'Besar (110%)' : 'Normal (100%)'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-950 dark:text-white text-sm">
                    Rp 14.850.000 · Kas Utama
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                    Belanja Supermarket · Pengeluaran Kas
                  </p>
                </div>
              </div>
            </div>

            {/* Tambah Akun Wallet */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddWallet();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left cursor-pointer"
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
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group text-left cursor-pointer"
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
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <Button type="button" onClick={onClose} className="h-9 px-4 text-xs font-bold cursor-pointer">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
