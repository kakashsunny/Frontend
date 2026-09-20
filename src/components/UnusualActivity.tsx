import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface UnusualActivityProps {
  anomalies: AnomalyAlert[];
  onDispute: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const UnusualActivity: React.FC<UnusualActivityProps> = ({
  anomalies,
  onDispute,
  onAcknowledge,
  onOpenCopilotWithPrompt
}) => {
  const activeAnomalies = anomalies.filter(a => a.status === 'detected');
  const resolvedCount = anomalies.filter(a => a.status !== 'detected').length;

  return (
    <section id="section-unusual-activity" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Unusual Activity & Anomaly Interceptions
            </h2>
            {activeAnomalies.length > 0 && (
              <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeAnomalies.length} Requires Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Automated heuristic detection for sudden surges, POS duplicate terminal hits, and unannounced price hikes
          </p>
        </div>

        {resolvedCount > 0 && (
          <span className="text-xs text-slate-400 font-mono-num flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{resolvedCount} items resolved / acknowledged</span>
          </span>
        )}
      </div>

      {activeAnomalies.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-2 border-emerald-500/30 bg-emerald-950/10">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">All Clear — No Anomalies Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            FinGuard continuously evaluates your 90-day spending patterns in real-time. Any irregular surge or duplicate terminal billing will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeAnomalies.map((anom) => {
            const isHigh = anom.severity === 'high';
            return (
              <motion.div
                key={anom.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border transition-all ${
                  isHigh
                    ? 'border-rose-500/40 bg-gradient-to-b from-[#161219]/90 to-[#0F1420]/90 shadow-lg shadow-rose-950/20'
                    : 'border-amber-500/30 bg-gradient-to-b from-[#171513]/90 to-[#0F1420]/90'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Merchant & Amount */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className={`text-[10px] uppercase font-mono-num font-bold px-2 py-0.5 rounded-full border ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {anom.severity} Risk
                        </span>
                        <span className="text-[10px] font-mono-num text-slate-400">
                          {anom.confidence}% AI Confidence
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">{anom.title}</h3>
                      <p className="text-xs text-slate-300 font-medium">{anom.merchant}</p>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-base sm:text-lg font-mono-num font-extrabold text-white block">
                        ${anom.amount.toFixed(2)}
                      </span>
                      {anom.priorAverageAmount !== undefined && (
                        <span className="text-[10px] font-mono-num text-slate-500">
                          Avg: ${anom.priorAverageAmount.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explainable Rationale */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    <p className="text-slate-300">{anom.rationale}</p>
                  </div>

                  {/* Suggested Action Box */}
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 truncate"><strong>Action:</strong> {anom.suggestedAction}</span>
                  </div>
                </div>

                {/* Instant 1-Click Action Buttons */}
                <div className="pt-4 mt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    id={`btn-dispute-${anom.id}`}
                    onClick={() => onDispute(anom.id)}
                    className="py-2 px-2.5 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Flag / Dispute
                  </button>

                  <button
                    id={`btn-acknowledge-${anom.id}`}
                    onClick={() => onAcknowledge(anom.id)}
                    className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
                  >
                    I Approve This
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};
