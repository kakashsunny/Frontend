import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionInspectorModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDispute: (id: string) => void;
  onAskCopilot: (prompt: string) => void;
  onInvestigate?: (tx: Transaction) => void;
}

export const TransactionInspectorModal: React.FC<TransactionInspectorModalProps> = ({
  transaction,
  onClose,
  onDispute,
  onAskCopilot,
  onInvestigate
}) => {
  if (!transaction) return null;

  const isAnomaly = transaction.status === 'anomaly';
  const isIncome = transaction.type === 'income';
  const sym = transaction.currency === 'INR' ? '₹' : '$';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#090D15] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl shadow-black overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isAnomaly ? 'bg-rose-500 animate-pulse' : isIncome ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className="text-xs font-mono-num font-bold text-slate-400 uppercase tracking-widest">
                Node Inspector // Vector Telemetry
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core Merchant & Amount */}
          <div className="space-y-1">
            <div className="text-xs font-mono-num text-slate-400">{transaction.category} {transaction.subcategory ? `• ${transaction.subcategory}` : ''}</div>
            <h2 className="text-2xl font-black text-white">{transaction.merchant}</h2>
            <div className={`text-3xl font-mono-num font-black pt-1 ${
              isIncome ? 'text-emerald-400' : isAnomaly ? 'text-rose-400' : 'text-white'
            }`}>
              {isIncome ? '+' : '-'}{sym}{transaction.amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Anomaly Rationale Box if flagged */}
          {isAnomaly && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-num">
                <span className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{transaction.anomalySeverity} Alert ({transaction.anomalyConfidence}% confidence)</span>
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {transaction.anomalyReason}
              </p>
            </div>
          )}

          {/* Technical Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono-num">
            <div className="p-3 rounded-xl bg-[#06080E] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Timestamp</span>
              <span className="text-slate-200 font-bold">{transaction.rawDate || transaction.date}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#06080E] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Payment Mode</span>
              <span className="text-slate-200 font-bold truncate block">{transaction.mode || transaction.account}</span>
            </div>
          </div>

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {transaction.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-mono-num px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            {onInvestigate && (
              <button
                onClick={() => {
                  onInvestigate(transaction);
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer text-center flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Investigate Connected Context & Network</span>
              </button>
            )}

            <div className="flex gap-2">
              {isAnomaly && (
                <button
                  onClick={() => {
                    onDispute(transaction.id);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  1-Click Dispute
                </button>
              )}
              <button
                onClick={() => {
                  onAskCopilot(`Explain the transaction from ${transaction.merchant} for ${sym}${transaction.amount}`);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-white/10 transition-all cursor-pointer text-center"
              >
                Analyze with Copilot
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
