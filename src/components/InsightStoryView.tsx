import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  Pause,
  Layers,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Tag,
  CreditCard,
  Compass,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { InsightStory, StoryGroup } from '../utils/insightStoryBuilder';
import { FinancialDataset, Transaction } from '../types';

interface InsightStoryViewProps {
  story: InsightStory | null;
  dataset: FinancialDataset;
  onClose: () => void;
  onExecuteAction: (actionType: string, payload?: any) => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

type StoryStage = 'pattern' | 'evidence' | 'grouping' | 'explanation';

const STAGES: { id: StoryStage; label: string; number: string }[] = [
  { id: 'pattern', label: 'Pattern (Timeline)', number: '01' },
  { id: 'evidence', label: 'Evidence (Transactions)', number: '02' },
  { id: 'grouping', label: 'Grouping (Clusters)', number: '03' },
  { id: 'explanation', label: 'Explanation & Action', number: '04' }
];

export const InsightStoryView: React.FC<InsightStoryViewProps> = ({
  story,
  dataset,
  onClose,
  onExecuteAction,
  onSelectTransaction
}) => {
  if (!story) return null;

  const [currentStage, setCurrentStage] = useState<StoryStage>('pattern');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);
  const sym = dataset.currencySymbol || '₹';

  const stageIndex = STAGES.findIndex(s => s.id === currentStage);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextStage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, stageIndex]);

  // Autoplay progression timer
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalTime = 50; // 50ms ticks
    const stageDuration = 4200; // 4.2 seconds per stage
    const increment = (intervalTime / stageDuration) * 100;

    const timer = setInterval(() => {
      setAutoPlayProgress(prev => {
        if (prev >= 100) {
          if (stageIndex < STAGES.length - 1) {
            setCurrentStage(STAGES[stageIndex + 1].id);
            return 0;
          } else {
            setIsAutoPlaying(false);
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, stageIndex, currentStage]);

  const handleNextStage = () => {
    setAutoPlayProgress(0);
    if (stageIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[stageIndex + 1].id);
    } else {
      setIsAutoPlaying(false);
    }
  };

  const handlePrevStage = () => {
    setAutoPlayProgress(0);
    if (stageIndex > 0) {
      setCurrentStage(STAGES[stageIndex - 1].id);
    }
  };

  const handleSelectStage = (stage: StoryStage) => {
    setAutoPlayProgress(0);
    setCurrentStage(stage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-[#030509]/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Background Animated Particle / Radial Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-600/15 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/15 blur-[150px] rounded-full" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 bg-[#050811]/90">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-[10px] font-mono-num font-bold">
              <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider ${story.badgeColor}`}>
                {story.patternBadge}
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline truncate">
                Grounded in {dataset.name}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {story.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono-num text-slate-300 transition-all cursor-pointer"
            title={isAutoPlaying ? 'Pause Story Autoplay' : 'Resume Story Autoplay'}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-mono-num text-slate-200 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Financial DNA</span>
          </button>
        </div>
      </header>

      {/* Progress Stepper Bar: Pattern → Evidence → Grouping → Explanation */}
      <div className="relative z-10 px-4 sm:px-8 py-3 bg-[#060A14]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < stageIndex;
            const isCurrent = idx === stageIndex;

            return (
              <button
                key={s.id}
                onClick={() => handleSelectStage(s.id)}
                className={`flex-1 flex flex-col space-y-1.5 text-left transition-all cursor-pointer group ${
                  isCurrent
                    ? 'opacity-100'
                    : isCompleted
                    ? 'opacity-85 hover:opacity-100'
                    : 'opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-num">
                  <span className={`font-bold ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {s.number} {s.label}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>

                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden relative">
                  {isCurrent && isAutoPlaying ? (
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${autoPlayProgress}%` }}
                    />
                  ) : (
                    <div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? 'bg-emerald-400 w-full'
                          : isCurrent
                          ? 'bg-cyan-400 w-full'
                          : 'w-0'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Story Content Stage Viewport */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 flex items-center justify-center min-h-[440px]">
        <AnimatePresence mode="wait">
          {/* STAGE 1: PATTERN & TIMELINE FOCUS */}
          {currentStage === 'pattern' && (
            <motion.div
              key="stage-pattern"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="text-[11px] font-mono-num font-bold text-cyan-400 uppercase tracking-widest block">
                  STAGE 01 // CHRONOLOGICAL TIMELINE FOCUS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {story.subtitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Isolating the temporal window in your statement history ({dataset.timeRange.start} → {dataset.timeRange.end}).
                </p>
              </div>

              {/* Dynamic Interactive Timeline Scrubber & Period Gauge */}
              <div className="p-6 rounded-3xl bg-[#080D18] border border-cyan-500/20 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono-num text-slate-400 pb-2 border-b border-white/5">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Statement Span: {dataset.timeRange.start}</span>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {story.timeRange.label}
                  </span>
                  <span>{dataset.timeRange.end}</span>
                </div>

                {/* Visual Timeline Span Track */}
                <div className="relative py-4">
                  <div className="w-full h-2 rounded-full bg-slate-800" />
                  {/* Highlighted Range Window */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute top-4 left-[20%] h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 shadow-lg shadow-cyan-500/30"
                  />
                  {/* Focal Pulse Marker */}
                  <div className="absolute top-2 left-[52%] -translate-x-1/2 flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center animate-ping" />
                    <span className="text-[10px] font-mono-num font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full border border-cyan-500/40 mt-1 shadow-md whitespace-nowrap">
                      {story.timeRange.focalDate || story.timeRange.start}
                    </span>
                  </div>
                </div>

                {/* Supporting Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                    <span className="text-[10px] font-mono-num text-slate-500 uppercase block">Total Statement Records</span>
                    <span className="text-base font-bold text-white font-mono-num">{dataset.transactions.length} Nodes</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                    <span className="text-[10px] font-mono-num text-slate-500 uppercase block">Involved Transactions</span>
                    <span className="text-base font-bold text-cyan-300 font-mono-num">{story.transactions.length} Evidence Records</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                    <span className="text-[10px] font-mono-num text-slate-500 uppercase block">Net Pattern Sum</span>
                    <span className="text-base font-bold text-emerald-400 font-mono-num">{sym}{story.transactions.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#04060C] border border-white/5">
                    <span className="text-[10px] font-mono-num text-slate-500 uppercase block">Pattern Type</span>
                    <span className="text-xs font-bold text-purple-300 uppercase truncate block">{story.patternBadge}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: EVIDENCE (EXACT TRANSACTIONS ANIMATION) */}
          {currentStage === 'evidence' && (
            <motion.div
              key="stage-evidence"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <span className="text-[11px] font-mono-num font-bold text-emerald-400 uppercase tracking-widest block">
                  STAGE 02 // EMPIRICAL EVIDENCE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Exact Transactions Involved ({story.transactions.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Extracted directly from {dataset.dataSourceName} with zero interpolation.
                </p>
              </div>

              {/* Transactions Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {story.transactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    className="p-4 rounded-2xl bg-[#070B16] hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-lg"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white group-hover:text-cyan-300 truncate text-sm">
                          {tx.merchant}
                        </span>
                        {tx.status === 'anomaly' && (
                          <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            OUTLIER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono-num text-slate-400">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="text-cyan-400 uppercase">{tx.category}</span>
                        {tx.mode && (
                          <>
                            <span>•</span>
                            <span>{tx.mode}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-mono-num font-extrabold ${tx.type === 'income' ? 'text-emerald-400' : tx.status === 'anomaly' ? 'text-rose-400' : 'text-white'}`}>
                        {tx.type === 'income' ? '+' : '-'}{sym}{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[9px] font-mono-num text-slate-500">Verified Row</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 3: GROUPING & CLUSTERING */}
          {currentStage === 'grouping' && (
            <motion.div
              key="stage-grouping"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <span className="text-[11px] font-mono-num font-bold text-purple-400 uppercase tracking-widest block">
                  STAGE 03 // DATA CLUSTERING
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {story.grouping.typeLabel}
                </h2>
                <p className="text-xs text-slate-400">
                  Aggregating related records into coherent behavioral pillars.
                </p>
              </div>

              {/* Grouped Pillars */}
              <div className="space-y-4 max-w-3xl mx-auto">
                {story.grouping.groups.map((group, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.12, duration: 0.35 }}
                    className="p-5 rounded-3xl bg-[#080D18] border border-white/10 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono-num">
                      <div className="flex items-center space-x-2.5 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="font-bold text-white truncate">{group.name}</span>
                        {group.badge && (
                          <span className="text-[10px] font-mono-num px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {group.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-base font-extrabold text-white">
                          {sym}{group.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-cyan-400">
                          ({group.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: group.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, Math.min(100, group.percentage))}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Sub-records count */}
                    <div className="text-[11px] font-mono-num text-slate-400 flex items-center justify-between pt-1">
                      <span>{group.transactions.length} Associated entries</span>
                      <span className="text-slate-500">Share of focal pattern</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: EXPLANATION & AI NEXT STEP */}
          {currentStage === 'explanation' && (
            <motion.div
              key="stage-explanation"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full space-y-6"
            >
              {/* Insight Headline & Plain-Language Summary */}
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="text-[11px] font-mono-num font-bold text-cyan-400 uppercase tracking-widest block">
                  STAGE 04 // CALCULATED INSIGHT & ACTION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {story.explanation.headline}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {story.explanation.plainLanguage}
                </p>
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {story.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#080D18] border border-white/10 space-y-1 shadow-lg"
                  >
                    <span className="text-[10px] font-mono-num uppercase tracking-wider text-slate-400 block truncate">
                      {m.label}
                    </span>
                    <div className={`text-xl sm:text-2xl font-mono-num font-extrabold ${m.color || 'text-white'}`}>
                      {m.value}
                    </div>
                    {m.subtext && (
                      <span className="text-[10px] text-slate-500 block truncate">
                        {m.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Transparent Calculation Bar */}
              <div className="p-4 rounded-2xl bg-[#060912] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs font-mono-num">
                <div className="flex items-center space-x-2 text-cyan-300 min-w-0">
                  <Calculator className="w-4 h-4 shrink-0" />
                  <span className="truncate"><strong>Exact Formulation:</strong> {story.explanation.exactMath}</span>
                </div>
              </div>

              {/* AI SUGGESTION: ONE PRACTICAL NEXT STEP */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0B1220] to-emerald-950/40 border border-cyan-500/40 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{story.nextStep.title}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-num font-bold text-[9px] uppercase tracking-wider">
                    {story.nextStep.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {story.nextStep.description}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                  <span className="text-[10px] font-mono-num text-slate-500 text-center sm:text-left">
                    [ Plain deterministic outcome • You retain absolute authority ]
                  </span>
                  <button
                    onClick={() => onExecuteAction(story.nextStep.actionType, story.nextStep.actionPayload)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
                  >
                    <span>{story.nextStep.actionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Controls Bar */}
      <footer className="relative z-10 border-t border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between bg-[#050811]/90">
        <button
          onClick={handlePrevStage}
          disabled={stageIndex === 0}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 text-xs font-mono-num text-slate-300 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {/* Keyboard navigation helper */}
        <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono-num text-slate-500">
          <span>Use [← / →] arrows or [Space] to scrub through story</span>
        </div>

        {stageIndex < STAGES.length - 1 ? (
          <button
            onClick={handleNextStage}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono-num font-bold text-cyan-300 transition-all cursor-pointer"
          >
            <span>Next: {STAGES[stageIndex + 1].label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-xs font-mono-num font-black transition-all cursor-pointer shadow-lg"
          >
            <span>Complete & Return to DNA</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
      </footer>
    </motion.div>
  );
};
