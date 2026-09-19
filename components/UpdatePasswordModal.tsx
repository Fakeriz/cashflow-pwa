'use client';

import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { supabase, clearRecoveryUrlParams, getRecoveryErrorFromUrl } from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenForgotPassword?: () => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenForgotPassword,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Check URL error on modal open (e.g. expired link)
  useEffect(() => {
    if (isOpen) {
      const err = getRecoveryErrorFromUrl();
      if (err) {
        setUrlError(err);
      } else {
        setUrlError(null);
      }
      setStatusMsg(null);
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      setStatusMsg({ text: 'Mohon masukkan kata sandi baru Anda.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMsg({ text: 'Kata sandi minimal terdiri dari 6 karakter.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ text: 'Konfirmasi kata sandi tidak cocok. Harap periksa kembali.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      // Direct call as specified in requirement
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setStatusMsg({
          text: error.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      // Success notification
      setStatusMsg({
        text: 'Kata sandi berhasil diperbarui!',
        type: 'success',
      });
      setIsLoading(false);

      // Clean the recovery URL tokens/hash so it doesn't re-trigger on refresh
      clearRecoveryUrlParams();

      // Close modal and redirect user to Home after brief visual confirmation
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Terjadi kesalahan pada sistem pembaruan kata sandi.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div 
      id="modal-update-password-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={isLoading ? undefined : onClose}
    >
      <div 
        id="modal-update-password-card"
        className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {!isLoading && (
          <button
            id="btn-close-update-password"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-md shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="update-password-title" className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                Ganti Kata Sandi Baru
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atur kata sandi baru untuk mengamankan akun Supabase Anda
              </p>
            </div>
          </div>

          {/* URL Expiry Warning if link was invalid */}
          {urlError && (
            <div 
              id="update-password-url-error"
              className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                <span>
                  Tautan pemulihan mungkin sudah kedaluwarsa atau tidak valid: <strong>{urlError}</strong>
                </span>
              </div>
              {onOpenForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenForgotPassword();
                  }}
                  className="text-[11px] font-semibold underline text-zinc-950 dark:text-white hover:opacity-80 block"
                >
                  Kirim ulang tautan reset baru &rarr;
                </button>
              )}
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div
              id="update-password-status-alert"
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium ${
                statusMsg.type === 'error'
                  ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-900 dark:border-zinc-100'
              }`}
            >
              {statusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-zinc-100 dark:text-zinc-950" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* Form */}
          <form id="form-update-password" onSubmit={handleSubmit} className="space-y-4">
            {/* Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label 
                htmlFor="input-new-password" 
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Kata Sandi Baru</span>
                <span className="text-[11px] text-zinc-400">Minimal 6 karakter</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="input-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-new-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label 
                htmlFor="input-confirm-password" 
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
              >
                <span>Konfirmasi Kata Sandi Baru</span>
                {passwordsMatch && (
                  <span className="text-[11px] text-zinc-900 dark:text-zinc-100 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Cocok
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Belum cocok
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`pl-10 pr-10 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-sm transition ${
                    passwordsMismatch 
                      ? 'border-zinc-400 dark:border-zinc-600' 
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-confirm-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security checklist badge */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100" />
              <span>Kata sandi baru akan langsung aktif dan terenkripsi aman di Supabase Auth.</span>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                id="btn-save-new-password"
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full h-11 rounded-2xl font-semibold text-sm bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 shadow-md transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menyimpan Kata Sandi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {!isLoading && (
                <Button
                  id="btn-cancel-update-password"
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full h-10 rounded-2xl text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Batal / Nanti Saja
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
