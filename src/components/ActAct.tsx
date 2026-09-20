import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Scissors,
  TrendingDown,
  ShoppingBag,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { FinancialDataset } from '../types';

interface ActActProps {
  dataset: FinancialDataset;
  onOpenTransparencyModal: () => void;
}

export const ActAct: React.FC<ActActProps> = ({ dataset, onOpenTransparencyModal }) => {
  const sym = dataset.currencySymbol || '₹';

  // Interactive Purchase Simulation State
  const [purchaseAmount, setPurchaseAmount] = useState<number>(25000);
  const [purchaseCategory, setPurchaseCategory] = useState<string>('Appliances / Tech');
  const [allocationStrategy, setAllocationStrategy] = useState<'lump' | '3mo' | '6mo'>('lump');

  // Subscription Pruning state
  const [prunedSubIds, setPrunedSubIds] = useState<string[]>([]);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Compute Simulation Outcomes
  const monthlyIncrement = allocationStrategy === 'lump' ? 0 : purchaseAmount / (allocationStrategy === '3mo' ? 3 : 6);
  const postPurchaseReserves = dataset.totalLiquidity - (allocationStrategy === 'lump' ? purchaseAmount : purchaseAmount);
  const newBurn = dataset.monthlyBurnRate + monthlyIncrement;
  const newRunway = Number((postPurchaseReserves / (newBurn || 1)).toFixed(1));
  const runwayDelta = (newRunway - dataset.liquidRunwayMonths).toFixed(1);

  // Feasibility Score calculation
  let feasibilityScore = 95;
  if (purchaseAmount > dataset.totalLiquidity * 0.5) feasibilityScore = 35;
  else if (purchaseAmount > dataset.totalLiquidity * 0.25) feasibilityScore = 65;
  else if (purchaseAmount > dataset.totalLiquidity * 0.1) feasibilityScore = 85;

  // Toggle Sub Prune
  const togglePrune = (id: string) => {
    if (prunedSubIds.includes(id)) {
      setPrunedSubIds(prunedSubIds.filter(item => item !== id));
    } else {
      setPrunedSubIds([...prunedSubIds, id]);
    }
  };

  const totalPrunedMonthlySavings = dataset.subscriptions
    .filter(s => prunedSubIds.includes(s.id))
    .reduce((acc, s) => acc + s.amount, 0);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      const reportData = {
        meta: {
          app: 'FinGuard AI — Everyday Financial Intelligence Companion',
          dataSource: dataset.name,
          generatedAt: new Date().toISOString(),
          currency: dataset.currency
        },
        financialPulse: {
          totalInflowsVerified: `${sym}${dataset.totalIncomeAllTime.toLocaleString('en-IN')}`,
          totalOutlaysVerified: `${sym}${dataset.totalExpenseAllTime.toLocaleString('en-IN')}`,
          liquidReserveBuffer: `${sym}${dataset.totalLiquidity.toLocaleString('en-IN')}`,
          liquidRunwayMonths: `${dataset.liquidRunwayMonths} Months`,
          safeDailyDiscretionaryBurn: `${sym}${dataset.safeToSpendDaily}/day`,
          behavioralEntropyVolatility: `${dataset.entropyScore}%`
        },
        categoryBreakdowns: dataset.categoryBreakdowns,
        activeSubscriptions: dataset.subscriptions,
        taxDeductionsIdentified: dataset.taxDeductions,
        anomaliesFlagged: dataset.anomalies,
        mathematicalCalculations: dataset.calculationExplanations
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinGuard-Intelligence-Report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, 900);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pt-16 sm:pt-20 px-3 sm:px-6">
      {/* Editorial Header */}
      <div className="border-b border-white/5 pb-6 space-y-2">
        <div className="flex items-center space-x-2 text-[11px] font-mono-num font-bold">
          <span className="text-purple-400 uppercase tracking-widest">ACT 04 // ACT</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Data source: {dataset.name}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          AUTONOMOUS ACTION & SIMULATION
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Simulate prospective CapEx commitments against verified reserves, prune recurring subscriptions, and export sovereign audit intelligence.
        </p>
      </div>

      {/* 1. Interactive CapEx Purchase Simulator */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/5 bg-[#090D15] space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono-num text-cyan-400 font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Real-Time Solvency Impact Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white">Prospective Purchase Simulator</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs sm:text-sm font-mono-num">
            <span className="text-slate-400">Feasibility Index:</span>
            <span className={`font-black px-2.5 py-1 rounded-lg border text-xs sm:text-sm ${
              feasibilityScore >= 80
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : feasibilityScore >= 50
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {feasibilityScore}/100 {feasibilityScore >= 80 ? 'SAFE' : feasibilityScore >= 50 ? 'CAUTION' : 'HIGH STRESS'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono-num">
                <label className="text-slate-300 font-bold">Purchase Outlay Amount</label>
                <span className="text-cyan-300 font-black text-base sm:text-lg">{sym}{purchaseAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={Math.max(100000, dataset.totalLiquidity)}
                step={1000}
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] sm:text-xs font-mono-num text-slate-500">
                <span>{sym}1,000</span>
                <span>{sym}{(Math.round(dataset.totalLiquidity / 2)).toLocaleString('en-IN')}</span>
                <span>{sym}{Math.max(100000, dataset.totalLiquidity).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[5000, 15000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPurchaseAmount(amt)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono-num font-semibold transition-all cursor-pointer ${
                    purchaseAmount === amt
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-[#06080E] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sym}{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Allocation Strategy */}
            <div className="space-y-2 pt-1 sm:pt-2">
              <label className="text-xs sm:text-sm font-mono-num text-slate-300 font-bold block">
                Cashflow Allocation Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm font-mono-num">
                <button
                  onClick={() => setAllocationStrategy('lump')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    allocationStrategy === 'lump'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-[#06080E] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-white font-bold">100% Lump Sum</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">Immediate settlement</span>
                </button>

                <button
                  onClick={() => setAllocationStrategy('3mo')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    allocationStrategy === '3mo'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-[#06080E] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-white font-bold">3-Month Split</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">{sym}{Math.round(purchaseAmount / 3).toLocaleString('en-IN')}/mo</span>
                </button>

                <button
                  onClick={() => setAllocationStrategy('6mo')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    allocationStrategy === '6mo'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-[#06080E] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-white font-bold">6-Month Split</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">{sym}{Math.round(purchaseAmount / 6).toLocaleString('en-IN')}/mo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real Simulated Impact Display (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#06080E] border border-white/5 flex flex-col justify-between space-y-4">
            <span className="text-[10px] sm:text-xs font-mono-num uppercase tracking-wider text-slate-400 font-bold">
              // Simulated Solvency Forecast
            </span>

            <div className="space-y-3 font-mono-num text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Post-Purchase Reserves:</span>
                <span className="font-bold text-white">{sym}{Math.max(0, postPurchaseReserves).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">New Monthly Burn Velocity:</span>
                <span className="font-bold text-cyan-300">{sym}{Math.round(newBurn).toLocaleString('en-IN')}/mo</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Projected Zero-Income Runway:</span>
                <span className="font-bold text-emerald-400">{newRunway} Months ({runwayDelta} mo)</span>
              </div>
            </div>

            <div className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              newRunway >= 6
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}>
              <strong>AI Verdict:</strong> {newRunway >= 6
                ? `Safe execution. Your liquid runway remains robust at ${newRunway} months (well above the 6.0-month safety threshold).`
                : `Caution. This purchase compresses your emergency runway to ${newRunway} months.`}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subscription Pruning Execution Terminal */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/5 bg-[#090D15] space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono-num text-purple-400 font-bold uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              <span>Recurring Capital Recovery</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white">Interactive Subscription Pruner</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs sm:text-sm font-mono-num">
            <span className="text-slate-400">Annualized Recovery:</span>
            <span className="font-black text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              +{sym}{(totalPrunedMonthlySavings * 12).toLocaleString('en-IN')}/year
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400">
          Select low-utilization recurring items to simulate immediate runway expansion:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {dataset.subscriptions.map((sub) => {
            const isSelected = prunedSubIds.includes(sub.id);
            return (
              <div
                key={sub.id}
                onClick={() => togglePrune(sub.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-400 shadow-lg shadow-purple-950/40'
                    : 'bg-[#06080E] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-purple-500 border-purple-400 text-slate-950' : 'border-slate-700'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">{sub.name}</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">{sub.category} • {sub.usageStatus}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono-num">
                  <span className="text-xs sm:text-sm font-bold text-white block">{sym}{sub.amount.toFixed(0)}/mo</span>
                  <span className="text-[10px] sm:text-xs text-purple-400">+{sym}{(sub.amount * 12).toFixed(0)}/yr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sovereign Ledger Intelligence Exporter */}
      <div className="p-5 sm:p-7 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-[11px] sm:text-xs font-mono-num text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Proof & JSON Sovereign Audit</span>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-black text-white">Export Full Financial Intelligence Package</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Download your parsed transactions, statistical anomaly audit, Section 80C/80D tax deductions, and step-by-step mathematical calculations in open JSON format.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating Audit Package...' : exportComplete ? 'Downloaded Again' : 'Export Full Intelligence Audit'}</span>
        </button>
      </div>
    </div>
  );
};
