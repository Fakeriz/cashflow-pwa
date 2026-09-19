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
  Copy,
  Check,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { 
  supabase,
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  resetPasswordForEmail
} from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogoutSuccess: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogoutSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setStatusMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        setStatusMsg({ text: error.message, type: 'error' });
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Gagal menghubungkan ke layanan autentikasi Google.',
        type: 'error',
      });
      setIsGoogleLoading(false);
    }
  };

  // Email & Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ text: 'Mohon masukkan email dan kata sandi Anda.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const res = await signInWithEmail(email, password);
    setIsLoading(false);

    if (res.error) {
      setStatusMsg({ text: res.error, type: 'error' });
    } else if (res.user) {
      setStatusMsg({ text: 'Berhasil masuk! Memuat data Anda...', type: 'success' });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 400);
    }
  };

  // Register New Account
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
          text: 'Pendaftaran berhasil! Silakan cek kotak masuk email Anda untuk verifikasi atau langsung coba masuk.',
          type: 'success',
        });
        setTab('login');
      } else {
        setStatusMsg({ text: 'Akun berhasil dibuat dan otomatis masuk!', type: 'success' });
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 400);
      }
    }
  };

  // Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg({ text: 'Mohon masukkan alamat email akun Anda.', type: 'error' });
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
        text: 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk Anda.',
        type: 'success',
      });
    }
  };

  // Logout
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

        {/* ============================================================ */}
        {/* LOGGED IN VIEW                                               */}
        {/* ============================================================ */}
        {currentUser ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  {currentUser?.fullName || 'Pengguna Cashflow'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser?.email || '-'}</p>
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
                  <span>{currentUser?.id ? `${currentUser.id.slice(0, 10)}...` : '-'}</span>
                  {copiedId ? <Check className="w-3 h-3 text-zinc-950 dark:text-white" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Semua data transaksi, saldo akun, komitmen kas, dan forecast Anda disimpan secara otomatis dan tersinkronisasi di cloud Supabase.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="destructive"
                className="w-full h-11 text-sm font-medium gap-2 rounded-2xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-11 text-sm font-medium rounded-2xl"
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : tab === 'forgot_password' ? (
          /* ============================================================ */
          /* FORGOT PASSWORD VIEW                                         */
          /* ============================================================ */
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
              Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi.
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
                    className="pl-10 h-11 text-sm rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-medium gap-2 mt-2 rounded-2xl"
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
                <span>Kembali ke Masuk</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* LOGIN / REGISTER VIEW                                        */
          /* ============================================================ */
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
                  {tab === 'login' 
                    ? 'Pilih metode masuk untuk sinkronisasi data Anda' 
                    : 'Buat akun untuk menyimpan data kas Anda di cloud'}
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

            {/* ============================================================ */}
            {/* PILIHAN 1: LANJUTKAN DENGAN GOOGLE (Monochrome Minimalist)     */}
            {/* ============================================================ */}
            <div className="space-y-3 pt-1">
              <button
                id="login-google-btn"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-12 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-300" />
                ) : (
                  <svg 
                    className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{isGoogleLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}</span>
              </button>

              {/* Minimalist Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  atau masuk dengan email
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PILIHAN 2: MASUK DENGAN EMAIL & KATA SANDI                   */}
            {/* ============================================================ */}
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
                      className="pl-10 h-11 text-sm rounded-xl"
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
                    className="pl-10 h-11 text-sm rounded-xl"
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
                    className="pl-10 pr-10 h-11 text-sm rounded-xl"
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
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 text-sm font-medium gap-2 mt-2 rounded-2xl shadow-sm"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>
                  {tab === 'login'
                    ? isLoading
                      ? 'Sedang Masuk...'
                      : 'Masuk dengan Email & Kata Sandi'
                    : isLoading
                    ? 'Mendaftar...'
                    : 'Daftar Akun Baru'}
                </span>
              </Button>
            </form>

            {/* ============================================================ */}
            {/* PILIHAN 3: MODE TAMU / DEMO                                  */}
            {/* ============================================================ */}
            <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-medium transition py-1"
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
