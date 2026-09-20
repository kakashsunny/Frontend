import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileSpreadsheet,
  Play
} from 'lucide-react';
import { FinancialDataset, DNAFilterLayer, Transaction } from '../types';
import { FinancialDNACanvas } from './FinancialDNACanvas';
import { CinematicCommandHUD } from './CinematicCommandHUD';
import { CinematicInvestigationView } from './CinematicInvestigationView';
import { analyzeCopilotQuery, CopilotInvestigationResult } from '../utils/copilotEngine';
import {
  InsightStory,
  buildStoryFromRunway,
  buildStoryFromAnomaly,
  buildStoryFromCategory,
  buildStoryFromTaxShield
} from '../utils/insightStoryBuilder';
import { Zap } from 'lucide-react';

interface ActSeeProps {
  dataset: FinancialDataset;
  onProceedToUnderstand: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenTransparencyModal: () => void;
  onOpenStory?: (story: InsightStory) => void;
  onInvestigateTransaction?: (tx: Transaction) => void;
}

export const ActSee: React.FC<ActSeeProps> = ({
  dataset,
  onProceedToUnderstand,
  onSelectTransaction,
  onOpenTransparencyModal,
  onOpenStory,
  onInvestigateTransaction
}) => {
  const [activeLayer, setActiveLayer] = useState<DNAFilterLayer>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isMathExpanded, setIsMathExpanded] = useState(false);

  // Copilot Investigation State in Act 01
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationStepText, setInvestigationStepText] = useState<string>('');
  const [investigationProgress, setInvestigationProgress] = useState<number>(0);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [investigationResult, setInvestigationResult] = useState<CopilotInvestigationResult | null>(null);

  const sym = dataset.currencySymbol || '₹';

  const layers: { id: DNAFilterLayer; label: string; count?: number; color: string }[] = [
    { id: 'all', label: 'All Vectors', count: dataset.transactions.length, color: 'border-white/20 text-white' },
    { id: 'income', label: 'Income Currents', count: dataset.transactions.filter(t => t.type === 'income').length, color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'spending', label: 'Spending Orbits', count: dataset.transactions.filter(t => t.type === 'expense').length, color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'risk', label: 'Risk Anomalies', count: dataset.anomalies.length, color: 'border-rose-500/40 text-rose-400' },
    { id: 'habits', label: 'Habit Streams', count: dataset.subscriptions.length, color: 'border-purple-500/40 text-purple-400' }
  ];

  const handleCanvasSelect = (tx: Transaction | null) => {
    setSelectedTx(tx);
    if (tx) {
      onSelectTransaction(tx);
    }
  };

  const handleRunInvestigation = (query: string) => {
    if (isInvestigating) return;

    setActiveQuery(query);
    setIsInvestigating(true);
    setInvestigationProgress(15);
    setInvestigationStepText('Parsing natural query intent vectors...');

    const { steps, result } = analyzeCopilotQuery(query, dataset);

    // Animate through investigation stages
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const curStep = steps[stepIndex];
        setInvestigationStepText(curStep.text);
        setInvestigationProgress(curStep.progress);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsInvestigating(false);
          setInvestigationResult(result);
        }, 350);
      }
    }, 420);
  };

  const handleResetHighlight = () => {
    setInvestigationResult(null);
    setActiveQuery(null);
  };

  const handleLaunchRunwayStory = () => {
    if (onOpenStory) {
      onOpenStory(buildStoryFromRunway(dataset));
    }
  };

  const handleLaunchAnomalyStory = () => {
    if (dataset.anomalies.length > 0 && onOpenStory) {
      onOpenStory(buildStoryFromAnomaly(dataset.anomalies[0], dataset));
    }
  };

  const handleLaunchCategoryStory = () => {
    if (dataset.categoryBreakdowns.length > 0 && onOpenStory) {
      onOpenStory(buildStoryFromCategory(dataset.categoryBreakdowns[0].category, dataset));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-16 sm:pt-20 px-3 sm:px-6">
      {/* Editorial Title & Provenance Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono-num font-bold">
            <span className="text-cyan-400 uppercase tracking-widest">ACT 01 // SEE</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FileSpreadsheet className="w-3 h-3" />
              <span>Data source: {dataset.name}</span>
            </span>
            {investigationResult && (
              <span className="text-cyan-300 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-3 h-3" />
                <span>Copilot Highlighting: {investigationResult.highlightedTxIds.length} Nodes</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
            LIVING FINANCIAL DNA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Real-time particle projection calculated directly from {dataset.transactions.length} verified ledger entries ({dataset.timeRange.start} to {dataset.timeRange.end}).
          </p>
        </div>

        {/* Layer Filters & Quick Story Trigger */}
        <div className="flex items-center flex-wrap gap-1.5 bg-[#0A0E18]/90 p-1.5 rounded-2xl border border-white/5">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-num transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeLayer === layer.id
                  ? 'bg-white/10 text-white font-bold border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{layer.label}</span>
              {layer.count !== undefined && (
                <span className="text-[10px] opacity-60 font-normal">({layer.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Cinematic Command HUD for Copilot Natural Inquiries */}
      <CinematicCommandHUD
        dataset={dataset}
        onRunQuery={handleRunInvestigation}
        isInvestigating={isInvestigating}
        investigationStepText={investigationStepText}
        investigationProgress={investigationProgress}
        activeQuery={activeQuery}
        onClearInvestigation={handleResetHighlight}
      />

      {/* Investigation Answer Card (When Copilot query has completed) */}
      <AnimatePresence>
        {investigationResult && !isInvestigating && (
          <CinematicInvestigationView
            result={investigationResult}
            dataset={dataset}
            onClose={handleResetHighlight}
            onSelectTransaction={onSelectTransaction}
            onRunFollowUp={handleRunInvestigation}
            onResetHighlight={handleResetHighlight}
          />
        )}
      </AnimatePresence>

      {/* Canvas Viewport: Interactive 3D Financial DNA Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#04060B] shadow-2xl h-[520px] sm:h-[620px]">
        <FinancialDNACanvas
          dataset={dataset}
          activeLayer={activeLayer}
          selectedTransaction={selectedTx}
          onSelectTransaction={handleCanvasSelect}
          highlightedTxIds={investigationResult ? investigationResult.highlightedTxIds : []}
          highlightColor={investigationResult ? investigationResult.highlightColor : '#22D3EE'}
          isInvestigating={isInvestigating}
          investigationStepText={investigationStepText}
        />
      </div>

      {/* Bottom 4 Real Telemetry Metric Cards (Click to launch Story Mode!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
        {/* Metric 1: Liquid Runway */}
        <div
          onClick={handleLaunchRunwayStory}
          className="p-4 sm:p-5 md:p-6 rounded-2xl border border-white/5 hover:border-emerald-500/40 bg-gradient-to-b from-[#0C101A] to-[#07090E] space-y-1.5 cursor-pointer transition-all hover:scale-[1.01] group shadow-lg flex flex-col justify-between"
          title="Click to launch Liquid Runway Story Mode"
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono-num text-slate-400 uppercase tracking-wider">
              <span className="group-hover:text-emerald-300 transition-colors font-semibold">Liquid Runway</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Story</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-3xl font-mono-num font-extrabold text-white tracking-tight">
              {dataset.liquidRunwayMonths} <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">Months</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 pt-1 leading-snug">
            {sym}{dataset.totalLiquidity.toLocaleString('en-IN')} reserve cushion vs {sym}{dataset.monthlyBurnRate.toLocaleString('en-IN')}/mo burn.
          </p>
        </div>

        {/* Metric 2: Safe Daily Spend */}
        <div
          onClick={handleLaunchCategoryStory}
          className="p-4 sm:p-5 md:p-6 rounded-2xl border border-white/5 hover:border-cyan-500/40 bg-gradient-to-b from-[#0C101A] to-[#07090E] space-y-1.5 cursor-pointer transition-all hover:scale-[1.01] group shadow-lg flex flex-col justify-between"
          title="Click to launch Outlays Story Mode"
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono-num text-slate-400 uppercase tracking-wider">
              <span className="group-hover:text-cyan-300 transition-colors font-semibold">Safe Daily Burn</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Story</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-3xl font-mono-num font-extrabold text-cyan-300 tracking-tight">
              {sym}{dataset.safeToSpendDaily} <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">/ day</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 pt-1 leading-snug">
            Calculated from {sym}{dataset.monthlyIncome.toLocaleString('en-IN')}/mo verified baseline.
          </p>
        </div>

        {/* Metric 3: Behavioral Entropy */}
        <div
          onClick={handleLaunchRunwayStory}
          className="p-4 sm:p-5 md:p-6 rounded-2xl border border-white/5 hover:border-purple-500/40 bg-gradient-to-b from-[#0C101A] to-[#07090E] space-y-1.5 cursor-pointer transition-all hover:scale-[1.01] group shadow-lg flex flex-col justify-between"
          title="Click to launch Solvency Story Mode"
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono-num text-slate-400 uppercase tracking-wider">
              <span className="group-hover:text-purple-300 transition-colors font-semibold">Entropy Score</span>
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Story</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-3xl font-mono-num font-extrabold text-purple-300 tracking-tight">
              {dataset.entropyScore}% <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">Volatility</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 pt-1 leading-snug">
            Measured variance across {dataset.timeRange.totalDays} days of continuous outlays.
          </p>
        </div>

        {/* Metric 4: Real Anomaly Count */}
        <div
          className="p-4 sm:p-5 md:p-6 rounded-2xl border border-white/5 hover:border-rose-500/40 bg-gradient-to-b from-[#0C101A] to-[#07090E] space-y-2.5 transition-all shadow-lg flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono-num text-slate-400 uppercase tracking-wider">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Active Outliers</span>
              </span>
              <span className="text-rose-400 font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 whitespace-nowrap">
                Verification Needed
              </span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-3xl font-mono-num font-extrabold text-rose-400 tracking-tight">
              {dataset.anomalies.length < 10 ? `0${dataset.anomalies.length}` : dataset.anomalies.length} <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">Outliers</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
              Transactions exceeding 95th percentile category baselines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            {dataset.anomalies.length > 0 && onInvestigateTransaction && (
              <button
                onClick={() => {
                  const targetTx = dataset.transactions.find(t => t.id === dataset.anomalies[0].id) || dataset.transactions[0];
                  onInvestigateTransaction(targetTx);
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-rose-500/30 to-purple-500/30 hover:from-rose-500/40 hover:to-purple-500/40 border border-rose-500/40 text-rose-200 text-[10px] sm:text-xs font-mono-num font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all"
                title="Open full-screen interactive Transaction Investigation Scene"
              >
                <Zap className="w-3 h-3 text-rose-400 fill-current" />
                <span>Investigate</span>
              </button>
            )}
            <button
              onClick={handleLaunchAnomalyStory}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] sm:text-xs font-mono-num flex items-center space-x-1 cursor-pointer transition-all"
              title="Launch 4-stage visual story"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Story</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Transparency Section: "How this insight was calculated" */}
      <div className="p-4 sm:p-5 md:p-6 rounded-3xl border border-cyan-500/20 bg-[#070B14] space-y-3">
        <div
          onClick={() => setIsMathExpanded(!isMathExpanded)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white">
              How this insight was calculated
            </h3>
            <span className="text-[9px] sm:text-[10px] font-mono-num px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 truncate max-w-[200px] sm:max-w-none">
              Data source: {dataset.name}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono-num text-cyan-400 self-end sm:self-auto">
            <span>{isMathExpanded ? 'Collapse' : 'Expand Formulations'}</span>
            {isMathExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isMathExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-white/5 space-y-3"
          >
            <p className="text-xs sm:text-sm text-slate-300">
              FinGuard processes every transaction deterministically with zero artificial hallucination:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono-num">
              {dataset.calculationExplanations.map((calc, idx) => (
                <div key={idx} className="p-3 sm:p-4 rounded-2xl bg-[#05070D] border border-white/5 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] sm:text-xs">
                    <span className="font-bold text-white">{calc.metric}</span>
                    <span className="text-cyan-400 font-medium break-all">{calc.formula}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">{calc.description}</p>
                  <div className="text-[11px] sm:text-xs text-emerald-400 font-semibold pt-1 border-t border-white/5">
                    → {calc.exactMath}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={onOpenTransparencyModal}
                className="text-xs sm:text-sm font-mono-num text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
              >
                Open Full Mathematical Audit Modal →
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Act Progression Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">Ready to examine verified anomalies & subscriptions?</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Act 02 unpacks {dataset.subscriptions.length} recurring subscriptions, {dataset.taxDeductions.length} tax deductions, and statistical outliers.
          </p>
        </div>

        <button
          onClick={onProceedToUnderstand}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <span>PROCEED TO ACT 02: UNDERSTAND</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
