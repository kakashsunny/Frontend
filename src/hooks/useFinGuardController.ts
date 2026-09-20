import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ActView, FinancialDataset, Transaction } from '../types';
import { REAL_HOUSEHOLD_DATASET } from '../data/datasets';
import { InsightStory } from '../utils/insightStoryBuilder';

export type StoryActionPayload = {
  prompt?: string;
  anomalyId?: string;
};

const TOAST_DURATION_MS = 3500;

export function useFinGuardController() {
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

  const [askInitialPrompt, setAskInitialPrompt] =
    useState<string | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleProceedToAskWithPrompt = useCallback((prompt?: string) => {
    setAskInitialPrompt(prompt);
    setActiveStory(null);
    setInvestigatingTransaction(null);
    setActiveAct('ask');
  }, []);

  const handleOpenStory = useCallback((story: InsightStory) => {
    setActiveStory(story);
  }, []);

  const handleInvestigateTransaction = useCallback(
    (transaction: Transaction) => {
      setInvestigatingTransaction(transaction);
    },
    []
  );

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
    [
      handleAcknowledgeAnomaly,
      handleDisputeAnomaly,
      showToast,
    ]
  );

  const activeAnomalyCount = useMemo(
    () =>
      dataset?.anomalies.filter(
        (anomaly) => anomaly.status === 'detected'
      ).length ?? 0,
    [dataset]
  );

  return {
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

    hasDataset: Boolean(dataset),

    setActiveAct,
    setIsSwitcherOpen,
    setIsTransparencyOpen,
    setShowIngestionGate,
    setSelectedTransaction,
    setInvestigatingTransaction,
    setActiveStory,

    handleDatasetLoaded,
    handleDisputeAnomaly,
    handleAcknowledgeAnomaly,
    handleProceedToAskWithPrompt,
    handleOpenStory,
    handleInvestigateTransaction,
    handleSelectAct,
    handleExecuteStoryAction,
  };
}
