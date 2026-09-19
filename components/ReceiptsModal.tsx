'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  FileText, 
  Trash2, 
  Check, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ReceiptItem {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  imageUrl?: string;
  category: string;
}

interface ReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const ReceiptsModal: React.FC<ReceiptsModalProps> = ({
  isOpen,
  onClose,
  currencySymbol = 'RM',
}) => {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([
    {
      id: 'rec-1',
      merchant: 'Nasi Kandar Pelita',
      amount: 6.00,
      date: '19 Sep 2026',
      category: 'Food & Dining',
    },
    {
      id: 'rec-2',
      merchant: 'FamilyMart KL Sentral',
      amount: 14.50,
      date: '18 Sep 2026',
      category: 'Food & Dining',
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (!merchant) setMerchant(file.name.replace(/\.[^/.]+$/, ''));
      if (!amount) setAmount('12.50');
    }
  };

  const handleAddReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) return;

    const newRec: ReceiptItem = {
      id: `rec-${Date.now()}`,
      merchant: merchant.trim(),
      amount: parseFloat(amount) || 0,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      imageUrl: previewUrl || undefined,
      category: 'General',
    };

    setReceipts([newRec, ...receipts]);
    setMerchant('');
    setAmount('');
    setPreviewUrl(null);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Receipts Manager
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Arsip foto & bukti struk pembayaran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Upload Box */}
          {!isUploading ? (
            <button
              type="button"
              onClick={() => setIsUploading(true)}
              className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Bukti Struk Baru</span>
            </button>
          ) : (
            <form onSubmit={handleAddReceipt} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Unggah Struk
                </span>
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Batal
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition p-2 text-center"
              >
                {previewUrl ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Gambar struk terpilih
                  </span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Klik atau seret file foto struk di sini
                    </span>
                  </>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Nama Toko / Merchant
                </label>
                <Input
                  type="text"
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Contoh: FamilyMart"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Total Nominal ({currencySymbol})
                </label>
                <Input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-bold"
                />
              </div>

              <Button type="submit" className="w-full h-9 text-xs font-bold">
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Simpan Struk</span>
              </Button>
            </form>
          )}

          {/* List of Receipts */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
              Daftar Struk Tersimpan ({receipts.length})
            </span>

            {receipts.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {rec.merchant}
                    </h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {rec.date} · {rec.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {currencySymbol} {rec.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReceipts(receipts.filter((r) => r.id !== rec.id))}
                    className="p-1 rounded-md text-zinc-400 hover:text-rose-500 transition"
                    title="Hapus struk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
