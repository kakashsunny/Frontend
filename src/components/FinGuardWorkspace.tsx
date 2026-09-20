import React, { Dispatch, SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import {
  ActView,
  FinancialDataset,
  Transaction,
} from '../types';

import { InsightStory } from '../utils/insightStoryBuilder';

import { ActSee } from './ActSee';
import { ActUnderstand } from './ActUnderstand';
import { ActAsk } from './ActAsk';
import { ActAct } from './ActAct';

type FinGuardWorkspaceProps = {
  activeAct: ActView;
  dataset: FinancialDataset;

  askInitialPrompt?: string;

  setActiveAct: Dispatch<SetStateAction<ActView>>;
  setSelectedTransaction: Dispatch<
    SetStateAction<Transaction | null>
  >;
  setIsTransparencyOpen: Dispatch<SetStateAction<boolean>>;

  handleProceedToAskWithPrompt: (prompt?: string) => void;
  handleDisputeAnomaly: (anomalyId: string) => void;
  handleAcknowledgeAnomaly: (anomalyId: string) => void;
  handleOpenStory: (story: InsightStory) => void;
  handleInvestigateTransaction: (
    transaction: Transaction
  ) => void;
};

export function FinGuardWorkspace({
  activeAct,
  dataset,
  askInitialPrompt,
  setActiveAct,
  setSelectedTransaction,
  setIsTransparencyOpen,
  handleProceedToAskWithPrompt,
  handleDisputeAnomaly,
  handleAcknowledgeAnomaly,
  handleOpenStory,
  handleInvestigateTransaction,
}: FinGuardWorkspaceProps) {
  return (
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
            onProceedToAct={() =>
              setActiveAct('act')
            }
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
  );
}
