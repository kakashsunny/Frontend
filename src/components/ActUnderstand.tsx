import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calculator,
  FileSpreadsheet,
  Play
} from 'lucide-react';
import { FinancialDataset, AnomalyAlert, SubscriptionItem, Transaction } from '../types';
import {
  InsightStory,
  buildStoryFromAnomaly,
  buildStoryFromSubscription,
  buildStoryFromTaxShield,
  buildStoryFromCategory
} from '../utils/insightStoryBuilder';

interface ActUnderstandProps {
  dataset: FinancialDataset;
  onProceedToAsk: (prompt?: string) => void;
  onDisputeAnomaly: (id: string) => void;
  onAcknowledgeAnomaly: (id: string) => void;
  onOpenStory?: (story: InsightStory) => void;
  onInvestigateTransaction?: (tx: Transaction) => void;
}

export const ActUnderstand: React.FC<ActUnderstandProps> = ({
  dataset,
  onProceedToAsk,
  onDisputeAnomaly,
  onAcknowledgeAnomaly,
  onOpenStory,
  onInvestigateTransaction
}) => {
  const sym = dataset.currencySymbol || '₹';
  const activeAnomalies = dataset.anomalies.filter(a => a.status === 'detected');
  const totalTaxSaved = dataset.taxDeductions.reduce((acc, t) => acc + t.estimatedTaxSaved, 0);
  const totalDeductible = dataset.taxDeductions.reduce((acc, t) => acc + t.amount, 0);

  const handleOpenAnomalyStory = (anom: AnomalyAlert) => {
    if (onOpenStory) {
      onOpenStory(buildStoryFromAnomaly(anom, dataset));
    } else {
      onProceedToAsk(`Analyze outlier: ${anom.merchant} charge of ${sym}${anom.amount}`);
    }
  };

  const handleOpenSubStory = (sub: SubscriptionItem) => {
    if (onOpenStory) {
      onOpenStory(buildStoryFromSubscription(sub, dataset));
    } else {
      onProceedToAsk(`Audit recurring subscription: ${sub.name}`);
    }
  };

  const handleOpenTaxStory = () => {
    if (onOpenStory) {
      onOpenStory(buildStoryFromTaxShield(dataset));
    } else {
      onProceedToAsk('Generate a tax deduction summary for Section 80C and Section 80D');
    }
  };

  const handleOpenCategoryStory = (categoryName: string) => {
    if (onOpenStory) {
      onOpenStory(buildStoryFromCategory(categoryName, dataset));
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pt-16 sm:pt-20 px-3 sm:px-6">
      {/* Editorial Header */}
      <div className="border-b border-white/5 pb-6 space-y-2">
        <div className="flex items-center space-x-2 text-[11px] font-mono-num font-bold">
          <span className="text-emerald-400 uppercase tracking-widest">ACT 02 // UNDERSTAND</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Data source: {dataset.name}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          LATENT PATTERNS & RISK RADAR
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          FinGuard isolates micro-leakages, subscription commitments, counterparty concentration, and tax shields directly from your {dataset.transactions.length} statement rows. Click any insight to launch its visual investigation story.
        </p>
      </div>

      {/* 1. Category Distribution & Top Counterparties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-4 sm:p-6 md:p-7 rounded-3xl border border-white/5 bg-[#090D15] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/5">
            <div>
              <span className="text-[10px] sm:text-xs font-mono-num uppercase tracking-wider text-cyan-400 font-bold">
                Categorical Outlays
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white">Expenditure Distribution</h3>
            </div>
            <span className="text-xs sm:text-sm font-mono-num font-bold text-slate-300">
              {sym}{dataset.totalExpenseAllTime.toLocaleString('en-IN')} Total Outlays
            </span>
          </div>

          <div className="space-y-3">
            {dataset.categoryBreakdowns.slice(0, 7).map((cat, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenCategoryStory(cat.category)}
                className="space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                title={`Launch visual story for ${cat.category}`}
              >
                <div className="flex justify-between text-xs sm:text-sm font-mono-num">
                  <span className="text-white group-hover:text-cyan-300 font-semibold flex items-center gap-1.5 truncate max-w-[60%] sm:max-w-none">
                    <span>{cat.category}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-normal">({cat.count} txns)</span>
                  </span>
                  <span className="text-slate-300 font-bold shrink-0">
                    {sym}{cat.amount.toLocaleString('en-IN')} <span className="text-[10px] sm:text-xs text-slate-500 font-normal">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Merchants / Payees (1 col) */}
        <div className="p-4 sm:p-6 md:p-7 rounded-3xl border border-white/5 bg-[#090D15] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <span className="text-[10px] sm:text-xs font-mono-num uppercase tracking-wider text-emerald-400 font-bold">
                Concentration
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white">Top Payees</h3>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {dataset.topMerchants.map((m, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#06080E] border border-white/5 flex items-center justify-between text-xs sm:text-sm gap-2">
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-white block truncate">{m.name}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-mono-num">{m.category} • {m.count} txns</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono-num font-extrabold text-white block">{sym}{m.amount.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono-num text-slate-500">{m.percentage}% of outlays</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Anomaly Perimeter (High Outliers / Spikes) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight">
              Calculated Anomaly Outliers ({activeAnomalies.length})
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono-num text-slate-400">
            Click any card to launch visual story
          </span>
        </div>

        {activeAnomalies.length === 0 ? (
          <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No active anomalies flagged</h3>
            <p className="text-xs text-slate-400">All ledger transactions align with standard variance boundaries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {activeAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 sm:p-5 md:p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#140D14] via-[#0D0910] to-[#070508] space-y-4 flex flex-col justify-between hover:border-rose-500/60 transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono-num">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 uppercase">
                      {anom.severity} Alert • {anom.confidence}% Confidence
                    </span>
                    <span className="text-slate-400">{anom.date}</span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">{anom.title}</h3>
                    <div className="text-lg sm:text-xl md:text-2xl font-mono-num font-black text-rose-400 pt-0.5">
                      {sym}{anom.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                    {anom.rationale}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] sm:text-xs text-emerald-300 flex items-start space-x-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Prescription:</strong> {anom.suggestedAction}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {onInvestigateTransaction && (
                    <button
                      onClick={() => {
                        const targetTx = dataset.transactions.find(t => t.id === anom.id) || {
                          id: anom.id,
                          date: anom.date,
                          merchant: anom.merchant,
                          amount: anom.amount,
                          category: anom.category,
                          type: 'expense',
                          status: 'anomaly',
                          anomalyReason: anom.rationale,
                          anomalySeverity: anom.severity,
                          anomalyConfidence: anom.confidence,
                          tags: ['Anomaly'],
                          account: 'Primary Account',
                          currency: dataset.currencySymbol === '₹' ? 'INR' : 'USD'
                        } as Transaction;
                        onInvestigateTransaction(targetTx);
                      }}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-rose-500/30 to-purple-500/30 hover:from-rose-500/40 hover:to-purple-500/40 border border-rose-500/40 text-rose-200 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      title="Open interactive multi-vector transaction investigation network"
                    >
                      <Zap className="w-3.5 h-3.5 text-rose-400 fill-current" />
                      <span>Investigate</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenAnomalyStory(anom)}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Story</span>
                  </button>
                  <button
                    onClick={() => onDisputeAnomaly(anom.id)}
                    className="py-2 px-3 bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Dispute
                  </button>
                  <button
                    onClick={() => onAcknowledgeAnomaly(anom.id)}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Subscription Commitments & Tax Shield Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Left: Recurring Subscriptions */}
        <div className="p-4 sm:p-6 md:p-7 rounded-3xl border border-white/5 bg-[#090D15] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <span className="text-[10px] sm:text-xs font-mono-num uppercase tracking-wider text-purple-400 font-bold">
                Recurring Commitments
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white">Subscription Radar</h3>
            </div>
            <span className="text-xs sm:text-sm font-mono-num font-bold text-purple-300 px-2.5 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
              {dataset.subscriptions.length} Tracked Services
            </span>
          </div>

          <div className="space-y-2.5">
            {dataset.subscriptions.map((sub) => {
              const isIdle = sub.usageStatus === 'idle';
              const hasCreep = !!sub.priceCreep;

              return (
                <div
                  key={sub.id}
                  onClick={() => handleOpenSubStory(sub)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] ${
                    isIdle
                      ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                      : hasCreep
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                      : 'bg-[#07090F] border-white/5 hover:border-purple-500/40'
                  }`}
                  title={`Launch Story for ${sub.name}`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">{sub.name}</span>
                      {isIdle && (
                        <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          IDLE
                        </span>
                      )}
                      {hasCreep && (
                        <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                          +{sub.priceCreep?.increasePercent}% CREEP
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {sub.suggestedAction || `${sub.category} recurring pattern`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-mono-num font-extrabold text-white block">
                      {sym}{sub.amount.toFixed(0)}/mo
                    </span>
                    <span className="text-[10px] font-mono-num text-slate-500">
                      Launch Story →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tax Shield Deductions */}
        <div className="p-4 sm:p-6 md:p-7 rounded-3xl border border-white/5 bg-[#090D15] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <span className="text-[10px] sm:text-xs font-mono-num uppercase tracking-wider text-emerald-400 font-bold">
                Tax Shield Deductions
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-white">Section 80C & 80D Auto-Vault</h3>
            </div>
            <span className="text-xs sm:text-sm font-mono-num font-bold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              {sym}{totalTaxSaved.toLocaleString('en-IN')} Offset Identified
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            FinGuard auto-vectorized {sym}{totalDeductible.toLocaleString('en-IN')} in statutory Section 80C (PPF, LIC) and Section 80D medical checkups.
          </p>

          <div className="space-y-2">
            {dataset.taxDeductions.slice(0, 4).map((tax) => (
              <div
                key={tax.id}
                onClick={handleOpenTaxStory}
                className="p-3 rounded-2xl bg-[#07090F] hover:bg-slate-800 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">{tax.merchant}</span>
                  <span className="text-[10px] sm:text-xs font-mono-num text-slate-500 truncate block">{tax.irsCode}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono-num font-bold text-emerald-400 block">{sym}{tax.amount.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono-num text-slate-400">Save ~{sym}{tax.estimatedTaxSaved.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleOpenTaxStory}
            className="w-full py-2.5 sm:py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm font-bold text-emerald-400 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Tax Shield Story Mode</span>
          </button>
        </div>
      </div>

      {/* Act Progression Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">Have questions about your money or patterns?</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Act 03 connects directly to the context-aware FinGuard reasoning engine grounded in your dataset.
          </p>
        </div>

        <button
          onClick={() => onProceedToAsk()}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <span>PROCEED TO ACT 03: ASK AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
