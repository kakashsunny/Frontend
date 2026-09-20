import React, { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ActView, FinancialDataset, Transaction, InsightStory } from "../types";
import ActSee from "./ActSee";
import ActUnderstand from "./ActUnderstand";
import ActAsk from "./ActAsk";
import ActAct from "./ActAct";

interface FinGuardWorkspaceProps {
  activeAct: ActView;
  dataset: FinancialDataset;

  askInitialPrompt?: string;

  setActiveAct: Dispatch<SetStateAction<ActView>>;
  setSelectedTransaction: Dispatch<SetStateAction<Transaction | null>>;
  setIsTransparencyOpen: Dispatch<SetStateAction<boolean>>;

  handleProceedToAskWithPrompt: (prompt?: string) => void;
  handleDisputeAnomaly: (anomalyId: string) => void;
  handleAcknowledgeAnomaly: (anomalyId: string) => void;
  handleOpenStory: (story: InsightStory) => void;
  handleInvestigateTransaction: (transaction: Transaction) => void;
}

const FinGuardWorkspace: React.FC<FinGuardWorkspaceProps> = ({
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
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeAct === "see" && (
        <motion.div
          key="see"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          <ActSee
            dataset={dataset}
            onProceedToUnderstand={() => setActiveAct("understand")}
            onSelectTransaction={setSelectedTransaction}
            onOpenTransparency={() => setIsTransparencyOpen(true)}
          />
        </motion.div>
      )}

      {activeAct === "understand" && (
        <motion.div
          key="understand"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
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

      {activeAct === "ask" && (
        <motion.div
          key="ask"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          <ActAsk
            dataset={dataset}
            initialPrompt={askInitialPrompt}
            onProceedToAct={() => setActiveAct("act")}
          />
        </motion.div>
      )}

      {activeAct === "act" && (
        <motion.div
          key="act"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          <ActAct
            dataset={dataset}
            onOpenTransparency={() => setIsTransparencyOpen(true)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinGuardWorkspace;
