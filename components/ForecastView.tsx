'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, RecurringBill, ForecastDay } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { Badge } from './ui/badge';

interface ForecastViewProps {
  currentBalance: number;
  recurringBills: RecurringBill[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  currentBalance,
  recurringBills,
  transactions,
  baseCurrency = 'IDR',
}) => {
  const isIDR = baseCurrency === 'IDR';
  const [safetyThreshold] = useState(isIDR ? 5000000 : 2500);

  // Generate 30 days forecast forward
  const forecastDays: ForecastDay[] = useMemo(() => {
    const days: ForecastDay[] = [];
    const today = new Date();
    let rollingBalance = typeof currentBalance === 'number' && !isNaN(currentBalance) ? currentBalance : 0;
    const safeBills = Array.isArray(recurringBills) ? recurringBills : [];

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      let dayInflow = 0;
      let dayOutflow = 0;
      const dayEvents: string[] = [];

      // Check recurring items scheduled for this date or interval
      safeBills.forEach((bill) => {
        if (!bill) return;
        const dueDate = bill.nextDueDate;
        const billDue = dueDate ? new Date(dueDate) : null;
        const isSameDayOfMonth = billDue && !isNaN(billDue.getTime()) && billDue.getDate() === date.getDate();
        const amt = typeof bill.amount === 'number' && !isNaN(bill.amount) ? bill.amount : 0;

        // For monthly bills or direct next due date match
        if (dueDate === dateStr || (bill.frequency === 'monthly' && isSameDayOfMonth)) {
          if (bill.type === 'inflow') {
            dayInflow += amt;
            dayEvents.push(`+ ${formatCurrency(amt, baseCurrency)} (${bill.title || 'Pemasukan'})`);
          } else {
            dayOutflow += amt;
            dayEvents.push(`- ${formatCurrency(amt, baseCurrency)} (${bill.title || 'Pengeluaran'})`);
          }
        }
      });

      const dayNet = dayInflow - dayOutflow;
      rollingBalance += dayNet;

      days.push({
        date: dateStr,
        dayLabel: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        inflow: dayInflow,
        outflow: dayOutflow,
        net: dayNet,
        projectedBalance: rollingBalance,
        events: dayEvents,
      });
    }

    return days;
  }, [currentBalance, recurringBills, baseCurrency]);

  // Find minimum cash point over 30 days
  const lowestPoint = useMemo(() => {
    if (forecastDays.length === 0) return { balance: currentBalance, date: '' };
    return forecastDays.reduce(
      (min, day) => (day.projectedBalance < min.balance ? { balance: day.projectedBalance, date: day.dayLabel } : min),
      { balance: Infinity, date: '' }
    );
  }, [forecastDays, currentBalance]);

  const endBalance = forecastDays[forecastDays.length - 1]?.projectedBalance ?? currentBalance;
  const isSafetyBreached = lowestPoint.balance < safetyThreshold;

  // Visual SVG chart calculation
  const chartPoints = useMemo(() => {
    if (forecastDays.length === 0) return '';
    const balances = [currentBalance, ...forecastDays.map((d) => d.projectedBalance)];
    const min = Math.min(...balances, 0);
    const max = Math.max(...balances, isIDR ? 50000000 : 10000);
    const range = max - min || 1;

    const width = 360;
    const height = 110;
    const step = width / (balances.length - 1);

    return balances
      .map((bal, idx) => {
        const x = idx * step;
        const y = height - ((bal - min) / range) * (height - 20) - 10;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [forecastDays, currentBalance, isIDR]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Forecast Status Header Card (Monochrome) */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Trayektori Runway 30 Hari</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Model likuiditas prediksi masa depan</p>
            </div>
          </div>

          <Badge variant={isSafetyBreached ? 'secondary' : 'default'} className="text-xs font-semibold">
            {isSafetyBreached ? 'Peringatan Saldo Rendah' : 'Arus Kas Sehat'}
          </Badge>
        </div>

        {/* Projected 30-Day Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">Proyeksi 30 Hari Lagi</span>
            <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
              {formatCurrency(endBalance, baseCurrency)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">Titik Kas Terendah (Dip)</span>
            <span className="text-lg sm:text-xl font-extrabold text-zinc-950 dark:text-white">
              {formatCurrency(lowestPoint.balance, baseCurrency)}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">{lowestPoint.date}</span>
          </div>
        </div>

        {/* Visual Sparkline Canvas */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Hari Ini ({formatCurrency(currentBalance, baseCurrency)})</span>
            <span>+30 Hari ({formatCurrency(endBalance, baseCurrency)})</span>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 360 110" className="w-full h-24 overflow-visible">
              {/* Threshold line */}
              <line
                x1="0"
                y1="85"
                x2="360"
                y2="85"
                stroke="currentColor"
                className="text-zinc-300 dark:text-zinc-700"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />

              {/* Trajectory path */}
              <path
                d={chartPoints}
                fill="none"
                stroke="currentColor"
                className="text-zinc-900 dark:text-zinc-100"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
              Proyeksi Saldo Berjalan
            </span>
            <span>Batas Aman: {formatCurrency(safetyThreshold, baseCurrency)}</span>
          </div>
        </div>

        {/* Alert Banner if cash dips below safety */}
        {isSafetyBreached && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-900 dark:text-zinc-100" />
            <div>
              <span className="font-semibold block text-zinc-950 dark:text-white">Perhatian Penurunan Kas</span>
              Saldo diproyeksikan menyentuh {formatCurrency(lowestPoint.balance, baseCurrency)} sekitar tanggal{' '}
              {lowestPoint.date}. Pertimbangkan untuk mengatur prioritas pengeluaran.
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Milestones Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          Jadwal Tagihan & Pemasukan Rutin (30 Hari Kedepan)
        </h4>

        <div className="space-y-2">
          {forecastDays
            .filter((d) => d.events.length > 0)
            .map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white block">{day.dayLabel}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {day.events.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold block ${
                      day.net >= 0 ? 'text-zinc-950 dark:text-white font-extrabold' : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {formatCurrency(day.net, baseCurrency, { includeSign: true })}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Saldo: {formatCurrency(day.projectedBalance, baseCurrency)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
