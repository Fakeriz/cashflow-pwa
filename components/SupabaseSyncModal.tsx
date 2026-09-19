'use client';

import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA,
  DEFAULT_SUPABASE_URL
} from '@/lib/supabase';
import { Button } from './ui/button';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncTriggered: () => void;
}

const SupabaseSyncContent: React.FC<{
  onClose: () => void;
  onSyncTriggered: () => void;
}> = ({ onClose, onSyncTriggered }) => {
  const creds = getSupabaseCredentials();
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestAndSync = async () => {
    setIsTesting(true);
    setStatusMsg({ text: 'Memeriksa konektivitas cloud Supabase...', type: 'info' });

    const res = await testSupabaseConnection();
    setIsTesting(false);

    if (res.success) {
      setStatusMsg({ text: 'Database cloud aktif dan siap digunakan!', type: 'success' });
      onSyncTriggered();
    } else {
      setStatusMsg({ text: res.message, type: 'error' });
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Supabase Cloud Database</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Penyimpanan cloud terpusat & aman</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current Connection Status Alert */}
      {statusMsg && (
        <div
          className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : statusMsg.type === 'error'
              ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
              : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : statusMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
          )}
          <div>
            <span className="font-bold block">
              {statusMsg.type === 'success' ? 'Terhubung' : statusMsg.type === 'error' ? 'Kendala Koneksi' : 'Menguji'}
            </span>
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Cloud Status Card (Hardcoded, no manual inputs) */}
      <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kredensial Cloud Terhubung Permanen</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
            Online
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Host Endpoint
            </span>
            <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[220px]">
              {DEFAULT_SUPABASE_URL.replace('https://', '')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">Akses Publik Anon</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[11px]">
              Terkonfigurasi Otomatis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            id="test-supabase-btn"
            size="sm"
            onClick={handleTestAndSync}
            disabled={isTesting}
            className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-10 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Sedang Memeriksa...' : 'Sinkronkan Data Cloud Sekarang'}</span>
          </Button>
        </div>
      </div>

      {/* SQL Schema helper for admin */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span className="text-xs font-bold text-zinc-950 dark:text-white">Skema Tabel & RLS</span>
          </div>
          <Button
            id="copy-sql-schema-btn"
            variant="outline"
            size="sm"
            onClick={handleCopySchema}
            className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold rounded-xl"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin SQL</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Skema Row Level Security (RLS) memastikan transaksi dan tagihan Anda tersimpan privat untuk masing-masing pengguna.
        </p>
      </div>

      {/* Close Button */}
      <Button variant="outline" onClick={onClose} className="w-full text-xs font-semibold rounded-2xl h-10">
        Tutup
      </Button>
    </div>
  );
};

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncTriggered,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <SupabaseSyncContent
        key={isOpen ? 'open' : 'closed'}
        onClose={onClose}
        onSyncTriggered={onSyncTriggered}
      />
    </div>
  );
};
