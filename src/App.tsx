import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

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

type StoryActionPayload = {
  prompt?: string;
  anomalyId?: string;
};

const TOAST_DURATION_MS = 3500;

export default function App() {
  const [activeAct, setActiveAct] = useState<ActView>('see');
  const [dataset, setDataset] = useState<FinancialDataset | null>(
    REAL_HOUSEHOLD_DATASET
  );

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);
  const [showIngestionGate, setShowIngestionGate] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [investigatingTransaction, setInvestigatingTransaction] =
    useState<Transaction | null>(null);

  const [activeStory, setActiveStory] = useState<InsightStory | null>(null);

  const [askInitialPrompt, setAskInitialPrompt] = useState<
    string | undefined
  >(undefined);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Keep the toast timer under control so repeated notifications
   * never leave orphaned timers behind.
   */
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);

    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /*
   * Escape closes temporary overlays.
   * This gives keyboard users a predictable way to leave
   * Investigation / Story / modal states.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (activeStory) {
        setActiveStory(null);
        return;
      }

      if (investigatingTransaction) {
        setInvestigatingTransaction(null);
        return;
      }

      if (isSwitcherOpen) {
        setIsSwitcherOpen(false);
        return;
      }

      if (isTransparencyOpen) {
        setIsTransparencyOpen(false);
        return;
      }

      if (selectedTransaction) {
        setSelectedTransaction(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeStory,
    investigatingTransaction,
    isSwitcherOpen,
    isTransparencyOpen,
    selectedTransaction,
  ]);

  const handleDatasetLoaded = useCallback(
    (newDataset: FinancialDataset) => {
      setDataset(newDataset);
      setShowIngestionGate(false);
      setActiveAct('see');

      setActiveStory(null);
      setInvestigatingTransaction(null);
      setSelectedTransaction(null);
      setAskInitialPrompt(undefined);

      showToast(
        `Successfully sequenced ledger: "${newDataset.name}" (${newDataset.transactions.length} nodes parsed)`
      );
    },
    [showToast]
  );

  const handleDisputeAnomaly = useCallback(
    (anomalyId: string) => {
      if (!anomalyId) return;

      setDataset((previousDataset) => {
        if (!previousDataset) return null;

        return {
          ...previousDataset,

          anomalies: previousDataset.anomalies.map((anomaly) =>
            anomaly.id === anomalyId
              ? { ...anomaly, status: 'disputed' }
              : anomaly
          ),

          transactions: previousDataset.transactions.map((transaction) =>
            transaction.id === anomalyId
              ? {
                  ...transaction,
                  status: 'cleared',
                  tags: transaction.tags.includes('Disputed')
                    ? transaction.tags
                    : [...transaction.tags, 'Disputed'],
                }
              : transaction
          ),
        };
      });

      showToast('Anomaly marked as disputed.');
    },
    [showToast]
  );

  const handleAcknowledgeAnomaly = useCallback(
    (anomalyId: string) => {
      if (!anomalyId) return;

      setDataset((previousDataset) => {
        if (!previousDataset) return null;

        return {
          ...previousDataset,
          anomalies: previousDataset.anomalies.map((anomaly) =>
            anomaly.id === anomalyId
              ? { ...anomaly, status: 'acknowledged' }
              : anomaly
          ),
        };
      });

      showToast('Transaction acknowledged and added to the baseline.');
    },
    [showToast]
  );

  const handleProceedToAskWithPrompt = useCallback(
    (prompt?: string) => {
      setAskInitialPrompt(prompt);
      setActiveStory(null);
      setInvestigatingTransaction(null);
      setActiveAct('ask');
    },
    []
  );

  const handleOpenStory = useCallback((story: InsightStory) => {
    setActiveStory(story);
  }, []);

  const handleInvestigateTransaction = useCallback((transaction: Transaction) => {
    setInvestigatingTransaction(transaction);
  }, []);

  const handleSelectAct = useCallback((act: ActView) => {
    if (act !== 'ask') {
      setAskInitialPrompt(undefined);
    }

    setActiveStory(null);
    setInvestigatingTransaction(null);
    setSelectedTransaction(null);
    setActiveAct(act);
  }, []);

  const handleExecuteStoryAction = useCallback(
    (actionType: string, payload?: StoryActionPayload) => {
      setActiveStory(null);

      switch (actionType) {
        case 'act_view':
          setActiveAct('act');
          showToast('Navigated to ACT 04 for intervention simulation.');
          break;

        case 'ask_view':
          setActiveAct('ask');

          if (payload?.prompt) {
            setAskInitialPrompt(payload.prompt);
          }
          break;

        case 'dispute':
          if (payload?.anomalyId) {
            handleDisputeAnomaly(payload.anomalyId);
          }
          break;

        case 'acknowledge':
          if (payload?.anomalyId) {
            handleAcknowledgeAnomaly(payload.anomalyId);
          }
          break;

        default:
          setActiveAct('act');
      }
    },
    [handleAcknowledgeAnomaly, handleDisputeAnomaly, showToast]
  );

  const activeAnomalyCount = useMemo(
    () =>
      dataset?.anomalies.filter(
        (anomaly) => anomaly.status === 'detected'
      ).length ?? 0,
    [dataset]
  );

  const hasDataset = Boolean(dataset);

  return (
    <div
      className="min-h-screen bg-[#04060A] text-slate-100 flex flex-col
        selection:bg-emerald-500/30 selection:text-emerald-300
        relative overflow-x-hidden font-sans"
    >
      {/* Decorative background only. Hidden from assistive technology. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30"
      >
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Accessible live status for important application feedback. */}
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
          Crafted for AI for Everyday Life Hackathon •
          Client-side deterministic vectorization with zero cloud
          data retention.
        </p>
      </footer>
    </div>
  );
}
