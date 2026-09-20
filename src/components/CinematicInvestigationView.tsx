import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  Tag,
  Calendar,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { CopilotInvestigationResult } from '../utils/copilotEngine';
import { FinancialDataset, Transaction } from '../types';
import { InsightStory, buildStoryFromCopilotResult } from '../utils/insightStoryBuilder';
import { Play } from 'lucide-react';

interface CinematicInvestigationViewProps {
  result: CopilotInvestigationResult | null;
  dataset: FinancialDataset;
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onRunFollowUp: (prompt: string) => void;
  onResetHighlight: () => void;
  onLaunchStory?: (story: InsightStory) => void;
}

export const CinematicInvestigationView: React.FC<CinematicInvestigationViewProps> = ({
  result,
  dataset,
  onClose,
  onSelectTransaction,
  onRunFollowUp,
  onResetHighlight,
  onLaunchStory
}) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'evidence' | 'math' | 'records'>('evidence');

  if (!result) return null;

  const sym = dataset.currencySymbol || '₹';

  const handleLaunchStoryMode = () => {
    if (onLaunchStory) {
      onLaunchStory(buildStoryFromCopilotResult(result, dataset));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="relative rounded-3xl bg-gradient-to-b from-[#090D18] via-[#060912] to-[#04060C] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-black space-y-6 overflow-hidden"
    >
      {/* Top Ambient Glow Strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2 text-[10px] font-mono-num font-bold">
            <span className="text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>FIN-GUARD INVESTIGATION RESULT</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FileSpreadsheet className="w-3 h-3" />
              <span>Grounded in: {dataset.name}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {result.title}
          </h2>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onLaunchStory && (
            <button
              onClick={handleLaunchStoryMode}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-mono-num font-bold transition-all cursor-pointer shadow-md"
              title="Experience as an immersive 4-stage visual story"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Visual Story Mode</span>
            </button>
          )}
          <button
            onClick={onResetHighlight}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono-num transition-all cursor-pointer"
            title="Reset 3D Canvas Focus"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Helix Focus</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Concise Visual Explanation */}
      <div className="p-4 rounded-2xl bg-[#0C1220]/90 border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
        <p className="whitespace-pre-line font-medium">
          {result.summary}
        </p>
      </div>

      {/* 4 Core Supporting Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {result.keyMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#060810] border border-white/5 space-y-1"
          >
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-slate-400 block truncate">
              {metric.label}
            </span>
            <div className={`text-xl sm:text-2xl font-mono-num font-extrabold ${metric.color || 'text-white'}`}>
              {metric.value}
            </div>
            {metric.subtext && (
              <span className="text-[10px] text-slate-500 font-sans block truncate">
                {metric.subtext}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Visual Breakdown Bars (if applicable) */}
      {result.visualBreakdown && result.visualBreakdown.length > 0 && (
        <div className="space-y-2.5 p-4 rounded-2xl bg-[#060810] border border-white/5">
          <span className="text-[11px] font-mono-num font-bold uppercase tracking-wider text-slate-400 block">
            Distribution Proportions
          </span>

          <div className="space-y-2">
            {result.visualBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#22D3EE' }}
                    />
                    <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-white">
                      {sym}{item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, item.percentage))}%`,
                      backgroundColor: item.color || '#22D3EE'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable "Show Reasoning From Data" Section */}
      <div className="rounded-2xl border border-white/10 bg-[#070A14] overflow-hidden">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center space-x-2.5">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono-num">
              Show Reasoning From Data
            </span>
            <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Transparent Evidence
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono-num text-cyan-400">
            <span>{isReasoningExpanded ? 'Hide' : 'Inspect'} Formulas & Sources</span>
            {isReasoningExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {isReasoningExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 border-t border-white/5 space-y-4 pt-3"
            >
              {/* Tabs */}
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                <button
                  onClick={() => setSelectedTab('evidence')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-num font-semibold transition-all cursor-pointer ${
                    selectedTab === 'evidence'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Applied Filters
                </button>
                <button
                  onClick={() => setSelectedTab('math')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-num font-semibold transition-all cursor-pointer ${
                    selectedTab === 'math'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step-by-Step Math
                </button>
                <button
                  onClick={() => setSelectedTab('records')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-num font-semibold transition-all cursor-pointer ${
                    selectedTab === 'records'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Source Records ({result.supportingTransactions.length})
                </button>
              </div>

              {/* Tab 1: Filters */}
              {selectedTab === 'evidence' && (
                <div className="space-y-2 text-xs font-mono-num">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.reasoning.appliedFilters.map((filter, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#04060C] border border-white/5 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase block">{filter.label}</span>
                        <span className="text-slate-200 font-semibold">{filter.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-[#04060C] border border-white/5 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold">Data Provenance:</span> {result.reasoning.dataProvenance}
                  </div>
                </div>
              )}

              {/* Tab 2: Exact Math */}
              {selectedTab === 'math' && (
                <div className="space-y-2 text-xs font-mono-num">
                  <div className="p-3.5 rounded-xl bg-[#04060C] border border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase block">Formulas Applied</span>
                    {result.reasoning.formulasApplied.map((formula, idx) => (
                      <div key={idx} className="text-cyan-300 font-medium pl-2 border-l-2 border-cyan-500/40">
                        {formula}
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/5 text-emerald-400 font-bold">
                      → Result: {result.reasoning.exactCalculation}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Source Records */}
              {selectedTab === 'records' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono-num text-slate-400 block">
                    Click any transaction to open full vector telemetry inspection:
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {result.supportingTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="p-2.5 rounded-xl bg-[#04060C] hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between gap-2 text-xs font-mono-num"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white truncate">{tx.merchant}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{tx.category}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">{tx.date} • {tx.mode || tx.account}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : tx.status === 'anomaly' ? 'text-rose-400' : 'text-white'}`}>
                            {tx.type === 'income' ? '+' : '-'}{sym}{tx.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Follow-Up Suggested Inquiries */}
      {result.followUpSuggestions && result.followUpSuggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono-num text-slate-400 uppercase tracking-widest block">
            Suggested Follow-Up Investigations:
          </span>
          <div className="flex flex-wrap gap-2">
            {result.followUpSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => onRunFollowUp(sug)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
