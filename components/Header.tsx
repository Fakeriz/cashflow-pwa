'use client';

import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  Bell,
  CheckCircle2
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

  // Ambil nama depan secara aman dengan optional chaining
  const rawFullName = 
    (currentUser as any)?.user_metadata?.full_name || 
    currentUser?.fullName || 
    (currentUser?.email ? currentUser.email.split('@')[0] : '');
  
  const firstName = currentUser 
    ? (typeof rawFullName === 'string' && rawFullName.trim().length > 0 
        ? rawFullName.trim().split(' ')[0] 
        : 'User')
    : 'User';

  const avatarUrl = (currentUser as any)?.user_metadata?.avatar_url || currentUser?.avatarUrl;

  const initialLetter = firstName.charAt(0).toUpperCase() || 'U';

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
        {/* SISI KIRI: Avatar Profil + Salam "Hi, [Nama]" (Satu Baris)   */}
        {/* ============================================================ */}
        <div className="relative flex items-center gap-2.5 sm:gap-3">
          {/* Avatar Profil Interaktif */}
          <button
            id="header-user-avatar-btn"
            type="button"
            onClick={handleAvatarClick}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 transition hover:ring-2 hover:ring-zinc-400/40 dark:hover:ring-zinc-600/50 active:scale-95 shadow-2xs shrink-0 cursor-pointer overflow-hidden"
            title={currentUser ? `Menu akun: ${firstName}` : 'Masuk ke akun'}
            aria-label={currentUser ? `Profil ${firstName}` : 'Masuk ke akun'}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : currentUser ? (
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white select-none">
                {initialLetter}
              </span>
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            )}

            {/* Status indicator dot saat terhubung */}
            {currentUser && (
              <span 
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`} 
                title={isSupabaseConnected ? 'Terkoneksi ke Cloud' : 'Mode Lokal'}
              />
            )}
          </button>

          {/* Teks Salam Satu Baris ("Hi, User" atau "Hi, [Nama]") */}
          <div className="flex items-center min-w-0 select-none">
            <span className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white leading-tight truncate max-w-[160px] sm:max-w-[260px]">
              Hi, {firstName}
            </span>
          </div>

          {/* ============================================================ */}
          {/* DIALOG RINGKAS AKUN (Hanya saat sudah login & avatar diklik)  */}
          {/* ============================================================ */}
          {currentUser && showUserMenu && (
            <>
              {/* Overlay Backdrop penutup menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />

              <div className="absolute top-12 left-0 mt-1 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-xl z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Info Akun Pengguna */}
                <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 overflow-hidden font-bold">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{initialLetter}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-zinc-950 dark:text-white truncate text-sm">
                      {(currentUser as any)?.user_metadata?.full_name || currentUser?.fullName || firstName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {currentUser?.email || 'Pengguna'}
                    </p>
                  </div>
                </div>

                <div className="px-2 py-1 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Sesi Akun Aktif</span>
                </div>

                {/* Tombol Keluar (Logout) */}
                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    id="header-menu-logout-btn"
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold transition flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* SISI KANAN: HANYA Ikon Notifikasi (Lonceng)                   */}
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
