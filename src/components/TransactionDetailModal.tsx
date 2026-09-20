import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, CheckCircle2, ArrowRight, Tag, Calendar, CreditCard, Building, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onToggleDispute?: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onToggleDispute
}) => {
  if (!transaction) return null;

  const isAnomaly = transaction.status === 'anomaly';

  return (
    <AnimatePresence>
      <div id="tx-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          id="tx-detail-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#0D121C] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden"
        >
          <button
            id="btn-close-tx-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start space-x-3 mb-5">
            <div className={`p-3 rounded-xl border ${
              isAnomaly
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}>
              {isAnomaly ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-slate-400 font-semibold">
                Transaction Inspector
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight leading-snug">{transaction.merchant}</h3>
              <p className="text-2xl font-mono-num font-bold text-white mt-1">
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Anomaly Explanation banner if applicable */}
          {isAnomaly && (
            <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-1.5 mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  AI Anomaly Intercepted
                </span>
                <span className="font-mono-num text-[11px] px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full">
                  {transaction.anomalyConfidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {transaction.anomalyReason || 'Transaction pattern deviates from standard merchant baseline.'}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 mb-5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date & Timestamp
              </span>
              <span className="font-mono-num text-slate-200 font-medium">{transaction.date}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Category
              </span>
              <span className="text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                {transaction.category}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Account / Card
              </span>
              <span className="text-slate-200 font-mono-num">{transaction.account}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Smart Tags
              </span>
              <div className="flex flex-wrap gap-1 justify-end">
                {transaction.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-medium border border-slate-700/60">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isAnomaly && onToggleDispute && (
              <button
                id="btn-dispute-transaction"
                onClick={() => {
                  onToggleDispute(transaction.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Mark as Disputed
              </button>
            )}
            <button
              id="btn-close-tx-details"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
