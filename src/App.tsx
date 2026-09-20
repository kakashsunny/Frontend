import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActView, FinancialDataset, Transaction } from './types';
import { REAL_HOUSEHOLD_DATASET } from './data/datasets';
import { FloatingNav } from './components/FloatingNav';
import { ActSee } from './components/ActSee';
import { ActUnderstand } from './components/ActUnderstand';
import { ActAsk } from './components/ActAsk';
import { ActAct } from './components/ActAct';
import { DataIngestionGate } from './components/DataIngestionGate';
import { TransactionInspectorModal } from './components/TransactionInspectorModal';
import { DatasetSwitcherModal } from './components/DatasetSwitcherModal';
import { CalculationTransparencyModal } from './components/CalculationTransparencyModal';
import { InsightStoryView } from './components/InsightStoryView';
import { TransactionInvestigationMode } from './components/TransactionInvestigationMode';
import { InsightStory } from './utils/insightStoryBuilder';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeAct, setActiveAct] = useState<ActView>('see');
  const [dataset, setDataset] = useState<FinancialDataset | null>(REAL_HOUSEHOLD_DATASET);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);
  const [showIngestionGate, setShowIngestionGate] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [investigatingTransaction, setInvestigatingTransaction] = useState<Transaction | null>(null);
  const [activeStory, setActiveStory] = useState<InsightStory | null>(null);
  const [askInitialPrompt, setAskInitialPrompt] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDatasetLoaded = (newDataset: FinancialDataset) => {
    setDataset(newDataset);
    setShowIngestionGate(false);
    setActiveAct('see');
    setActiveStory(null);
    setInvestigatingTransaction(null);
    showToast(`Successfully sequenced ledger: "${newDataset.name}" (${newDataset.transactions.length} nodes parsed)`);
  };

  const handleDisputeAnomaly = (anomalyId: string) => {
    if (!dataset) return;
    setDataset(prev => {
      if (!prev) return null;
      return {
        ...prev,
        anomalies: prev.anomalies.map(a => a.id === anomalyId ? { ...a, status: 'disputed' } : a),
        transactions: prev.transactions.map(t => t.id === anomalyId ? { ...t, status: 'cleared', tags: [...t.tags, 'Disputed'] } : t)
      };
    });
    showToast('Anomaly flagged as disputed. Formal dispute notice generated.');
  };

  const handleAcknowledgeAnomaly = (anomalyId: string) => {
    if (!dataset) return;
    setDataset(prev => {
      if (!prev) return null;
      return {
        ...prev,
        anomalies: prev.anomalies.map(a => a.id === anomalyId ? { ...a, status: 'acknowledged' } : a)
      };
    });
    showToast('Transaction acknowledged and added to regular baseline.');
  };

  const handleProceedToAskWithPrompt = (prompt?: string) => {
    if (prompt) setAskInitialPrompt(prompt);
    setActiveStory(null);
    setInvestigatingTransaction(null);
    setActiveAct('ask');
  };

  const handleOpenStory = (story: InsightStory) => {
    setActiveStory(story);
  };

  const handleInvestigateTransaction = (tx: Transaction) => {
    setInvestigatingTransaction(tx);
  };

  const handleExecuteStoryAction = (actionType: string, payload?: any) => {
    setActiveStory(null);
    if (actionType === 'act_view') {
      setActiveAct('act');
      showToast('Navigated to ACT 04 for intervention simulation.');
    } else if (actionType === 'ask_view') {
      setActiveAct('ask');
      if (payload?.prompt) {
        setAskInitialPrompt(payload.prompt);
      }
    } else if (actionType === 'dispute' && payload?.anomalyId) {
      handleDisputeAnomaly(payload.anomalyId);
    } else if (actionType === 'acknowledge' && payload?.anomalyId) {
      handleAcknowledgeAnomaly(payload.anomalyId);
    } else {
      setActiveAct('act');
    }
  };

  const activeAnomalyCount = dataset ? dataset.anomalies.filter(a => a.status === 'detected').length : 0;

  return (
    <div className="min-h-screen bg-[#04060A] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-x-hidden font-sans">
      {/* Dynamic Background Noise / Light Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 bg-[#0D1524]/90 backdrop-blur-xl border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-2xl shadow-2xl shadow-black/80"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigation */}
      <FloatingNav
        activeAct={activeAct}
        onSelectAct={(act) => {
          if (act !== 'ask') setAskInitialPrompt(undefined);
          setActiveAct(act);
        }}
        dataset={dataset}
        onOpenDatasetSwitcher={() => setIsSwitcherOpen(true)}
        onOpenTransparencyModal={() => setIsTransparencyOpen(true)}
        anomalyCount={activeAnomalyCount}
      />

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 pb-24 px-3 sm:px-6">
        {showIngestionGate || !dataset ? (
          <motion.div
            key="ingestion"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pt-20"
          >
            <DataIngestionGate
              onDatasetLoaded={handleDatasetLoaded}
              onCancel={dataset ? () => setShowIngestionGate(false) : undefined}
            />
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {activeAct === 'see' && (
              <motion.div
                key="see"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActSee
                  dataset={dataset}
                  onProceedToUnderstand={() => setActiveAct('understand')}
                  onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                  onOpenTransparencyModal={() => setIsTransparencyOpen(true)}
                  onOpenStory={handleOpenStory}
                  onInvestigateTransaction={handleInvestigateTransaction}
                />
              </motion.div>
            )}

            {activeAct === 'understand' && (
              <motion.div
                key="understand"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActUnderstand
                  dataset={dataset}
                  onProceedToAsk={handleProceedToAskWithPrompt}
                  onDisputeAnomaly={handleDisputeAnomaly}
                  onAcknowledgeAnomaly={handleAcknowledgeAnomaly}
                  onOpenStory={handleOpenStory}
                  onInvestigateTransaction={handleInvestigateTransaction}
                />
              </motion.div>
            )}

            {activeAct === 'ask' && (
              <motion.div
                key="ask"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActAsk
                  dataset={dataset}
                  initialPrompt={askInitialPrompt}
                  onProceedToAct={() => setActiveAct('act')}
                  onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                  onOpenStory={handleOpenStory}
                />
              </motion.div>
            )}

            {activeAct === 'act' && (
              <motion.div
                key="act"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActAct
                  dataset={dataset}
                  onOpenTransparencyModal={() => setIsTransparencyOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Immersive Insight Story Mode Overlay */}
      <AnimatePresence>
        {activeStory && dataset && (
          <InsightStoryView
            story={activeStory}
            dataset={dataset}
            onClose={() => setActiveStory(null)}
            onExecuteAction={handleExecuteStoryAction}
            onSelectTransaction={(tx) => setSelectedTransaction(tx)}
          />
        )}
      </AnimatePresence>

      {/* Full-Screen Transaction Investigation Mode Scene */}
      <AnimatePresence>
        {investigatingTransaction && dataset && (
          <TransactionInvestigationMode
            transaction={investigatingTransaction}
            dataset={dataset}
            onClose={() => setInvestigatingTransaction(null)}
            onAskAI={(prompt) => {
              setInvestigatingTransaction(null);
              handleProceedToAskWithPrompt(prompt);
            }}
            onDisputeAnomaly={handleDisputeAnomaly}
            onAcknowledgeAnomaly={handleAcknowledgeAnomaly}
          />
        )}
      </AnimatePresence>

      {/* Dataset Switcher Modal */}
      <DatasetSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentDataset={dataset}
        onSelectDataset={handleDatasetLoaded}
      />

      {/* Calculation Transparency & Mathematical Audit Modal */}
      {dataset && (
        <CalculationTransparencyModal
          isOpen={isTransparencyOpen}
          onClose={() => setIsTransparencyOpen(false)}
          dataset={dataset}
        />
      )}

      {/* Transaction Node Detail Inspector */}
      <TransactionInspectorModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDispute={handleDisputeAnomaly}
        onAskCopilot={(prompt) => handleProceedToAskWithPrompt(prompt)}
        onInvestigate={handleInvestigateTransaction}
      />

      {/* Clean Minimal Responsive Editorial Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8 text-center font-mono-num text-slate-500 space-y-2 sm:space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-2 sm:gap-x-3 text-[10px] sm:text-xs md:text-sm tracking-wider uppercase">
          <span className="font-bold text-slate-300">FINGUARD AI</span>
          <span className="text-slate-600 hidden xs:inline">•</span>
          <span className="text-slate-400 font-medium hidden xs:inline">AUTONOMOUS FINANCIAL INTELLIGENCE</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold truncate max-w-[280px] sm:max-w-none">DATA SOURCE: {dataset?.name || 'DAILY HOUSEHOLD TRANSACTIONS'}</span>
        </div>
        <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed font-sans">
          Crafted for AI for Everyday Life Hackathon • Client-side deterministic vectorization with zero cloud data retention.
        </p>
      </footer>
    </div>
  );
}
