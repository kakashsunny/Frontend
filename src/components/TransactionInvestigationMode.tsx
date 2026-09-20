import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  Clock,
  CreditCard,
  Store,
  Layers,
  Search,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass,
  GitBranch,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Eye,
  Info
} from 'lucide-react';
import { FinancialDataset, Transaction } from '../types';
import {
  buildTransactionInvestigationContext,
  ConnectedContextNode,
  ContextConnectionType
} from '../utils/transactionInvestigationEngine';

interface TransactionInvestigationModeProps {
  transaction: Transaction;
  dataset: FinancialDataset;
  onClose: () => void;
  onAskAI: (prompt: string) => void;
  onDisputeAnomaly?: (id: string) => void;
  onAcknowledgeAnomaly?: (id: string) => void;
}

type InvestigationViewMode = 'radial' | 'temporal';

export const TransactionInvestigationMode: React.FC<TransactionInvestigationModeProps> = ({
  transaction: initialTransaction,
  dataset,
  onClose,
  onAskAI,
  onDisputeAnomaly,
  onAcknowledgeAnomaly
}) => {
  const [currentTarget, setCurrentTarget] = useState<Transaction>(initialTransaction);
  const [viewMode, setViewMode] = useState<InvestigationViewMode>('radial');
  const [activeFilter, setActiveFilter] = useState<ContextConnectionType | 'all'>('all');
  const [hoveredNode, setHoveredNode] = useState<ConnectedContextNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConnectedContextNode | null>(null);
  const [showRawLedger, setShowRawLedger] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync if prop changes
  useEffect(() => {
    setCurrentTarget(initialTransaction);
    setSelectedNode(null);
  }, [initialTransaction]);

  // Compute rich context model for current focal target
  const context = useMemo(() => {
    return buildTransactionInvestigationContext(currentTarget, dataset);
  }, [currentTarget, dataset]);

  const sym = dataset.currencySymbol || '₹';
  const isAnomaly = currentTarget.status === 'anomaly';
  const isIncome = currentTarget.type === 'income';

  // Filter connected nodes based on active layer
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return context.connectedNodes;
    return context.connectedNodes.filter(n => n.connectionType === activeFilter);
  }, [context.connectedNodes, activeFilter]);

  // Handle pivoting / re-centering on any connected transaction
  const handlePivotTransaction = (tx: Transaction) => {
    setCurrentTarget(tx);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  // Keyboard navigation (Esc to return to DNA)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Generate deep AI Copilot Prompt from observable findings
  const handleAskAI = () => {
    const findingsSummary = `Investigate transaction: ${currentTarget.merchant} for ${sym}${currentTarget.amount.toLocaleString('en-IN')} on ${currentTarget.date} (${currentTarget.category}). Detection: ${context.detectionMethod.statusLabel} (${context.detectionMethod.confidenceScore}% confidence). Observable delta: ${context.evidencePoints[0]?.observation} vs baseline ${context.evidencePoints[0]?.baseline}. Provide deep context analysis and recommended verification actions.`;
    onAskAI(findingsSummary);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#04060A] text-slate-100 flex flex-col overflow-hidden select-none font-sans"
    >
      {/* Dynamic Atmospheric Backdrop Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-40 left-1/3 w-[650px] h-[650px] bg-cyan-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 -right-20 w-[550px] h-[550px] bg-purple-600/15 blur-[150px] rounded-full" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-emerald-600/15 blur-[160px] rounded-full" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-[#060911]/90 backdrop-blur-2xl px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Provenance */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5 hover:border-white/20 flex items-center space-x-1.5 text-xs font-mono-num shrink-0 group"
            title="Return to Living Financial DNA (Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Return to DNA</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono-num font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 animate-spin text-cyan-400" style={{ animationDuration: '14s' }} />
                TRANSACTION INVESTIGATION MODE
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">•</span>
              <span className="text-[10px] font-mono-num text-slate-400 hidden sm:inline">
                {dataset.name}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 truncate">
              <span>{currentTarget.merchant}</span>
              <span className="text-xs font-mono-num px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {sym}{currentTarget.amount.toLocaleString('en-IN')}
              </span>
            </h1>
          </div>
        </div>

        {/* Confidence & Detection Badge (Strict Non-Fraud terminology) */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Confidence Indicator Card */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#0B101D] border border-white/10 shadow-inner">
            <div className="relative flex items-center justify-center w-7 h-7">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/10"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeDasharray={`${context.detectionMethod.confidenceScore * 0.88}, 100`}
                  strokeLinecap="round"
                  className={
                    isAnomaly
                      ? 'text-rose-400'
                      : context.detectionMethod.confidenceScore > 85
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }
                />
              </svg>
              <span className="absolute text-[10px] font-mono-num font-bold text-white">
                {context.detectionMethod.confidenceScore}%
              </span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono-num text-slate-400 uppercase tracking-wider">
                Detection Confidence
              </span>
              <span
                className={`text-[11px] font-bold font-mono-num ${
                  isAnomaly
                    ? 'text-rose-300'
                    : context.detectionMethod.statusLabel === 'Statistical divergence'
                    ? 'text-amber-300'
                    : 'text-cyan-300'
                }`}
              >
                {context.detectionMethod.statusLabel}
              </span>
            </div>
          </div>

          {/* View Switcher: Radial Network vs Temporal Wave */}
          <div className="flex items-center bg-[#0B101D] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('radial')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-num flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'radial'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Radial Context Orbit"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radial Orbit</span>
            </button>
            <button
              onClick={() => setViewMode('temporal')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-num flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'temporal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Temporal Context Wave"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline Wave</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Exit Investigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* FILTER CHIPS SUB-BAR */}
      <div className="relative z-10 shrink-0 bg-[#050811]/90 border-b border-white/5 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono-num">
          <span className="text-[10px] uppercase text-slate-500 font-bold mr-1 hidden sm:inline">Context Vectors:</span>
          
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white/15 text-white font-bold border border-white/20'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            All Connections ({context.connectedNodes.length})
          </button>

          <button
            onClick={() => setActiveFilter('same_merchant')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'same_merchant'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                : 'text-slate-400 hover:text-purple-300 bg-white/5'
            }`}
          >
            <Store className="w-3 h-3 text-purple-400" />
            <span>Same Merchant ({context.connectedNodes.filter(n => n.connectionType === 'same_merchant').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('same_category')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'same_category'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-cyan-300 bg-white/5'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>{currentTarget.category} Peers ({context.connectedNodes.filter(n => n.connectionType === 'same_category').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('temporal_neighbor')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'temporal_neighbor'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300 bg-white/5'
            }`}
          >
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Time Proximity ({context.connectedNodes.filter(n => n.connectionType === 'temporal_neighbor').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('same_mode')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'same_mode'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300 bg-white/5'
            }`}
          >
            <CreditCard className="w-3 h-3 text-amber-400" />
            <span>{currentTarget.mode || 'Payment Mode'}</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 text-xs font-mono-num text-slate-400 shrink-0">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.15))}
            className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 hover:text-white"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] min-w-[36px] text-center">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
            className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 hover:text-white"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-[10px]"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* MAIN DUAL-PANEL CONTENT AREA */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN (COL 1 to 7 on lg): Interactive Network/Timeline Visualization Stage */}
        <div
          ref={containerRef}
          className="lg:col-span-7 xl:col-span-8 relative flex flex-col bg-[#030509] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden h-[420px] sm:h-[480px] lg:h-full"
        >
          {/* Active Canvas Stage */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
            {viewMode === 'radial' ? (
              <RadialInvestigationGraph
                target={currentTarget}
                connectedNodes={filteredNodes}
                hoveredNode={hoveredNode}
                selectedNode={selectedNode}
                onHoverNode={setHoveredNode}
                onSelectNode={setSelectedNode}
                onPivotTransaction={handlePivotTransaction}
                zoomLevel={zoomLevel}
                sym={sym}
                categoryMedian={context.categoryStats.medianAmount}
              />
            ) : (
              <TemporalInvestigationTimeline
                target={currentTarget}
                connectedNodes={filteredNodes}
                hoveredNode={hoveredNode}
                selectedNode={selectedNode}
                onHoverNode={setHoveredNode}
                onSelectNode={setSelectedNode}
                onPivotTransaction={handlePivotTransaction}
                zoomLevel={zoomLevel}
                sym={sym}
              />
            )}
          </div>

          {/* Floating Hover HUD Card */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm pointer-events-none z-30 p-3.5 rounded-2xl bg-[#0A0F1D]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400 pb-1 border-b border-white/10">
                  <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
                    {hoveredNode.connectionLabel}
                  </span>
                  <span>{hoveredNode.transaction.date}</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate pr-2">
                    {hoveredNode.transaction.merchant}
                  </span>
                  <span className="text-xs font-mono-num font-extrabold text-white shrink-0">
                    {sym}{hoveredNode.transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 pt-1 leading-snug">
                  {hoveredNode.relationshipDescription}
                </p>

                <div className="mt-2 flex items-center justify-between text-[9px] font-mono-num text-cyan-300 pt-1 border-t border-white/5">
                  <span>Delta vs Focal: {hoveredNode.amountRatio >= 1 ? `${hoveredNode.amountRatio.toFixed(1)}x smaller` : `${(1 / hoveredNode.amountRatio).toFixed(1)}x larger`}</span>
                  <span>Click to pivot →</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interaction Legend Overlay */}
          <div className="absolute top-3 left-4 pointer-events-none flex items-center space-x-3 text-[10px] font-mono-num text-slate-500 z-10">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Focal Node
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Merchant
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Timeline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Channel
            </span>
          </div>

          <div className="absolute bottom-3 right-4 pointer-events-none text-[10px] font-mono-num text-slate-600 hidden sm:block z-10">
            [ Click any node to pivot investigation • Drag/Hover to inspect ]
          </div>
        </div>

        {/* RIGHT COLUMN (COL 8 to 12 on lg): Observable Evidence & Deep Context Inspector */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-[#06080F] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
          {/* Section 1: Focal Node Summary & Detection Method */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-num font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detection Algorithm & Method</span>
              </span>
              <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                Verified Deterministic
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090D18] border border-white/10 space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{context.detectionMethod.methodName}</span>
                <span className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded ${
                  isAnomaly ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {context.detectionMethod.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {context.detectionMethod.explanation}
              </p>
              <div className="pt-2 text-[10px] font-mono-num text-slate-500 flex items-center gap-1 border-t border-white/5">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Zero speculation • Strict mathematical variance baseline</span>
              </div>
            </div>
          </div>

          {/* Section 2: Clear Observable Evidence Points (4 structured data cards) */}
          <div className="p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono-num font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Observable Empirical Evidence</span>
              </h2>
              <span className="text-[10px] font-mono-num text-slate-500">
                {context.evidencePoints.length} Data Points
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {context.evidencePoints.map((pt) => (
                <div
                  key={pt.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    pt.status === 'divergent'
                      ? 'bg-gradient-to-r from-rose-950/20 to-transparent border-rose-500/30'
                      : 'bg-[#080C16] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`p-1.5 rounded-lg ${pt.status === 'divergent' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-300'}`}>
                        {pt.iconType === 'calculator' && <Calculator className="w-3.5 h-3.5" />}
                        {pt.iconType === 'store' && <Store className="w-3.5 h-3.5" />}
                        {pt.iconType === 'clock' && <Clock className="w-3.5 h-3.5" />}
                        {pt.iconType === 'credit-card' && <CreditCard className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-xs font-bold text-white">{pt.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full ${
                      pt.status === 'divergent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {pt.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono-num">
                    <div className="p-2 rounded-xl bg-[#04060C] border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase block">Observed Value</span>
                      <span className="text-slate-200 font-bold">{pt.observation}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#04060C] border border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase block">Ledger Baseline</span>
                      <span className="text-slate-400 font-medium">{pt.baseline}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] font-mono-num flex justify-between items-center text-slate-400">
                    <span>Variance Measure:</span>
                    <span className={`font-bold ${pt.status === 'divergent' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {pt.divergence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Statistical Baseline Range Meter */}
          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono-num font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentTarget.category} Outlay Dispersion</span>
              </h3>
              <span className="text-[10px] font-mono-num text-cyan-300">
                {context.categoryStats.transactionCount} entries
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#080C16] border border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-mono-num">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Median</span>
                  <span className="font-bold text-white">{sym}{context.categoryStats.medianAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Average</span>
                  <span className="font-medium text-slate-300">{sym}{context.categoryStats.averageAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">IQR Upper Threshold</span>
                  <span className="font-bold text-rose-400">{sym}{context.categoryStats.iqrHigh.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Range Visual Bar */}
              <div className="relative pt-4 pb-2">
                <div className="w-full h-2 rounded-full bg-slate-800 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-rose-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
                {/* Target marker */}
                <div
                  className="absolute top-2 -translate-x-1/2 flex flex-col items-center"
                  style={{
                    left: `${Math.min(95, Math.max(5, (currentTarget.amount / Math.max(context.categoryStats.maxAmount, context.categoryStats.iqrHigh * 1.2)) * 100))}%`
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-cyan-400 shadow-md animate-pulse" />
                  <span className="text-[9px] font-mono-num font-bold text-cyan-300 whitespace-nowrap mt-0.5">
                    This: {sym}{currentTarget.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 leading-snug font-sans">
                Interquartile range indicates baseline values concentrate under {sym}{context.categoryStats.medianAmount}. Values above {sym}{context.categoryStats.iqrHigh} trigger contextual verification flags.
              </p>
            </div>
          </div>

          {/* Section 4: Selected Connected Node Comparative Inspector (When user clicks a node) */}
          {selectedNode && (
            <div className="p-5 sm:p-6 bg-[#090F1E] border-t-2 border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                  <span className="text-xs font-mono-num font-bold text-white uppercase">
                    Connected Node Comparison
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[10px] font-mono-num text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#050810] border border-white/10 space-y-2 text-xs font-mono-num">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{selectedNode.transaction.merchant}</span>
                  <span className="font-black text-cyan-300 text-sm">
                    {sym}{selectedNode.transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedNode.transaction.date} • {selectedNode.transaction.category} • {selectedNode.transaction.mode || selectedNode.transaction.account}
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-[11px] text-slate-300 font-sans">
                  {selectedNode.relationshipDescription}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handlePivotTransaction(selectedNode.transaction)}
                    className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-center Investigation on This Transaction</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Raw Ledger Fields Disclosure (Expandable) */}
          <div className="p-5 sm:p-6 space-y-3">
            <button
              onClick={() => setShowRawLedger(!showRawLedger)}
              className="w-full flex items-center justify-between text-xs font-mono-num font-bold text-slate-400 hover:text-white py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Raw Observable Ledger Schema</span>
              </span>
              <span className="text-[10px] text-cyan-400 underline">
                {showRawLedger ? 'Collapse' : 'Inspect 10 Raw Fields'}
              </span>
            </button>

            {showRawLedger && (
              <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
                {context.observableFields.map((f, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] font-mono-num p-2 rounded-lg bg-[#04060A] border border-white/5">
                    <span className="text-slate-500">{f.label}</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[200px]">{f.rawValue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BAR: 2 Primary Actions as strictly requested */}
      <footer className="relative z-20 shrink-0 border-t border-white/10 bg-[#070B14]/95 backdrop-blur-2xl px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono-num text-slate-400">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Empirically grounded from statement records</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-[11px] text-slate-500">
            {filteredNodes.length} connected context links active
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* 1-Click Anomaly Dispute if applicable */}
          {isAnomaly && onDisputeAnomaly && (
            <button
              onClick={() => {
                onDisputeAnomaly(currentTarget.id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono-num transition-all cursor-pointer"
            >
              1-Click Dispute Notice
            </button>
          )}

          {/* Action 1: Return to Financial DNA */}
          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-white/10 text-xs font-bold font-mono-num transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Return to Financial DNA</span>
          </button>

          {/* Action 2: Ask AI about this */}
          <button
            onClick={handleAskAI}
            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Ask AI about this</span>
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

// ============================================================================
// SUBCOMPONENT 1: Radial Investigation Graph (Interactive Orbital Canvas/SVG)
// ============================================================================

interface RadialInvestigationGraphProps {
  target: Transaction;
  connectedNodes: ConnectedContextNode[];
  hoveredNode: ConnectedContextNode | null;
  selectedNode: ConnectedContextNode | null;
  onHoverNode: (node: ConnectedContextNode | null) => void;
  onSelectNode: (node: ConnectedContextNode | null) => void;
  onPivotTransaction: (tx: Transaction) => void;
  zoomLevel: number;
  sym: string;
  categoryMedian: number;
}

const RadialInvestigationGraph: React.FC<RadialInvestigationGraphProps> = ({
  target,
  connectedNodes,
  hoveredNode,
  selectedNode,
  onHoverNode,
  onSelectNode,
  onPivotTransaction,
  zoomLevel,
  sym
}) => {
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const isAnomaly = target.status === 'anomaly';
  const width = 800;
  const height = 600;
  const cx = width / 2 + centerOffset.x;
  const cy = height / 2 + centerOffset.y;

  // Orbit radius bands
  const rOrbit1 = 130 * zoomLevel; // Merchant & closest chronological
  const rOrbit2 = 210 * zoomLevel; // Category peers
  const rOrbit3 = 280 * zoomLevel; // Payment channel & distant baseline

  // Calculate layout coordinates for connected nodes along orbital rings
  const positionedNodes = useMemo(() => {
    return connectedNodes.map((node, idx) => {
      let orbitR = rOrbit2;
      if (node.orbitIndex === 1) orbitR = rOrbit1;
      if (node.orbitIndex === 3) orbitR = rOrbit3;

      // Distribute evenly around the circle
      const angle = (idx / connectedNodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * orbitR;
      const y = cy + Math.sin(angle) * orbitR;

      return {
        ...node,
        x,
        y,
        angle
      };
    });
  }, [connectedNodes, cx, cy, rOrbit1, rOrbit2, rOrbit3]);

  // Pointer dragging handlers for canvas panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - centerOffset.x, y: e.clientY - centerOffset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setCenterOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-full h-full relative cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Radial Gradient for Center Glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isAnomaly ? '#F43F5E' : '#22D3EE'} stopOpacity="0.5" />
            <stop offset="60%" stopColor={isAnomaly ? '#F43F5E' : '#22D3EE'} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Gradients for Link Vectors */}
          <linearGradient id="linkMerchantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="linkTimelineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="linkCategoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Orbital Guide Rings */}
        <g className="opacity-30">
          <circle cx={cx} cy={cy} r={rOrbit1} fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx={cx} cy={cy} r={rOrbit2} fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 7" />
          <circle cx={cx} cy={cy} r={rOrbit3} fill="none" stroke="#64748B" strokeWidth="0.8" strokeDasharray="2 8" />
        </g>

        {/* Orbital Ring Labels */}
        <text x={cx + 10} y={cy - rOrbit1 + 14} fill="#A855F7" fontSize="9" fontFamily="monospace" opacity="0.6">
          INNER ORBIT • MERCHANT & CLOSE SEQUENCE
        </text>
        <text x={cx + 10} y={cy - rOrbit2 + 14} fill="#06B6D4" fontSize="9" fontFamily="monospace" opacity="0.6">
          MID ORBIT • CATEGORY PEER BASELINE
        </text>
        <text x={cx + 10} y={cy - rOrbit3 + 14} fill="#64748B" fontSize="9" fontFamily="monospace" opacity="0.6">
          OUTER ORBIT • PAYMENT ROUTE & TEMPORAL SPREAD
        </text>

        {/* Connective Laser Link Lines */}
        <g>
          {positionedNodes.map((node) => {
            const isHovered = hoveredNode?.transaction.id === node.transaction.id;
            const isSelected = selectedNode?.transaction.id === node.transaction.id;
            const strokeColor = isHovered || isSelected ? '#22D3EE' : node.color;
            const strokeWidth = isHovered || isSelected ? 2.5 : node.strength * 1.8;
            const opacity = isHovered || isSelected ? 0.95 : 0.45;

            return (
              <g key={`link-${node.transaction.id}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={node.x}
                  y2={node.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeDasharray={node.connectionType === 'temporal_neighbor' ? '6 4' : 'none'}
                />

                {/* Animated Data Flow Pulses */}
                <circle
                  r={isHovered ? 3.5 : 2.5}
                  fill={strokeColor}
                  opacity={opacity}
                >
                  <animate
                    attributeName="cx"
                    from={cx}
                    to={node.x}
                    dur={`${2.2 / (node.strength || 0.8)}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    from={cy}
                    to={node.y}
                    dur={`${2.2 / (node.strength || 0.8)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </g>

        {/* Orbiting Context Nodes */}
        <g>
          {positionedNodes.map((node) => {
            const isHovered = hoveredNode?.transaction.id === node.transaction.id;
            const isSelected = selectedNode?.transaction.id === node.transaction.id;
            const nodeRadius = isHovered || isSelected ? 18 : 13;

            return (
              <g
                key={`node-${node.transaction.id}`}
                className="cursor-pointer transition-transform group"
                onPointerEnter={() => onHoverNode(node)}
                onPointerLeave={() => onHoverNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onPivotTransaction(node.transaction);
                }}
              >
                {/* Outer Glow Halo on Hover / Select */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 10}
                    fill={node.color}
                    opacity="0.25"
                  />
                )}

                {/* Node Base Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="#0B0F1C"
                  stroke={node.color}
                  strokeWidth={isHovered || isSelected ? 3 : 1.8}
                />

                {/* Center dot inside node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4}
                  fill={isHovered || isSelected ? '#FFFFFF' : node.color}
                />

                {/* Node Text Label (Merchant + Amount) */}
                <text
                  x={node.x}
                  y={node.y! + nodeRadius + 14}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isHovered || isSelected ? '11' : '9'}
                  fontWeight={isHovered || isSelected ? '700' : '500'}
                  fontFamily="sans-serif"
                  className="pointer-events-none drop-shadow"
                >
                  {node.transaction.merchant}
                </text>
                <text
                  x={node.x}
                  y={node.y! + nodeRadius + 26}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="9"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {sym}{node.transaction.amount.toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}
        </g>

        {/* FOCAL CENTER NODE (Target Under Investigation) */}
        <g className="pointer-events-none">
          {/* Radial Aura */}
          <circle cx={cx} cy={cy} r={75 * zoomLevel} fill="url(#centerGlow)" />

          {/* Pulsating Detection Wave Rings */}
          <circle
            cx={cx}
            cy={cy}
            r={48 * zoomLevel}
            fill="none"
            stroke={isAnomaly ? '#F43F5E' : '#22D3EE'}
            strokeWidth="1.5"
            opacity="0.8"
          >
            <animate attributeName="r" values={`${44 * zoomLevel};${58 * zoomLevel};${44 * zoomLevel}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Center Hub Core */}
          <circle
            cx={cx}
            cy={cy}
            r={38 * zoomLevel}
            fill="#060912"
            stroke={isAnomaly ? '#F43F5E' : '#22D3EE'}
            strokeWidth="2.5"
          />

          {/* Center Icon/Label */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="800"
            fontFamily="sans-serif"
          >
            {target.merchant.length > 14 ? `${target.merchant.substring(0, 12)}..` : target.merchant}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill={isAnomaly ? '#FDA4AF' : '#67E8F9'}
            fontSize="12"
            fontWeight="900"
            fontFamily="monospace"
          >
            {sym}{target.amount.toLocaleString('en-IN')}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="8"
            fontFamily="monospace"
          >
            {target.date}
          </text>
        </g>
      </svg>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENT 2: Temporal Investigation Timeline (Interactive Horizontal Wave)
// ============================================================================

interface TemporalInvestigationTimelineProps {
  target: Transaction;
  connectedNodes: ConnectedContextNode[];
  hoveredNode: ConnectedContextNode | null;
  selectedNode: ConnectedContextNode | null;
  onHoverNode: (node: ConnectedContextNode | null) => void;
  onSelectNode: (node: ConnectedContextNode | null) => void;
  onPivotTransaction: (tx: Transaction) => void;
  zoomLevel: number;
  sym: string;
}

const TemporalInvestigationTimeline: React.FC<TemporalInvestigationTimelineProps> = ({
  target,
  connectedNodes,
  hoveredNode,
  selectedNode,
  onHoverNode,
  onSelectNode,
  onPivotTransaction,
  zoomLevel,
  sym
}) => {
  const isAnomaly = target.status === 'anomaly';
  const width = 800;
  const height = 500;
  const axisY = height / 2 + 30;

  // Sort nodes chronologically around target (diffDays from -14 to +14)
  const timelineNodes = useMemo(() => {
    const sorted = [...connectedNodes].sort((a, b) => a.timeDeltaDays - b.timeDeltaDays);
    const minDay = Math.min(-7, ...sorted.map(s => s.timeDeltaDays));
    const maxDay = Math.max(7, ...sorted.map(s => s.timeDeltaDays));
    const span = Math.max(14, maxDay - minDay);

    return sorted.map((node) => {
      // Map time delta into horizontal X coordinate
      const normalizedPos = (node.timeDeltaDays - minDay) / span;
      const x = 80 + normalizedPos * (width - 160);
      // Alternate height above / below axis
      const isAbove = node.timeDeltaDays % 2 === 0;
      const yOffset = isAbove ? -80 - (Math.abs(node.timeDeltaDays) % 3) * 25 : 80 + (Math.abs(node.timeDeltaDays) % 3) * 25;
      const y = axisY + yOffset;

      return {
        ...node,
        x,
        y
      };
    });
  }, [connectedNodes, axisY, width]);

  const targetX = width / 2;
  const targetY = axisY;

  return (
    <div className="w-full h-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id="timeAxisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Central Time Axis Ribbon */}
        <line
          x1={40}
          y1={axisY}
          x2={width - 40}
          y2={axisY}
          stroke="url(#timeAxisGrad)"
          strokeWidth="2.5"
        />

        {/* Chronological Grid Ticks */}
        {[-10, -5, 0, 5, 10].map((dayOffset) => {
          const tickX = targetX + dayOffset * 28 * zoomLevel;
          if (tickX < 50 || tickX > width - 50) return null;
          return (
            <g key={`tick-${dayOffset}`} className="opacity-40">
              <line x1={tickX} y1={axisY - 12} x2={tickX} y2={axisY + 12} stroke="#64748B" strokeWidth="1" />
              <text x={tickX} y={axisY + 26} textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                {dayOffset === 0 ? 'FOCAL DATE' : dayOffset > 0 ? `+${dayOffset}d` : `${dayOffset}d`}
              </text>
            </g>
          );
        })}

        {/* Bezier Arcs from Target to Connected Timeline Nodes */}
        {timelineNodes.map((node) => {
          const isHovered = hoveredNode?.transaction.id === node.transaction.id;
          const isSelected = selectedNode?.transaction.id === node.transaction.id;
          const strokeColor = isHovered || isSelected ? '#22D3EE' : node.color;
          const strokeWidth = isHovered || isSelected ? 2.5 : 1.2;
          const opacity = isHovered || isSelected ? 0.95 : 0.4;

          const midX = (targetX + node.x) / 2;
          const midY = axisY + (node.y > axisY ? 40 : -40);

          return (
            <g key={`bezier-${node.transaction.id}`}>
              <path
                d={`M ${targetX} ${targetY} Q ${midX} ${midY} ${node.x} ${node.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                strokeDasharray={node.connectionType === 'temporal_neighbor' ? '4 4' : 'none'}
              />
              <line
                x1={node.x}
                y1={axisY}
                x2={node.x}
                y2={node.y}
                stroke={strokeColor}
                strokeWidth="0.8"
                strokeDasharray="2 3"
                opacity="0.3"
              />
            </g>
          );
        })}

        {/* Timeline Connected Nodes */}
        {timelineNodes.map((node) => {
          const isHovered = hoveredNode?.transaction.id === node.transaction.id;
          const isSelected = selectedNode?.transaction.id === node.transaction.id;
          const nodeRadius = isHovered || isSelected ? 15 : 11;

          return (
            <g
              key={`t-node-${node.transaction.id}`}
              className="cursor-pointer group"
              onPointerEnter={() => onHoverNode(node)}
              onPointerLeave={() => onHoverNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onPivotTransaction(node.transaction);
              }}
            >
              {(isHovered || isSelected) && (
                <circle cx={node.x} cy={node.y} r={nodeRadius + 8} fill={node.color} opacity="0.3" />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill="#0A0F1D"
                stroke={node.color}
                strokeWidth={isHovered || isSelected ? 2.8 : 1.6}
              />
              <circle cx={node.x} cy={node.y} r={3.5} fill={node.color} />

              <text
                x={node.x}
                y={node.y > axisY ? node.y + nodeRadius + 14 : node.y - nodeRadius - 6}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="600"
                fontFamily="sans-serif"
              >
                {node.transaction.merchant}
              </text>
              <text
                x={node.x}
                y={node.y > axisY ? node.y + nodeRadius + 24 : node.y - nodeRadius - 16}
                textAnchor="middle"
                fill={node.color}
                fontSize="8"
                fontFamily="monospace"
              >
                {sym}{node.transaction.amount.toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}

        {/* FOCAL TARGET ON TIMELINE */}
        <g className="pointer-events-none">
          <circle cx={targetX} cy={targetY} r={32} fill="#070A14" stroke={isAnomaly ? '#F43F5E' : '#22D3EE'} strokeWidth="2.5" />
          <circle cx={targetX} cy={targetY} r={42} fill="none" stroke={isAnomaly ? '#F43F5E' : '#22D3EE'} strokeWidth="1" strokeDasharray="3 4">
            <animate attributeName="r" values="36;46;36" dur="2.5s" repeatCount="indefinite" />
          </circle>

          <text x={targetX} y={targetY - 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            {target.merchant}
          </text>
          <text x={targetX} y={targetY + 10} textAnchor="middle" fill={isAnomaly ? '#FDA4AF' : '#67E8F9'} fontSize="11" fontWeight="900" fontFamily="monospace">
            {sym}{target.amount.toLocaleString('en-IN')}
          </text>
        </g>
      </svg>
    </div>
  );
};
