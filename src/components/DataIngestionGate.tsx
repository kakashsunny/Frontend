import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Database
} from 'lucide-react';
import { FinancialDataset } from '../types';
import { REAL_HOUSEHOLD_DATASET, parseRawStatementData } from '../data/datasets';

interface DataIngestionGateProps {
  onDatasetLoaded: (dataset: FinancialDataset) => void;
  onCancel?: () => void;
}

export const DataIngestionGate: React.FC<DataIngestionGateProps> = ({
  onDatasetLoaded,
  onCancel
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sequencingStage, setSequencingStage] = useState<number | null>(null);
  const [activeStageText, setActiveStageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startSequencing = (dataset: FinancialDataset) => {
    setSequencingStage(1);
    setActiveStageText('Reading your financial history...');

    setTimeout(() => {
      setSequencingStage(2);
      setActiveStageText('Finding patterns...');
    }, 600);

    setTimeout(() => {
      setSequencingStage(3);
      setActiveStageText('Building your Financial DNA...');
    }, 1250);

    setTimeout(() => {
      setSequencingStage(4);
      setActiveStageText('Intelligence ready.');
    }, 1900);

    setTimeout(() => {
      onDatasetLoaded(dataset);
    }, 2400);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseRawStatementData(text, file.name);
      startSequencing(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-10 py-6 px-4 sm:px-6">
      {/* 4-Stage Sequencing Transition Overlay */}
      <AnimatePresence>
        {sequencingStage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#04060A]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 space-y-8"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
              <div className="absolute inset-3 rounded-full border-2 border-dashed border-cyan-400 animate-spin" />
              <Activity className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div className="text-center space-y-3 max-w-md">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {activeStageText}
              </h3>
              
              <div className="space-y-2 text-xs font-mono-num text-left bg-[#080C14] p-4 rounded-2xl border border-white/10 shadow-2xl">
                <div className={`flex items-center space-x-2 ${sequencingStage >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                  <span>{sequencingStage >= 1 ? '✓' : '•'}</span>
                  <span>1. Reading your financial history (Dates, Modes, Outlays)</span>
                </div>
                <div className={`flex items-center space-x-2 ${sequencingStage >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                  <span>{sequencingStage >= 2 ? '✓' : '•'}</span>
                  <span>2. Finding patterns (Subscriptions, Burn Rate, Anomalies)</span>
                </div>
                <div className={`flex items-center space-x-2 ${sequencingStage >= 3 ? 'text-purple-400 font-bold' : 'text-slate-600'}`}>
                  <span>{sequencingStage >= 3 ? '✓' : '•'}</span>
                  <span>3. Building your Financial DNA (Double-Helix 3D Matrix)</span>
                </div>
                <div className={`flex items-center space-x-2 ${sequencingStage >= 4 ? 'text-emerald-300 font-extrabold' : 'text-slate-600'}`}>
                  <span>{sequencingStage >= 4 ? '✓' : '•'}</span>
                  <span>4. Intelligence ready.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono-num font-bold text-emerald-400 tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-World Zero-Knowledge Ingestion</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto leading-[1.08]">
          INGEST YOUR LEDGER. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            SEQUENCE REAL DNA.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          FinGuard parses your real statement (Date, Mode, Category, Subcategory, Amount, Income/Expense, Currency) with zero hallucination.
        </p>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center space-y-4 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-cyan-500/40 bg-gradient-to-b from-[#0B0F19]/80 to-[#07090F]/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.ofx,.tsv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8 text-emerald-400 group-hover:text-cyan-300 transition-colors" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            Drag and drop your statement file here
          </h3>
          <p className="text-xs text-slate-400">
            Supports CSV, JSON, OFX, TSV with automated column inspection and currency normalization.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 text-xs font-mono-num text-cyan-400 font-semibold px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
          <span>Or click to browse files from device</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Featured Primary Dataset: Daily Household Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-num font-bold text-slate-400 tracking-wider uppercase">
            // Verified Real-World Ledger Ready To Sequence
          </span>
          <span className="text-[11px] text-slate-500 font-mono-num">
            {REAL_HOUSEHOLD_DATASET.transactions.length} Verified Entries
          </span>
        </div>

        <div
          onClick={() => startSequencing(REAL_HOUSEHOLD_DATASET)}
          className="group p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-[#0A0E18] to-cyan-950/30 hover:border-emerald-400 transition-all duration-200 cursor-pointer space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-num">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase">
                {REAL_HOUSEHOLD_DATASET.name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                {REAL_HOUSEHOLD_DATASET.timeRange.start} → {REAL_HOUSEHOLD_DATASET.timeRange.end}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
              {REAL_HOUSEHOLD_DATASET.currencySymbol}
              {REAL_HOUSEHOLD_DATASET.totalIncomeAllTime.toLocaleString('en-IN')} Total Inflows
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {REAL_HOUSEHOLD_DATASET.personaTitle}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {REAL_HOUSEHOLD_DATASET.tagline}
              </p>
            </div>

            <div className="px-5 py-2.5 bg-emerald-400 text-slate-950 font-black text-xs rounded-xl group-hover:scale-105 transition-transform flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20">
              <span>Sequence Financial DNA</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
