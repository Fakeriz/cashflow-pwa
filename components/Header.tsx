'use client';

import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Bell,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface HeaderProps {
  onOpenAddModal?: () => void;
  onOpenSyncModal?: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isSupabaseConnected?: boolean;
  isSyncing?: boolean;
  baseCurrency?: string;
  onOpenCurrencyModal?: () => void;
  activeTab?: string;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  currentUser,
  onLogout,
  isSupabaseConnected = false,
  onOpenNotifications,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const rawName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Hafizh');
  const safeName = typeof rawName === 'string' && rawName.trim().length > 0 ? rawName.trim() : 'Hafizh';

  const initialLetter = currentUser?.fullName?.trim() 
    ? currentUser.fullName.trim().charAt(0).toUpperCase() 
    : currentUser?.email 
      ? currentUser.email.charAt(0).toUpperCase() 
      : 'H';

  const handleAvatarClick = () => {
    if (currentUser) {
      setShowUserMenu((prev) => !prev);
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/90 dark:border-zinc-800/90 px-4 py-2.5 sm:px-6 transition-colors">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* ============================================================ */}
        {/* LEFT SIDE: Interactive Profile Avatar + Proportional Greeting */}
        {/* ============================================================ */}
        <div className="relative flex items-center gap-2.5 sm:gap-3">
          {/* Interactive Profile Avatar */}
          <button
            id="header-user-avatar-btn"
            type="button"
            onClick={handleAvatarClick}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 transition hover:ring-2 hover:ring-zinc-400/40 dark:hover:ring-zinc-600/50 active:scale-95 shadow-2xs shrink-0 cursor-pointer overflow-hidden"
            title={currentUser ? `Menu akun: ${safeName}` : 'Masuk ke akun Paralar'}
            aria-label={currentUser ? `Profil ${safeName}` : 'Masuk ke akun'}
          >
            {currentUser ? (
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white select-none">
                {initialLetter}
              </span>
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            )}

            {/* Status indicator dot if connected */}
            {currentUser && (
              <span 
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`} 
                title={isSupabaseConnected ? 'Terkoneksi ke Cloud' : 'Mode Lokal'}
              />
            )}
          </button>

          {/* Proportional Greeting Text ("Hi," small, name medium/bold) */}
          <div className="flex flex-col justify-center min-w-0 select-none">
            <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-tight">
              Hi,
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white leading-tight truncate max-w-[130px] sm:max-w-[220px]">
                {safeName}
              </span>
              {currentUser && (
                <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-500 hidden xs:inline shrink-0" />
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* USER ACCOUNT DROPDOWN (Shown when logged in and avatar clicked) */}
          {/* ============================================================ */}
          {currentUser && showUserMenu && (
            <>
              {/* Overlay Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />

              <div className="absolute top-12 left-0 mt-1 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-xl z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-950 dark:text-white truncate text-sm">
                    {safeName}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {currentUser?.email || 'Akun Cloud'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{isSupabaseConnected ? 'Akun aktif & tersinkronisasi' : 'Tersimpan di perangkat'}</span>
                  </div>
                </div>

                {/* Manage Profile Button */}
                <button
                  id="header-menu-manage-profile-btn"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuthModal();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Kelola Profil Akun</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">→</span>
                </button>

                {/* Logout Button */}
                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    id="header-menu-logout-btn"
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold transition flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDE: ONLY Notification Bell                           */}
        {/* ============================================================ */}
        <div className="flex items-center">
          <button
            id="header-notification-bell-btn"
            type="button"
            onClick={onOpenNotifications}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-2xs relative active:scale-95 cursor-pointer"
            title="Pusat Notifikasi & Tagihan"
            aria-label="Pusat Notifikasi"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900" />
          </button>
        </div>
      </div>
    </header>
  );
};
