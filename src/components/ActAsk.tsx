import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  RotateCcw,
  Compass,
  Layers,
  Search,
  Activity,
  CheckCircle2,
  Calendar,
  CreditCard,
  Zap,
  HelpCircle
} from 'lucide-react';
import { FinancialDataset, Transaction } from '../types';
import { FinancialDNACanvas } from './FinancialDNACanvas';
import { CinematicCommandHUD } from './CinematicCommandHUD';
import { CinematicInvestigationView } from './CinematicInvestigationView';
import { analyzeCopilotQuery, CopilotInvestigationResult } from '../utils/copilotEngine';
import { InsightStory } from '../utils/insightStoryBuilder';

interface ActAskProps {
  dataset: FinancialDataset;
  initialPrompt?: string;
  onProceedToAct: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onOpenStory?: (story: InsightStory) => void;
}

export const ActAsk: React.FC<ActAskProps> = ({
  dataset,
  initialPrompt,
  onProceedToAct,
  onSelectTransaction,
  onOpenStory
}) => {
  const sym = dataset.currencySymbol || '₹';

  // Copilot Investigation State
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationStepText, setInvestigationStepText] = useState<string>('');
  const [investigationProgress, setInvestigationProgress] = useState<number>(0);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [investigationResult, setInvestigationResult] = useState<CopilotInvestigationResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([
    'Where is my money going?',
    'What changed recently?',
    'Find unusual spending',
    'Show me my biggest recurring expense'
  ]);

  const handleRunInvestigation = (query: string) => {
    if (isInvestigating) return;

    setActiveQuery(query);
    setIsInvestigating(true);
    setInvestigationProgress(10);
    setInvestigationStepText('Parsing query vectors & intent signatures...');

    // Add to history if not already present
    if (!queryHistory.includes(query)) {
      setQueryHistory(prev => [query, ...prev.slice(0, 5)]);
    }

    const { steps, result } = analyzeCopilotQuery(query, dataset);

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
        }, 320);
      }
    }, 380);
  };

  useEffect(() => {
    if (initialPrompt) {
      handleRunInvestigation(initialPrompt);
    } else if (!investigationResult && !isInvestigating) {
      // Default to opening inquiry
      handleRunInvestigation('Where is my money going?');
    }
  }, [initialPrompt]);

  const handleResetHighlight = () => {
    setInvestigationResult(null);
    setActiveQuery(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-16 sm:pt-20 px-3 sm:px-6">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono-num font-bold">
            <span className="text-cyan-400 uppercase tracking-widest">ACT 03 // ASK</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <FileSpreadsheet className="w-3 h-3" />
              <span>Grounded in: {dataset.name}</span>
            </span>
            <span className="text-purple-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Zero-Hallucination Deterministic Engine</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
            REASONING COPILOT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Direct natural-language telemetry inquiry across {dataset.transactions.length} verified transactions. The AI dynamically animates the 3D DNA helix and provides transparent proof.
          </p>
        </div>

        {/* Query History Chips */}
        <div className="flex items-center flex-wrap gap-1.5 bg-[#0A0E18]/90 p-1.5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-mono-num text-slate-500 px-2 uppercase">Quick:</span>
          {queryHistory.slice(0, 3).map((hist, idx) => (
            <button
              key={idx}
              onClick={() => handleRunInvestigation(hist)}
              disabled={isInvestigating}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-num transition-all cursor-pointer truncate max-w-[160px] sm:max-w-[200px] ${
                activeQuery === hist
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {hist}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Cinematic Command HUD */}
      <CinematicCommandHUD
        dataset={dataset}
        onRunQuery={handleRunInvestigation}
        isInvestigating={isInvestigating}
        investigationStepText={investigationStepText}
        investigationProgress={investigationProgress}
        activeQuery={activeQuery}
        onClearInvestigation={handleResetHighlight}
      />

      {/* Main Copilot Dual-Viewport Layout: 3D Helix Investigation Canvas & Evidence Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Dynamic DNA Helix Canvas (Investigating / Highlighting matching nodes) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded-2xl bg-[#070A12] border border-white/5 flex items-center justify-between text-[11px] font-mono-num text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>3D DNA Matrix Reticle</span>
            </span>
            <span>
              {investigationResult ? `${investigationResult.highlightedTxIds.length} Nodes Isolated` : 'Vector Space'}
            </span>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <FinancialDNACanvas
              dataset={dataset}
              activeLayer="all"
              selectedTransaction={null}
              onSelectTransaction={(tx) => onSelectTransaction && tx && onSelectTransaction(tx)}
              highlightedTxIds={investigationResult ? investigationResult.highlightedTxIds : []}
              highlightColor={investigationResult ? investigationResult.highlightColor : '#22D3EE'}
              isInvestigating={isInvestigating}
              investigationStepText={investigationStepText}
            />
          </div>

          <p className="text-[10px] text-slate-500 font-mono-num text-center">
            Nodes dynamically highlight & connect based on the active Copilot inquiry.
          </p>
        </div>

        {/* Right: Cinematic Visual Answer & Transparent Proof */}
        <div className="lg:col-span-7 space-y-4">
          {isInvestigating ? (
            <div className="p-12 rounded-3xl bg-[#090D18] border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono-num font-bold text-cyan-400 uppercase tracking-widest block">
                  Autonomous Investigation In Progress
                </span>
                <h3 className="text-lg font-bold text-white">
                  {investigationStepText || 'Investigating Dataset Topology...'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Scanning verified records in {dataset.name} and calculating statistical proof...
                </p>
              </div>

              <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"
                  animate={{ width: `${investigationProgress}%` }}
                />
              </div>
            </div>
          ) : investigationResult ? (
            <CinematicInvestigationView
              result={investigationResult}
              dataset={dataset}
              onClose={handleResetHighlight}
              onSelectTransaction={(tx) => onSelectTransaction && onSelectTransaction(tx)}
              onRunFollowUp={handleRunInvestigation}
              onResetHighlight={handleResetHighlight}
              onLaunchStory={onOpenStory}
            />
          ) : (
            <div className="p-10 rounded-3xl bg-[#080B14] border border-white/5 text-center space-y-3 min-h-[380px] flex flex-col items-center justify-center">
              <Compass className="w-10 h-10 text-slate-600" />
              <h3 className="text-base font-bold text-slate-300">Select an inquiry or speak a question</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                FinGuard Copilot evaluates every query against your actual uploaded transactions with zero artificial hallucination.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Act Progression Banner */}
      <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-white">Ready to simulate scenarios or execute interventions?</h3>
          <p className="text-xs text-slate-400">
            Act 04 provides interactive purchase simulators, subscription pruners, and sovereign report exports.
          </p>
        </div>

        <button
          onClick={onProceedToAct}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <span>PROCEED TO ACT 04: TAKE ACTION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
