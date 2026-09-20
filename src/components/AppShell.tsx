import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

import { ActView, FinancialDataset, Transaction } from '../types';
import { InsightStory } from '../utils/insightStoryBuilder';

import { FloatingNav } from './FloatingNav';
import { ActSee } from './ActSee';
import { ActUnderstand } from './ActUnderstand';
import { ActAsk } from './ActAsk';
import { ActAct } from './ActAct';
import { DataIngestionGate } from './DataIngestionGate';
import { TransactionInspectorModal } from './TransactionInspectorModal';
import { DatasetSwitcherModal } from './DatasetSwitcherModal';
import { CalculationTransparencyModal } from './CalculationTransparencyModal';
import { InsightStoryView } from './InsightStoryView';
import { TransactionInvestigationMode } from './TransactionInvestigationMode';

type StoryActionPayload = {
  prompt?: string;
  anomalyId?: string;
};

type AppShellProps = {
  activeAct: ActView;
  dataset: FinancialDataset | null;

  isSwitcherOpen: boolean;
  isTransparencyOpen: boolean;
  showIngestionGate: boolean;

  selectedTransaction: Transaction | null;
  investigatingTransaction: Transaction | null;
  activeStory: InsightStory | null;

  askInitialPrompt?: string;
  toastMessage: string | null;
  activeAnomalyCount: number;
  hasDataset: boolean;

  setIsSwitcherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTransparencyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowIngestionGate: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<Transaction | null>
  >;
  setInvestigatingTransaction: React.Dispatch<
    React.SetStateAction<Transaction | null>
  >;
  setActiveStory: React.Dispatch<React.SetStateAction<InsightStory | null>>;
  setActiveAct: React.Dispatch<React.SetStateAction<ActView>>;

  handleDatasetLoaded: (dataset: FinancialDataset) => void;
  handleDisputeAnomaly: (anomalyId: string) => void;
  handleAcknowledgeAnomaly: (anomalyId: string) => void;
  handleProceedToAskWithPrompt: (prompt?: string) => void;
  handleOpenStory: (story: InsightStory) => void;
  handleInvestigateTransaction: (transaction: Transaction) => void;
  handleSelectAct: (act: ActView) => void;
  handleExecuteStoryAction: (
    actionType: string,
    payload?: StoryActionPayload
  ) => void;
};

export function AppShell({
  activeAct,
  dataset,
  isSwitcherOpen,
  isTransparencyOpen,
  showIngestionGate,
  selectedTransaction,
  investigatingTransaction,
  activeStory,
  askInitialPrompt,
  toastMessage,
  activeAnomalyCount,
  hasDataset,

  setIsSwitcherOpen,
  setIsTransparencyOpen,
  setShowIngestionGate,
  setSelectedTransaction,
  setInvestigatingTransaction,
  setActiveStory,
  setActiveAct,

  handleDatasetLoaded,
  handleDisputeAnomaly,
  handleAcknowledgeAnomaly,
  handleProceedToAskWithPrompt,
  handleOpenStory,
  handleInvestigateTransaction,
  handleSelectAct,
  handleExecuteStoryAction,
}: AppShellProps) {
  return (
    <div
      className="min-h-screen bg-[#04060A] text-slate-100 flex flex-col
        selection:bg-emerald-500/30 selection:text-emerald-300
        relative overflow-x-hidden font-sans"
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30"
      >
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toastMessage ?? ''}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-5 z-50 max-w-[min(92vw,420px)]
              flex items-center gap-2.5 px-4 py-3
              bg-[#0D1524]/95 backdrop-blur-xl
              border border-emerald-500/40
              text-emerald-300 text-xs font-semibold
              rounded-2xl shadow-2xl shadow-black/80"
          >
            <CheckCircle2
              aria-hidden="true"
              className="w-4 h-4 text-emerald-400 shrink-0"
            />

            <span className="break-words">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingNav
        activeAct={activeAct}
        onSelectAct={handleSelectAct}
        dataset={dataset}
        onOpenDatasetSwitcher={() => setIsSwitcherOpen(true)}
        onOpenTransparencyModal={() => setIsTransparencyOpen(true)}
        anomalyCount={activeAnomalyCount}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex-1 pb-24 px-3 sm:px-6 outline-none"
      >
        {!hasDataset || showIngestionGate ? (
          <motion.section
            key="ingestion"
            aria-label="Financial data import"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="pt-20"
          >
            <DataIngestionGate
              onDatasetLoaded={handleDatasetLoaded}
              onCancel={
                dataset
                  ? () => setShowIngestionGate(false)
                  : undefined
              }
            />
          </motion.section>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {activeAct === 'see' && (
              <motion.section
                key="see"
                aria-label="Financial overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActSee
                  dataset={dataset}
                  onProceedToUnderstand={() =>
                    setActiveAct('understand')
                  }
                  onSelectTransaction={setSelectedTransaction}
                  onOpenTransparencyModal={() =>
                    setIsTransparencyOpen(true)
                  }
                  onOpenStory={handleOpenStory}
                  onInvestigateTransaction={
                    handleInvestigateTransaction
                  }
                />
              </motion.section>
            )}

            {activeAct === 'understand' && (
              <motion.section
                key="understand"
                aria-label="Financial intelligence"
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
                  onInvestigateTransaction={
                    handleInvestigateTransaction
                  }
                />
              </motion.section>
            )}

            {activeAct === 'ask' && (
              <motion.section
                key="ask"
                aria-label="AI financial copilot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActAsk
                  dataset={dataset}
                  initialPrompt={askInitialPrompt}
                  onProceedToAct={() => setActiveAct('act')}
                  onSelectTransaction={setSelectedTransaction}
                  onOpenStory={handleOpenStory}
                />
              </motion.section>
            )}

            {activeAct === 'act' && (
              <motion.section
                key="act"
                aria-label="Financial action center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ActAct
                  dataset={dataset}
                  onOpenTransparencyModal={() =>
                    setIsTransparencyOpen(true)
                  }
                />
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </main>

      <AnimatePresence>
        {activeStory && dataset && (
          <InsightStoryView
            story={activeStory}
            dataset={dataset}
            onClose={() => setActiveStory(null)}
            onExecuteAction={handleExecuteStoryAction}
            onSelectTransaction={setSelectedTransaction}
          />
        )}
      </AnimatePresence>

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

      <DatasetSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentDataset={dataset}
        onSelectDataset={handleDatasetLoaded}
      />

      {dataset && (
        <CalculationTransparencyModal
          isOpen={isTransparencyOpen}
          onClose={() => setIsTransparencyOpen(false)}
          dataset={dataset}
        />
      )}

      <TransactionInspectorModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDispute={handleDisputeAnomaly}
        onAskCopilot={handleProceedToAskWithPrompt}
        onInvestigate={handleInvestigateTransaction}
      />

      <footer
        className="relative z-10 border-t border-white/5
          py-6 sm:py-8 md:py-10
          px-4 sm:px-6 md:px-8
          text-center font-mono-num text-slate-500
          space-y-2 sm:space-y-3"
      >
        <div
          className="flex flex-wrap items-center justify-center
            gap-y-1.5 gap-x-2 sm:gap-x-3
            text-[10px] sm:text-xs md:text-sm
            tracking-wider uppercase"
        >
          <span className="font-bold text-slate-300">
            FINGUARD AI
          </span>

          <span
            aria-hidden="true"
            className="text-slate-600 hidden xs:inline"
          >
            •
          </span>

          <span className="text-slate-400 font-medium hidden xs:inline">
            AUTONOMOUS FINANCIAL INTELLIGENCE
          </span>

          <span aria-hidden="true" className="text-slate-600">
            •
          </span>

          <span
            className="text-emerald-400 font-semibold
              truncate max-w-[280px] sm:max-w-none"
            title={dataset?.name || 'Daily Household Transactions'}
          >
            DATA SOURCE: {dataset?.name || 'DAILY HOUSEHOLD TRANSACTIONS'}
          </span>
        </div>

        <p
          className="text-[9px] sm:text-[11px] md:text-xs
            text-slate-500 max-w-2xl mx-auto
            leading-relaxed font-sans"
        >
          Crafted for AI for Everyday Life Hackathon • Client-side
          deterministic vectorization with zero cloud data retention.
        </p>
      </footer>
    </div>
  );
}
