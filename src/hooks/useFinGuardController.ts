import { useCallback, useMemo, useState } from 'react';

import {
  ActView,
  FinancialDataset,
  Transaction,
} from '../types';

import {
  InsightStory,
} from '../utils/insightStoryBuilder';

export function useFinGuardController() {
  const [activeAct, setActiveAct] =
    useState<ActView>('see');

  const [dataset, setDataset] =
    useState<FinancialDataset | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [isTransparencyOpen, setIsTransparencyOpen] =
    useState(false);

  const [isDatasetSwitcherOpen, setIsDatasetSwitcherOpen] =
    useState(false);

  const [isIngestionOpen, setIsIngestionOpen] =
    useState(false);

  const [selectedStory, setSelectedStory] =
    useState<InsightStory | null>(null);

  const [isInvestigationOpen, setIsInvestigationOpen] =
    useState(false);

  const [investigationTransaction, setInvestigationTransaction] =
    useState<Transaction | null>(null);

  const [askInitialPrompt, setAskInitialPrompt] =
    useState<string | undefined>(undefined);

  const [toast, setToast] =
    useState<string | null>(null);

  /*
   * ============================================================
   * TEMPORAL FINANCIAL DNA REPLAY
   * ============================================================
   */

  const [isReplayMode, setIsReplayMode] =
    useState(false);

  /*
   * 0 → beginning of dataset
   * 1 → complete dataset
   */
  const [replayProgress, setReplayProgress] =
    useState(1);

  /*
   * Whether the replay animation is currently playing.
   */
  const [isReplayPlaying, setIsReplayPlaying] =
    useState(false);

  /*
   * ------------------------------------------------------------
   * Replay date range
   * ------------------------------------------------------------
   */

  const replayTransactions = useMemo(() => {
    if (!dataset?.transactions?.length) {
      return [];
    }

    return [...dataset.transactions].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
  }, [dataset]);

  const replayStartDate =
    replayTransactions[0]?.date ?? null;

  const replayEndDate =
    replayTransactions[
      replayTransactions.length - 1
    ]?.date ?? null;

  /*
   * Current replay cutoff.
   *
   * Example:
   *
   * progress = 0
   * → first transaction
   *
   * progress = 0.5
   * → approximately halfway through the ledger
   *
   * progress = 1
   * → entire ledger
   */
  const replayCutoffIndex = useMemo(() => {
    if (!replayTransactions.length) {
      return 0;
    }

    if (replayProgress >= 1) {
      return replayTransactions.length;
    }

    return Math.max(
      1,
      Math.ceil(
        replayProgress *
          replayTransactions.length
      )
    );
  }, [
    replayProgress,
    replayTransactions.length,
  ]);

  /*
   * Transactions currently visible during replay.
   */
  const replayVisibleTransactions =
    useMemo(() => {
      return replayTransactions.slice(
        0,
        replayCutoffIndex
      );
    }, [
      replayTransactions,
      replayCutoffIndex,
    ]);

  /*
   * Date represented by the current replay position.
   */
  const replayCurrentDate =
    replayVisibleTransactions[
      replayVisibleTransactions.length - 1
    ]?.date ??
    replayStartDate;

  /*
   * ------------------------------------------------------------
   * Replay statistics
   *
   * These are calculated ONLY from transactions currently
   * revealed by the timeline.
   * ------------------------------------------------------------
   */

  const replayStats = useMemo(() => {
    const transactions =
      replayVisibleTransactions;

    if (!transactions.length) {
      return {
        transactionCount: 0,
        income: 0,
        spending: 0,
        net: 0,
        anomalyCount: 0,
        subscriptionCount: 0,
      };
    }

    let income = 0;
    let spending = 0;
    let anomalyCount = 0;
    let subscriptionCount = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        spending += tx.amount;
      }

      if (tx.status === 'anomaly') {
        anomalyCount++;
      }

      if (tx.isSubscription) {
        subscriptionCount++;
      }
    });

    return {
      transactionCount:
        transactions.length,

      income,

      spending,

      net: income - spending,

      anomalyCount,

      subscriptionCount,
    };
  }, [replayVisibleTransactions]);

  /*
   * ------------------------------------------------------------
   * Enter replay
   * ------------------------------------------------------------
   */

  const handleStartReplay = useCallback(() => {
    if (!dataset?.transactions?.length) {
      return;
    }

    setIsReplayMode(true);
    setIsReplayPlaying(false);
    setReplayProgress(0);
    setActiveAct('see');
  }, [dataset]);

  /*
   * ------------------------------------------------------------
   * Exit replay
   * ------------------------------------------------------------
   */

  const handleExitReplay = useCallback(() => {
    setIsReplayMode(false);
    setIsReplayPlaying(false);
    setReplayProgress(1);
  }, []);

  /*
   * ------------------------------------------------------------
   * Timeline movement
   * ------------------------------------------------------------
   */

  const handleReplayProgressChange =
    useCallback(
      (value: number) => {
        const nextValue = Math.max(
          0,
          Math.min(1, value)
        );

        setReplayProgress(nextValue);
        setIsReplayPlaying(false);
      },
      []
    );

  /*
   * ------------------------------------------------------------
   * Play / pause
   * ------------------------------------------------------------
   */

  const handleToggleReplay =
    useCallback(() => {
      if (!isReplayMode) {
        return;
      }

      /*
       * If we reached the end, pressing play starts again.
       */
      if (replayProgress >= 1) {
        setReplayProgress(0);
        setIsReplayPlaying(true);
        return;
      }

      setIsReplayPlaying(
        (current) => !current
      );
    }, [
      isReplayMode,
      replayProgress,
    ]);

  /*
   * ------------------------------------------------------------
   * Replay completion
   * ------------------------------------------------------------
   */

  const handleReplayComplete =
    useCallback(() => {
      setReplayProgress(1);
      setIsReplayPlaying(false);
    }, []);

  /*
   * ------------------------------------------------------------
   * Existing application actions
   * ------------------------------------------------------------
   */

  const handleProceedToAskWithPrompt =
    useCallback(
      (prompt?: string) => {
        setAskInitialPrompt(prompt);
        setActiveAct('ask');
      },
      []
    );

  const handleOpenStory =
    useCallback(
      (story: InsightStory) => {
        setSelectedStory(story);
      },
      []
    );

  const handleCloseStory =
    useCallback(() => {
      setSelectedStory(null);
    }, []);

  const handleDisputeAnomaly =
    useCallback((anomalyId: string) => {
      setToast(
        `Anomaly ${anomalyId} marked for verification.`
      );

      window.setTimeout(() => {
        setToast(null);
      }, 2800);
    }, []);

  const handleAcknowledgeAnomaly =
    useCallback((anomalyId: string) => {
      setToast(
        `Anomaly ${anomalyId} acknowledged.`
      );

      window.setTimeout(() => {
        setToast(null);
      }, 2800);
    }, []);

  const handleInvestigateTransaction =
    useCallback(
      (transaction: Transaction) => {
        setInvestigationTransaction(
          transaction
        );

        setIsInvestigationOpen(true);
      },
      []
    );

  const handleCloseInvestigation =
    useCallback(() => {
      setIsInvestigationOpen(false);
      setInvestigationTransaction(null);
    }, []);

  const handleLoadDataset =
    useCallback(
      (nextDataset: FinancialDataset) => {
        setDataset(nextDataset);

        /*
         * New dataset = fresh replay.
         */
        setReplayProgress(1);
        setIsReplayMode(false);
        setIsReplayPlaying(false);

        setSelectedTransaction(null);
        setActiveAct('see');

        setIsIngestionOpen(false);

        setToast(
          `Loaded ${nextDataset.transactions.length.toLocaleString(
            'en-IN'
          )} transactions.`
        );

        window.setTimeout(() => {
          setToast(null);
        }, 2800);
      },
      []
    );

  const handleOpenDatasetSwitcher =
    useCallback(() => {
      setIsDatasetSwitcherOpen(true);
    }, []);

  const handleCloseDatasetSwitcher =
    useCallback(() => {
      setIsDatasetSwitcherOpen(false);
    }, []);

  const handleOpenIngestion =
    useCallback(() => {
      setIsIngestionOpen(true);
    }, []);

  const handleCloseIngestion =
    useCallback(() => {
      setIsIngestionOpen(false);
    }, []);

  /*
   * ------------------------------------------------------------
   * Return controller
   * ------------------------------------------------------------
   */

  return {
    /*
     * Core app state
     */
    activeAct,
    setActiveAct,

    dataset,
    setDataset,

    selectedTransaction,
    setSelectedTransaction,

    isTransparencyOpen,
    setIsTransparencyOpen,

    isDatasetSwitcherOpen,
    setIsDatasetSwitcherOpen,

    isIngestionOpen,
    setIsIngestionOpen,

    selectedStory,
    setSelectedStory,

    isInvestigationOpen,
    setIsInvestigationOpen,

    investigationTransaction,
    setInvestigationTransaction,

    askInitialPrompt,
    toast,

    /*
     * Dataset
     */
    handleLoadDataset,
    handleOpenDatasetSwitcher,
    handleCloseDatasetSwitcher,
    handleOpenIngestion,
    handleCloseIngestion,

    /*
     * Existing workflows
     */
    handleProceedToAskWithPrompt,
    handleDisputeAnomaly,
    handleAcknowledgeAnomaly,
    handleOpenStory,
    handleCloseStory,
    handleInvestigateTransaction,
    handleCloseInvestigation,

    /*
     * ==========================================================
     * TEMPORAL REPLAY API
     * ==========================================================
     */
    isReplayMode,

    replayProgress,

    isReplayPlaying,

    replayTransactions,

    replayVisibleTransactions,

    replayStartDate,

    replayEndDate,

    replayCurrentDate,

    replayCutoffIndex,

    replayStats,

    handleStartReplay,

    handleExitReplay,

    handleReplayProgressChange,

    handleToggleReplay,

    handleReplayComplete,
  };
}
