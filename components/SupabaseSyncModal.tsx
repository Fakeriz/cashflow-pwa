'use client';

import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  RefreshCw, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  ShieldCheck
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncTriggered: () => void;
}

const SupabaseSyncContent: React.FC<{
  onClose: () => void;
  onSyncTriggered: () => void;
}> = ({ onClose, onSyncTriggered }) => {
  const [creds] = useState(() => getSupabaseCredentials());
  const [url, setUrl] = useState(creds.url);
  const [anonKey, setAnonKey] = useState(creds.key);
  const source = creds.source;
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setStatusMsg({ text: 'Menguji koneksi ke Supabase...', type: 'info' });

    // Save custom credentials if user modified them
    saveCustomSupabaseCredentials(url.trim(), anonKey.trim());

    const res = await testSupabaseConnection();
    setIsTesting(false);

    if (res.success) {
      setStatusMsg({ text: res.message, type: 'success' });
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
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Supabase Cloud Sync</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">PostgreSQL backend & Auth per pengguna</p>
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

      {/* Credentials Form */}
      <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">Kredensial API Supabase</span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Sumber: <strong className="uppercase text-zinc-950 dark:text-white">{source}</strong>
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>Supabase Project URL</span>
          </label>
          <Input
            id="supabase-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-zinc-400" />
            <span>Supabase Anon Public Key</span>
          </label>
          <Input
            id="supabase-key-input"
            type="password"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            className="text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            id="test-supabase-btn"
            size="sm"
            onClick={handleSaveAndTest}
            disabled={isTesting || !url || !anonKey}
            className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Sedang Menguji...' : 'Simpan & Uji Koneksi'}</span>
          </Button>
        </div>
      </div>

      {/* 1-Click SQL Schema copy with RLS & user_id */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            <span className="text-xs font-bold text-zinc-950 dark:text-white">PostgreSQL Schema & RLS Policies</span>
          </div>
          <Button
            id="copy-sql-schema-btn"
            variant="outline"
            size="sm"
            onClick={handleCopySchema}
            className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold"
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
          Jalankan skrip ini di <strong>Supabase SQL Editor</strong> untuk membuat tabel{' '}
          <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">cashflow_transactions</code> dan{' '}
          <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">cashflow_recurring</code> lengkap dengan Row Level Security (RLS) terisolasi per <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">user_id</code>.
        </p>

        <pre className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-24 scrollbar-none font-mono">
          {SUPABASE_SQL_SCHEMA.slice(0, 320)}...
        </pre>
      </div>

      {/* Close Button */}
      <Button variant="outline" onClick={onClose} className="w-full text-xs font-semibold">
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
