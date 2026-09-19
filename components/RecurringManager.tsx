'use client';

import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Check, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { RecurringBill, TransactionType, Category, Account, RecurrenceFrequency } from '@/lib/types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface RecurringManagerProps {
  recurringBills: RecurringBill[];
  onAddRecurring: (bill: Omit<RecurringBill, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onMarkPaid: (bill: RecurringBill) => void;
  baseCurrency?: string;
}

const CATEGORY_OPTIONS: { label: Category; icon: string }[] = [
  { label: 'Tagihan', icon: '💡' },
  { label: 'Makanan', icon: '🍽️' },
  { label: 'Transportasi', icon: '🚗' },
  { label: 'Tempat Tinggal', icon: '🏠' },
  { label: 'Software & SaaS', icon: '💻' },
  { label: 'Kesehatan', icon: '💊' },
  { label: 'Gaji', icon: '💼' },
  { label: 'Bisnis & Klien', icon: '🤝' },
  { label: 'Belanja', icon: '🛍️' },
  { label: 'Lainnya', icon: '✨' },
];

function getDefaultNextDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  recurringBills,
  onAddRecurring,
  onDeleteRecurring,
  onMarkPaid,
  baseCurrency = 'IDR',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('outflow');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Tagihan');
  const [account, setAccount] = useState<Account>('Operating Account');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState<string>(getDefaultNextDueDate);

  const currencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.IDR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    onAddRecurring({
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      category,
      account,
      frequency,
      nextDueDate,
      autoRecord: true,
      currency: baseCurrency,
    });

    setTitle('');
    setAmount('');
    setShowAddForm(false);
  };

  // Calculate monthly fixed commitments
  const totalFixedInflow = recurringBills
    .filter((b) => b.type === 'inflow')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalFixedOutflow = recurringBills
    .filter((b) => b.type === 'outflow')
    .reduce((sum, b) => sum + b.amount, 0);

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Telat ${Math.abs(diffDays)} hari`, isPast: true };
    if (diffDays === 0) return { text: 'Jatuh tempo hari ini', isToday: true };
    return { text: `${diffDays} hari lagi`, isPast: false };
  };

  const getFrequencyLabel = (freq: RecurrenceFrequency) => {
    switch (freq) {
      case 'daily': return 'Harian';
      case 'weekly': return 'Mingguan';
      case 'biweekly': return '2 Mingguan';
      case 'monthly': return 'Bulanan';
      case 'quarterly': return 'Triwulan (3 Bulan)';
      case 'yearly': return 'Tahunan';
      default: return freq;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Overview Cards for Commitments (Monochrome) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="w-4 h-4 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>Pemasukan Rutin</span>
          </div>
          <div className="text-base sm:text-xl font-black text-zinc-950 dark:text-white">
            +{formatCurrency(totalFixedInflow, baseCurrency)}
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Retainer & Gaji Rutin</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 flex items-center justify-center">
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>Tagihan Rutin</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-zinc-700 dark:text-zinc-300">
            -{formatCurrency(totalFixedOutflow, baseCurrency)}
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Sewa, Tagihan, SaaS</span>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Jadwal Tagihan & Rutinitas</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Komitmen berkala dan pembayaran rutin</p>
        </div>
        <Button
          id="toggle-add-recurring-btn"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'default'}
          className="text-xs flex items-center gap-1.5 font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Batal' : 'Tambah Tagihan'}</span>
        </Button>
      </div>

      {/* Add Recurring Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xl animate-in slide-in-from-top-2 duration-200 text-zinc-900 dark:text-zinc-100"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Tambah Tagihan / Pemasukan Berkala
          </h4>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('outflow');
                setCategory('Tagihan');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                type === 'outflow'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Pengeluaran Rutin (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('inflow');
                setCategory('Bisnis & Klien');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                type === 'inflow'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Pemasukan Rutin (+)
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Nama Tagihan / Rutinitas
            </label>
            <Input
              id="recurring-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tagihan WiFi Indihome, Listrik PLN, Retainer Klien"
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Nominal ({currencyInfo.code})
              </label>
              <Input
                id="recurring-amount-input"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={baseCurrency === 'IDR' ? 'Contoh: 350000' : '0.00'}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Frekuensi
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
              >
                <option value="weekly">Mingguan</option>
                <option value="biweekly">2 Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Triwulan (3 Bulan)</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
          </div>

          {/* Category selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Kategori
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCategory(c.label)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    category === c.label
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="mr-1">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Jatuh Tempo Berikutnya
              </label>
              <Input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Rekening
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as Account)}
                className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
              >
                <option value="Checking Account">Checking Account</option>
                <option value="Operating Account">Operating Account</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Savings / Reserve">Savings / Reserve</option>
                <option value="Cash / Petty">Cash / Petty</option>
              </select>
            </div>
          </div>

          <Button type="submit" size="sm" className="w-full text-xs font-bold mt-2">
            Simpan Jadwal Rutin
          </Button>
        </form>
      )}

      {/* List of Recurring Items */}
      <div className="space-y-2.5">
        {recurringBills.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-2">
            <Repeat className="w-6 h-6 mx-auto text-zinc-400" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Belum ada jadwal tagihan rutin. Tambahkan langganan atau tagihan Anda.
            </p>
          </div>
        ) : (
          recurringBills.map((bill) => {
            const dueInfo = getDaysUntil(bill.nextDueDate);
            const isInflow = bill.type === 'inflow';

            return (
              <div
                key={bill.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isInflow
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate block">
                        {bill.title}
                      </span>
                      <Badge
                        variant={dueInfo.isPast ? 'destructive' : dueInfo.isToday ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 shrink-0"
                      >
                        {dueInfo.text}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{bill.category}</span>
                      <span>•</span>
                      <span>{getFrequencyLabel(bill.frequency)}</span>
                      <span>•</span>
                      <span>Jatuh tempo: {bill.nextDueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isInflow ? 'text-zinc-950 dark:text-white font-black' : 'text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {formatCurrency(bill.amount, baseCurrency, { includeSign: true })}
                    </span>
                    <span className="text-[10px] text-zinc-400">{bill.account}</span>
                  </div>

                  {/* Mark as Paid Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkPaid(bill)}
                    className="h-8 px-2.5 text-[11px] gap-1 font-semibold"
                    title="Catat transaksi sekarang dan perbarui tanggal jatuh tempo"
                  >
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Catat</span>
                  </Button>

                  <button
                    onClick={() => onDeleteRecurring(bill.id)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg transition"
                    title="Hapus jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
