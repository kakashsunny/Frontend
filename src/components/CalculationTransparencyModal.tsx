import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { FinancialDataset } from '../types';

interface CalculationTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: FinancialDataset;
}

export const CalculationTransparencyModal: React.FC<CalculationTransparencyModalProps> = ({
  isOpen,
  onClose,
  dataset
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl rounded-3xl bg-[#090D15] border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-950/40 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono-num font-bold text-cyan-400 uppercase tracking-widest">
                <Calculator className="w-4 h-4" />
                <span>Zero-Hallucination Mathematical Audit</span>
              </div>
              <h2 className="text-2xl font-black text-white">How Every Insight Was Calculated</h2>
              <p className="text-xs text-slate-400">
                Data Provenance: <strong className="text-slate-200">{dataset.dataSourceName}</strong> ({dataset.transactions.length} verified rows from {dataset.timeRange.start} to {dataset.timeRange.end})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core Ingestion Audit Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-num">
            <div className="p-3.5 rounded-2xl bg-[#06080E] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Total Inflow Records</span>
              <span className="text-emerald-400 font-extrabold text-sm block">
                {dataset.currencySymbol}{dataset.totalIncomeAllTime.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">{dataset.transactions.filter(t => t.type === 'income').length} deposits</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06080E] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Total Outlay Records</span>
              <span className="text-cyan-400 font-extrabold text-sm block">
                {dataset.currencySymbol}{dataset.totalExpenseAllTime.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">{dataset.transactions.filter(t => t.type === 'expense').length} debits</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06080E] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Investments & Transfers</span>
              <span className="text-purple-400 font-extrabold text-sm block">
                {dataset.currencySymbol}{dataset.totalTransfersAllTime.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">{dataset.transactions.filter(t => t.type === 'transfer').length} transfers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06080E] border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Statement Span</span>
              <span className="text-white font-extrabold text-sm block">
                {dataset.timeRange.totalDays} Days
              </span>
              <span className="text-[10px] text-slate-500">{Math.round(dataset.timeRange.totalDays / 30.4)} months tracked</span>
            </div>
          </div>

          {/* Mathematical Formulations List */}
          <div className="space-y-4">
            <span className="text-xs font-mono-num uppercase tracking-wider text-slate-400 font-bold block">
              // Step-by-Step Mathematical Transparency
            </span>

            <div className="space-y-3">
              {dataset.calculationExplanations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#06080E] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span className="text-cyan-400 font-mono-num text-xs">0{idx + 1}.</span>
                      <span>{item.metric}</span>
                    </h3>
                    <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      Formula: {item.formula}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono-num">
                    <div className="text-slate-400">
                      <strong className="text-slate-500">Inputs:</strong> {item.datasetInputValues}
                    </div>
                    <div className="text-emerald-300 font-bold sm:text-right">
                      <strong className="text-slate-500">Output:</strong> {item.exactMath}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Deterministic Guarantee:</strong> Every number rendered in FinGuard AI is mathematically derived with zero LLM hallucinations or synthetic inflation.
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs cursor-pointer ml-3 shrink-0"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
