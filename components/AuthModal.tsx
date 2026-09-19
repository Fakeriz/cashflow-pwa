'use client';

import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  X, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShieldCheck,
  Settings2,
  Copy,
  Check,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  resetPasswordForEmail,
  getSupabaseCredentials 
} from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogoutSuccess: () => void;
  onOpenSupabaseConfig: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogoutSuccess,
  onOpenSupabaseConfig,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const creds = getSupabaseCredentials();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ text: 'Mohon isi email dan kata sandi.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const res = await signInWithEmail(email, password);
    setIsLoading(false);

    if (res.error) {
      setStatusMsg({ text: res.error, type: 'error' });
    } else if (res.user) {
      setStatusMsg({ text: 'Berhasil masuk! Memuat data akun Anda...', type: 'success' });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ text: 'Mohon isi email dan kata sandi.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setStatusMsg({ text: 'Kata sandi minimal 6 karakter.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const res = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);

    if (res.error) {
      setStatusMsg({ text: res.error, type: 'error' });
    } else if (res.user) {
      if (res.confirmationRequired) {
        setStatusMsg({
          text: 'Pendaftaran berhasil! Silakan cek email konfirmasi Anda atau langsung login jika konfirmasi dinonaktifkan.',
          type: 'success',
        });
        setTab('login');
      } else {
        setStatusMsg({ text: 'Akun berhasil dibuat dan otomatis masuk!', type: 'success' });
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 500);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg({ text: 'Mohon masukkan alamat email Anda.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const res = await resetPasswordForEmail(email);
    setIsLoading(false);

    if (res.error) {
      setStatusMsg({ text: res.error, type: 'error' });
    } else {
      setStatusMsg({
        text: 'Tautan reset kata sandi telah dikirim ke email Anda.',
        type: 'success',
      });
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOutUser();
    setIsLoading(false);
    onLogoutSuccess();
    onClose();
  };

  const handleCopyUserId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN VIEW */}
        {currentUser ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  {currentUser.fullName || 'Pengguna Cashflow'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser.email}</p>
              </div>
            </div>

            {/* Profile Info Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Status Autentikasi:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi (Supabase Auth)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">User ID:</span>
                <button
                  onClick={handleCopyUserId}
                  className="flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:underline"
                  title="Klik untuk menyalin User ID"
                >
                  <span>{currentUser.id.slice(0, 10)}...</span>
                  {copiedId ? <Check className="w-3 h-3 text-zinc-950 dark:text-white" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Semua data transaksi, saldo akun, komitmen kas, dan forecast Anda disimpan serta difilter eksklusif berdasarkan User ID ini.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="destructive"
                className="w-full h-11 text-sm font-medium gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-11 text-sm font-medium"
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : tab === 'forgot_password' ? (
          /* FORGOT PASSWORD VIEW */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-md">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Reset Kata Sandi
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Kirim tautan pemulihan ke email terdaftar
                </p>
              </div>
            </div>

            {/* Supabase connection notice if not configured */}
            {!creds.isConfigured && (
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-950 dark:text-white">
                  <AlertCircle className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Koneksi Supabase Belum Aktif</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Supabase Auth diperlukan untuk mengirimkan email reset kata sandi ke kotak masuk Anda.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenSupabaseConfig();
                  }}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Buka Konfigurasi Supabase</span>
                </Button>
              </div>
            )}

            {/* Status Alert */}
            {statusMsg && (
              <div
                className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-medium ${
                  statusMsg.type === 'error'
                    ? 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                    : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                }`}
              >
                {statusMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-zinc-100 dark:text-zinc-950" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan instruksi dan tautan aman untuk mengatur ulang kata sandi.
            </p>

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="pl-10 h-11 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-medium gap-2 mt-2"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset'}</span>
              </Button>
            </form>

            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setStatusMsg(null);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Masuk (Login)</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN / REGISTER TABS */
          <div className="space-y-4">
            {/* Header branding */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  {tab === 'login' ? 'Masuk ke Cashflow' : 'Daftar Akun Baru'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Supabase Auth • Data tersimpan per pengguna
                </p>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setStatusMsg(null);
                }}
                className={`py-2 rounded-xl font-medium text-sm transition ${
                  tab === 'login'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setStatusMsg(null);
                }}
                className={`py-2 rounded-xl font-medium text-sm transition ${
                  tab === 'register'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Daftar (Register)
              </button>
            </div>

            {/* Supabase connection notice if not configured */}
            {!creds.isConfigured && (
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-950 dark:text-white">
                  <AlertCircle className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Koneksi Supabase Belum Aktif</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Untuk menggunakan Supabase Auth live, masukkan Supabase URL dan Anon Key Anda.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenSupabaseConfig();
                  }}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Buka Konfigurasi Supabase</span>
                </Button>
              </div>
            )}

            {/* Status Alert */}
            {statusMsg && (
              <div
                className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-medium ${
                  statusMsg.type === 'error'
                    ? 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                    : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                }`}
              >
                {statusMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-zinc-100 dark:text-zinc-950" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
              {tab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Nama Lengkap (Opsional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Anda"
                      className="pl-10 h-11 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="pl-10 h-11 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Kata Sandi
                  </label>
                  {tab === 'login' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot_password');
                        setStatusMsg(null);
                      }}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition hover:underline"
                    >
                      Lupa Kata Sandi?
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-400">Min. 6 karakter</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-medium gap-2 mt-2"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>
                  {tab === 'login'
                    ? isLoading
                      ? 'Sedang Masuk...'
                      : 'Masuk ke Akun'
                    : isLoading
                    ? 'Mendaftar...'
                    : 'Daftar Akun Baru'}
                </span>
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-medium transition"
              >
                Lanjutkan dalam Mode Tamu / Demo →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
