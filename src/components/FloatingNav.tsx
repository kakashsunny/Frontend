import React from 'react';
import {
  Eye,
  Brain,
  MessageSquare,
  Sparkles,
  Database,
  Calculator,
  ChevronDown,
  Info
} from 'lucide-react';
import { ActView, FinancialDataset } from '../types';

interface FloatingNavProps {
  activeAct: ActView;
  onSelectAct: (act: ActView) => void;
  dataset: FinancialDataset | null;
  onOpenDatasetSwitcher: () => void;
  onOpenTransparencyModal: () => void;
  anomalyCount: number;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeAct,
  onSelectAct,
  dataset,
  onOpenDatasetSwitcher,
  onOpenTransparencyModal,
  anomalyCount
}) => {
  const acts: { id: ActView; label: string; icon: React.ReactNode; num: string }[] = [
    { id: 'see', label: 'SEE', icon: <Eye className="w-3.5 h-3.5" />, num: '01' },
    { id: 'understand', label: 'UNDERSTAND', icon: <Brain className="w-3.5 h-3.5" />, num: '02' },
    { id: 'ask', label: 'ASK AI', icon: <MessageSquare className="w-3.5 h-3.5" />, num: '03' },
    { id: 'act', label: 'ACT', icon: <Sparkles className="w-3.5 h-3.5" />, num: '04' }
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-2 sm:px-6 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-1.5 sm:gap-4 p-1.5 sm:p-2 rounded-2xl bg-[#090D15]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 max-w-6xl w-full">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 pl-2 sm:pl-3 pr-1 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center font-black text-[11px] text-slate-950 shadow-md shadow-emerald-500/20">
            FG
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white hidden md:inline">
            FINGUARD <span className="text-[10px] font-mono-num text-cyan-400 font-semibold">AI</span>
          </span>
        </div>

        {/* 4 Story Acts Nav Tabs */}
        <div className="flex items-center bg-[#05070C]/80 border border-white/5 p-1 rounded-xl overflow-x-auto">
          {acts.map((act) => {
            const isActive = activeAct === act.id;
            return (
              <button
                key={act.id}
                onClick={() => onSelectAct(act.id)}
                className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono-num font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{act.num}</span>
                <span className="hidden sm:inline font-sans font-bold">{act.label}</span>
                {act.id === 'understand' && anomalyCount > 0 && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Provenance Badge & Transparency Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Transparency / Math formula explanation button */}
          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-[11px] font-mono-num font-semibold text-cyan-300 transition-all cursor-pointer"
            title="Inspect Step-by-Step Mathematical Calculations"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">How It Was Calculated</span>
          </button>

          {/* Active Dataset Provenance Indicator */}
          <button
            onClick={onOpenDatasetSwitcher}
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-mono-num text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Data Source & Switcher"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[150px] text-[11px] font-semibold hidden xs:inline">
              {dataset ? `Source: ${dataset.name}` : 'No Ledger'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </nav>
    </header>
  );
};
