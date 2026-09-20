import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { FinancialDataset } from '../types';
import { DATASET_PRESETS, parseRawStatementData } from '../data/datasets';

interface DatasetSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset: FinancialDataset | null;
  onSelectDataset: (dataset: FinancialDataset) => void;
}

export const DatasetSwitcherModal: React.FC<DatasetSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  onSelectDataset
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseRawStatementData(text, file.name);
      onSelectDataset(parsed);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-3xl bg-[#090D15] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl shadow-black overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono-num font-bold text-slate-300 uppercase tracking-wider">
                Select Active Ledger Matrix
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-white/10 hover:border-cyan-500/40 bg-[#06080E]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.ofx,.tsv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="text-xs font-bold text-white">
              Drop new CSV or bank statement here
            </div>
            <p className="text-[10px] text-slate-500 font-mono-num">
              Instant zero-knowledge client-side vectorization
            </p>
          </div>

          {/* Benchmark Scenarios Grid */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-slate-500 block">
              Curated Scenario Benchmarks
            </span>

            <div className="space-y-2.5">
              {Object.values(DATASET_PRESETS).map((ds) => {
                const isSelected = currentDataset?.id === ds.id;
                const sym = ds.currencySymbol || '₹';
                return (
                  <div
                    key={ds.id}
                    onClick={() => {
                      onSelectDataset(ds);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-[#06080E] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-white">{ds.name}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{ds.tagline}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono-num font-bold text-slate-200 block">
                        {sym}{ds.totalLiquidity.toLocaleString('en-IN')} Reserves
                      </span>
                      <span className="text-[10px] font-mono-num text-cyan-400">
                        {ds.liquidRunwayMonths} Mo Runway
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
