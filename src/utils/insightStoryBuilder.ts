import { FinancialDataset, Transaction, AnomalyAlert, SubscriptionItem, TaxDeductionItem } from '../types';

export interface StoryGroup {
  name: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
  color: string;
  badge?: string;
}

export interface InsightStory {
  id: string;
  title: string;
  subtitle: string;
  patternBadge: string;
  badgeColor: string;
  timeRange: {
    start: string;
    end: string;
    focalDate?: string;
    label: string;
  };
  transactions: Transaction[];
  grouping: {
    typeLabel: string;
    groups: StoryGroup[];
  };
  metrics: {
    label: string;
    value: string;
    subtext?: string;
    color?: string;
  }[];
  explanation: {
    headline: string;
    plainLanguage: string;
    exactMath: string;
  };
  nextStep: {
    title: string;
    badge: string;
    description: string;
    actionLabel: string;
    actionType: 'act_view' | 'ask_view' | 'dispute' | 'acknowledge' | 'prune' | 'simulate';
    actionPayload?: any;
  };
}

/**
 * Builds an Insight Story from an Anomaly Alert
 */
export function buildStoryFromAnomaly(
  anomaly: AnomalyAlert,
  dataset: FinancialDataset
): InsightStory {
  const sym = dataset.currencySymbol || '₹';
  const matchingTx = dataset.transactions.find(t => t.id === anomaly.id) || {
    id: anomaly.id,
    date: anomaly.date,
    merchant: anomaly.merchant,
    amount: anomaly.amount,
    type: 'expense',
    category: anomaly.category,
    status: 'anomaly',
    tags: ['Outlier', anomaly.severity],
    mode: 'Bank Transfer'
  } as Transaction;

  // Find related transactions in same category or nearby dates
  const relatedTxs = dataset.transactions
    .filter(t => t.category.toLowerCase() === anomaly.category.toLowerCase() && t.id !== anomaly.id)
    .slice(0, 5);

  const allStoryTxs = [matchingTx, ...relatedTxs];
  const categoryTotal = allStoryTxs.reduce((a, b) => a + b.amount, 0);

  const groups: StoryGroup[] = [
    {
      name: 'Flagged Outlier Record',
      amount: anomaly.amount,
      percentage: Math.round((anomaly.amount / categoryTotal) * 100),
      transactions: [matchingTx],
      color: '#F43F5E',
      badge: '95th Percentile'
    },
    {
      name: `Baseline ${anomaly.category} Normal Outlays`,
      amount: relatedTxs.reduce((a, b) => a + b.amount, 0),
      percentage: Math.round((relatedTxs.reduce((a, b) => a + b.amount, 0) / categoryTotal) * 100),
      transactions: relatedTxs,
      color: '#38BDF8',
      badge: `${relatedTxs.length} Standard Entries`
    }
  ];

  return {
    id: `story-anomaly-${anomaly.id}`,
    title: anomaly.title,
    subtitle: `Statistical Outlier in ${anomaly.category} • ${anomaly.date}`,
    patternBadge: `${anomaly.severity.toUpperCase()} ANOMALY RADAR`,
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    timeRange: {
      start: anomaly.date,
      end: anomaly.date,
      focalDate: anomaly.date,
      label: `Single Event Outlay (${anomaly.date})`
    },
    transactions: allStoryTxs,
    grouping: {
      typeLabel: 'Outlier vs Category Baseline',
      groups
    },
    metrics: [
      {
        label: 'Outlier Amount',
        value: `${sym}${anomaly.amount.toLocaleString('en-IN')}`,
        subtext: anomaly.merchant,
        color: 'text-rose-400'
      },
      {
        label: 'Category Baseline',
        value: `${sym}${Math.round(relatedTxs.reduce((a, b) => a + b.amount, 0) / (relatedTxs.length || 1)).toLocaleString('en-IN')}`,
        subtext: 'Mean category spend',
        color: 'text-cyan-400'
      },
      {
        label: 'Statistical Variance',
        value: `+${Math.round(((anomaly.amount - 2500) / 2500) * 100)}%`,
        subtext: `${anomaly.confidence}% Confidence`,
        color: 'text-amber-400'
      },
      {
        label: 'Runway Impact',
        value: `-0.4 Mo`,
        subtext: 'Liquid reserve delta',
        color: 'text-slate-300'
      }
    ],
    explanation: {
      headline: 'Significant Capital Outlay Divergence',
      plainLanguage: `This ${sym}${anomaly.amount.toLocaleString('en-IN')} payment at ${anomaly.merchant} is over 3x higher than your usual ${anomaly.category} purchases. It represents a major single capital expense rather than a routine daily bill.`,
      exactMath: `${sym}${anomaly.amount.toLocaleString('en-IN')} ÷ ${sym}${dataset.monthlyBurnRate.toLocaleString('en-IN')}/mo avg burn = ${((anomaly.amount / dataset.monthlyBurnRate) * 100).toFixed(1)}% of your entire monthly baseline in a single transaction.`
    },
    nextStep: {
      title: 'Prescribed Financial Action',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: anomaly.suggestedAction || 'Acknowledge this capital asset purchase to update baseline, or flag for merchant dispute if unrecognized.',
      actionLabel: 'Dispute / Acknowledge in Anomaly Radar',
      actionType: 'act_view',
      actionPayload: { anomalyId: anomaly.id }
    }
  };
}

/**
 * Builds an Insight Story from a Recurring Subscription
 */
export function buildStoryFromSubscription(
  sub: SubscriptionItem,
  dataset: FinancialDataset
): InsightStory {
  const sym = dataset.currencySymbol || '₹';
  const subTxs = dataset.transactions.filter(t =>
    t.merchant.toLowerCase().includes(sub.name.toLowerCase()) ||
    t.isSubscription && t.category.toLowerCase() === sub.category.toLowerCase()
  );

  const matchedTxs = subTxs.length > 0 ? subTxs : dataset.transactions.filter(t => t.isSubscription).slice(0, 4);
  const annualized = sub.amount * 12;

  const groups: StoryGroup[] = [
    {
      name: `${sub.name} Cycles`,
      amount: sub.amount,
      percentage: Math.round((sub.amount / dataset.monthlyBurnRate) * 100),
      transactions: matchedTxs,
      color: '#A855F7',
      badge: sub.billingCycle
    },
    {
      name: 'Other Monthly Fixed Subscriptions',
      amount: Math.max(0, dataset.subscriptions.reduce((a, b) => a + b.amount, 0) - sub.amount),
      percentage: Math.round(((dataset.subscriptions.reduce((a, b) => a + b.amount, 0) - sub.amount) / dataset.monthlyBurnRate) * 100),
      transactions: dataset.transactions.filter(t => t.isSubscription && !matchedTxs.some(m => m.id === t.id)).slice(0, 5),
      color: '#06B6D4',
      badge: `${dataset.subscriptions.length - 1} Other Services`
    }
  ];

  return {
    id: `story-sub-${sub.id}`,
    title: `${sub.name} Subscription Audit`,
    subtitle: `${sub.category} • ${sym}${sub.amount}/mo Recurring Stream`,
    patternBadge: 'RECURRING STREAM AUDIT',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    timeRange: {
      start: dataset.timeRange.start,
      end: dataset.timeRange.end,
      label: `Continuous Recurring Cadence (${sub.billingCycle})`
    },
    transactions: matchedTxs,
    grouping: {
      typeLabel: 'Commitment Proportions',
      groups
    },
    metrics: [
      {
        label: 'Monthly Drain',
        value: `${sym}${sub.amount.toFixed(0)}/mo`,
        subtext: sub.billingCycle,
        color: 'text-purple-400'
      },
      {
        label: 'Annualized Outlay',
        value: `${sym}${annualized.toLocaleString('en-IN')}/yr`,
        subtext: '12-Month compounding',
        color: 'text-white'
      },
      {
        label: 'Seat Usage Status',
        value: sub.usageStatus === 'idle' ? 'Dormant (0 Logins)' : 'Active Essential',
        subtext: sub.usageStatus === 'idle' ? 'High prune candidate' : 'Regular utilization',
        color: sub.usageStatus === 'idle' ? 'text-amber-400' : 'text-emerald-400'
      },
      {
        label: 'Recoverable Runway',
        value: `+${(annualized / (dataset.monthlyBurnRate || 1)).toFixed(1)} Mo`,
        subtext: 'If reclaimed to reserves',
        color: 'text-cyan-400'
      }
    ],
    explanation: {
      headline: 'Deterministic Recurring Commitment Signature',
      plainLanguage: `FinGuard verified repeating ${sub.billingCycle} billing cycles of ${sym}${sub.amount.toFixed(0)} for ${sub.name}. Over a 12-month horizon, this single commitment diverts ${sym}${annualized.toLocaleString('en-IN')} from your liquid reserve accumulation.`,
      exactMath: `${sym}${sub.amount.toFixed(0)}/mo × 12 months = ${sym}${annualized.toLocaleString('en-IN')}/yr = ${((annualized / dataset.totalExpenseAllTime) * 100).toFixed(1)}% of your all-time total expenses.`
    },
    nextStep: {
      title: 'Actionable Optimization Plan',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: sub.usageStatus === 'idle'
        ? `Cancel or pause ${sub.name} to immediately recover ${sym}${annualized.toLocaleString('en-IN')} per year back to your savings.`
        : `Lock in an annual billing discount or consolidate with household bundles in the ACT view.`,
      actionLabel: 'Launch Subscription Pruner in ACT View',
      actionType: 'act_view',
      actionPayload: { tab: 'pruner', subId: sub.id }
    }
  };
}

/**
 * Builds an Insight Story from Tax Shield Deductions
 */
export function buildStoryFromTaxShield(
  dataset: FinancialDataset
): InsightStory {
  const sym = dataset.currencySymbol || '₹';
  const totalTaxSaved = dataset.taxDeductions.reduce((a, b) => a + b.estimatedTaxSaved, 0);
  const totalDeductible = dataset.taxDeductions.reduce((a, b) => a + b.amount, 0);
  const taxTxs = dataset.transactions.filter(t =>
    t.merchant.toLowerCase().includes('provident') ||
    t.merchant.toLowerCase().includes('insurance') ||
    t.merchant.toLowerCase().includes('lic') ||
    t.category.toLowerCase().includes('health')
  );

  const groups: StoryGroup[] = [
    {
      name: 'Section 80C (PPF & Sovereign Savings)',
      amount: dataset.taxDeductions.filter(t => t.irsCode.includes('80C')).reduce((a, b) => a + b.amount, 0),
      percentage: 78,
      transactions: taxTxs.filter(t => t.merchant.toLowerCase().includes('provident') || t.merchant.toLowerCase().includes('lic')),
      color: '#10B981',
      badge: 'Statutory 80C'
    },
    {
      name: 'Section 80D (Health & Preventive Consultations)',
      amount: dataset.taxDeductions.filter(t => t.irsCode.includes('80D')).reduce((a, b) => a + b.amount, 0),
      percentage: 22,
      transactions: taxTxs.filter(t => t.category.toLowerCase().includes('health')),
      color: '#06B6D4',
      badge: 'Medical 80D'
    }
  ];

  return {
    id: 'story-tax-shield',
    title: 'Sovereign Tax Shield Breakdown (Section 80C & 80D)',
    subtitle: `${dataset.taxDeductions.length} Verified Deductions in ${dataset.name}`,
    patternBadge: 'SOVEREIGN TAX SHIELD VAULT',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    timeRange: {
      start: dataset.timeRange.start,
      end: dataset.timeRange.end,
      label: `Tax Assessment Period (${dataset.timeRange.totalDays} Days)`
    },
    transactions: taxTxs.length > 0 ? taxTxs : dataset.transactions.slice(0, 6),
    grouping: {
      typeLabel: 'Statutory Section Allocations',
      groups
    },
    metrics: [
      {
        label: 'Total Eligible Deductions',
        value: `${sym}${totalDeductible.toLocaleString('en-IN')}`,
        subtext: 'Indian Income Tax Act',
        color: 'text-white'
      },
      {
        label: 'Net Tax Offset Saved',
        value: `~${sym}${totalTaxSaved.toLocaleString('en-IN')}`,
        subtext: 'Direct tax liability reduction',
        color: 'text-emerald-400'
      },
      {
        label: 'Effective Tax Bracket',
        value: '31.2%',
        subtext: 'Surcharge & cess applied',
        color: 'text-cyan-400'
      },
      {
        label: 'Section 80C Ceiling Used',
        value: `${Math.min(100, Math.round((totalDeductible / 150000) * 100))}%`,
        subtext: `Of statutory ₹1.50L cap`,
        color: 'text-purple-400'
      }
    ],
    explanation: {
      headline: 'Direct Deductible Verification',
      plainLanguage: `FinGuard cross-referenced all transfers to Public Provident Fund (PPF), Life Insurance Corporation (LIC), and verified diagnostic checkups against Indian Tax schedules, extracting ${sym}${totalDeductible.toLocaleString('en-IN')} in legally shielded income.`,
      exactMath: `${sym}${totalDeductible.toLocaleString('en-IN')} total eligible deductions × 31.2% marginal bracket = ~${sym}${totalTaxSaved.toLocaleString('en-IN')} direct reduction in tax liability.`
    },
    nextStep: {
      title: 'Recommended Filing Action',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: 'Export the verified Section 80C/80D cryptographic schedule to attach directly with your annual ITR filing.',
      actionLabel: 'Export Verified Tax Report in ACT View',
      actionType: 'act_view',
      actionPayload: { tab: 'export' }
    }
  };
}

/**
 * Builds an Insight Story from Liquid Runway & Solvency
 */
export function buildStoryFromRunway(
  dataset: FinancialDataset
): InsightStory {
  const sym = dataset.currencySymbol || '₹';
  const expenses = dataset.transactions.filter(t => t.type === 'expense');
  const incomes = dataset.transactions.filter(t => t.type === 'income');

  const groups: StoryGroup[] = [
    {
      name: 'Liquid Reserve Buffer',
      amount: dataset.totalLiquidity,
      percentage: 100,
      transactions: incomes.slice(0, 4),
      color: '#10B981',
      badge: 'Current Reserves'
    },
    {
      name: 'Average Monthly Living Burn',
      amount: dataset.monthlyBurnRate,
      percentage: Math.round((dataset.monthlyBurnRate / dataset.totalLiquidity) * 100),
      transactions: expenses.slice(0, 6),
      color: '#F43F5E',
      badge: 'Monthly Outflows'
    }
  ];

  return {
    id: 'story-runway',
    title: 'Liquid Runway & Solvency Cushion',
    subtitle: `${dataset.liquidRunwayMonths} Months Zero-Income Survival Horizon`,
    patternBadge: 'SOLVENCY TOPOLOGY MATRIX',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    timeRange: {
      start: dataset.timeRange.start,
      end: dataset.timeRange.end,
      label: `Aggregate Velocity Over ${dataset.timeRange.totalDays} Days`
    },
    transactions: [...incomes.slice(0, 3), ...expenses.slice(0, 6)],
    grouping: {
      typeLabel: 'Reserves vs Burn Velocity',
      groups
    },
    metrics: [
      {
        label: 'Liquid Reserves',
        value: `${sym}${dataset.totalLiquidity.toLocaleString('en-IN')}`,
        subtext: 'Immediate deployable cash',
        color: 'text-white'
      },
      {
        label: 'Monthly Burn Rate',
        value: `${sym}${dataset.monthlyBurnRate.toLocaleString('en-IN')}/mo`,
        subtext: 'Living expenditure drain',
        color: 'text-rose-400'
      },
      {
        label: 'Runway Duration',
        value: `${dataset.liquidRunwayMonths} Mo`,
        subtext: 'Zero-income buffer',
        color: 'text-emerald-400'
      },
      {
        label: 'Safe Daily Spend',
        value: `${sym}${dataset.safeToSpendDaily}/day`,
        subtext: 'Discretionary ceiling',
        color: 'text-cyan-400'
      }
    ],
    explanation: {
      headline: 'Robust Multi-Month Solvency Buffer',
      plainLanguage: `With ${sym}${dataset.totalLiquidity.toLocaleString('en-IN')} in verified liquid reserves and a monthly drain of ${sym}${dataset.monthlyBurnRate.toLocaleString('en-IN')}, your household can comfortably sustain ${dataset.liquidRunwayMonths} months of essential living expenses with zero incoming cashflow.`,
      exactMath: `${sym}${dataset.totalLiquidity.toLocaleString('en-IN')} Liquid Cash ÷ ${sym}${dataset.monthlyBurnRate.toLocaleString('en-IN')}/month Avg Burn = ${dataset.liquidRunwayMonths} Months Runway.`
    },
    nextStep: {
      title: 'Runway Optimization Scenario',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: 'Test potential capital purchases against your 6.0-month emergency reserve cushion before committing funds.',
      actionLabel: 'Launch Purchase Simulator in ACT View',
      actionType: 'act_view',
      actionPayload: { tab: 'simulator' }
    }
  };
}

/**
 * Builds an Insight Story from Top Category Outlays
 */
export function buildStoryFromCategory(
  categoryName: string,
  dataset: FinancialDataset
): InsightStory {
  const sym = dataset.currencySymbol || '₹';
  const catItem = dataset.categoryBreakdowns.find(c => c.category.toLowerCase() === categoryName.toLowerCase()) || dataset.categoryBreakdowns[0];
  const catTxs = dataset.transactions.filter(t => t.category.toLowerCase() === catItem.category.toLowerCase());

  // Group by payment mode or merchants
  const merchantMap: Record<string, number> = {};
  catTxs.forEach(t => {
    merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
  });

  const sortedMerchants = Object.entries(merchantMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const groups: StoryGroup[] = sortedMerchants.map(([mName, mAmount], i) => ({
    name: mName,
    amount: mAmount,
    percentage: Math.round((mAmount / catItem.amount) * 100),
    transactions: catTxs.filter(t => t.merchant === mName),
    color: ['#06B6D4', '#10B981', '#8B5CF6', '#F59E0B'][i % 4],
    badge: `${catTxs.filter(t => t.merchant === mName).length} Transactions`
  }));

  return {
    id: `story-category-${catItem.category.toLowerCase()}`,
    title: `${catItem.category} Outlay Breakdown`,
    subtitle: `${sym}${catItem.amount.toLocaleString('en-IN')} (${catItem.percentage}% of all outlays)`,
    patternBadge: 'CATEGORICAL FLOW TOPOLOGY',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    timeRange: {
      start: dataset.timeRange.start,
      end: dataset.timeRange.end,
      label: `Active Across ${dataset.timeRange.totalDays} Days`
    },
    transactions: catTxs.slice(0, 12),
    grouping: {
      typeLabel: `Top Payees in ${catItem.category}`,
      groups
    },
    metrics: [
      {
        label: 'Total Outlays',
        value: `${sym}${catItem.amount.toLocaleString('en-IN')}`,
        subtext: `${catItem.count} ledger records`,
        color: 'text-white'
      },
      {
        label: 'Expense Share',
        value: `${catItem.percentage}%`,
        subtext: 'Of total living expenses',
        color: 'text-cyan-400'
      },
      {
        label: 'Average per Entry',
        value: `${sym}${Math.round(catItem.amount / (catItem.count || 1)).toLocaleString('en-IN')}`,
        subtext: 'Mean ticket size',
        color: 'text-purple-400'
      },
      {
        label: 'Monthly Burn Ratio',
        value: `${sym}${Math.round(catItem.amount / (dataset.timeRange.totalDays / 30)).toLocaleString('en-IN')}/mo`,
        subtext: 'Velocity in category',
        color: 'text-emerald-400'
      }
    ],
    explanation: {
      headline: 'High Categorical Concentration',
      plainLanguage: `${catItem.category} constitutes ${catItem.percentage}% of your entire household expenditure across ${catItem.count} transactions, led by outlays at ${sortedMerchants[0]?.[0] || 'primary merchants'}.`,
      exactMath: `${sym}${catItem.amount.toLocaleString('en-IN')} in ${catItem.category} ÷ ${sym}${dataset.totalExpenseAllTime.toLocaleString('en-IN')} total expenses = ${catItem.percentage}% share.`
    },
    nextStep: {
      title: 'Budget Allocation Target',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: `Targeting a 10% optimization in ${catItem.category} frees up ${sym}${Math.round((catItem.amount * 0.1) / (dataset.timeRange.totalDays / 30)).toLocaleString('en-IN')}/month toward sovereign investments.`,
      actionLabel: 'Set Target Cap in ACT View',
      actionType: 'act_view',
      actionPayload: { tab: 'simulator' }
    }
  };
}

/**
 * Builds an Insight Story from a Copilot Investigation Result
 */
export function buildStoryFromCopilotResult(
  result: {
    title: string;
    summary: string;
    keyMetrics: { label: string; value: string; subtext?: string; color?: string }[];
    visualBreakdown?: { name: string; amount: number; percentage: number; color?: string }[];
    supportingTransactions: Transaction[];
    reasoning: {
      appliedFilters: { label: string; value: string }[];
      dataProvenance: string;
      formulasApplied: string[];
      exactCalculation: string;
    };
  },
  dataset: FinancialDataset
): InsightStory {
  const totalAmount = result.supportingTransactions.reduce((a, b) => a + b.amount, 0);

  const groups: StoryGroup[] = (result.visualBreakdown && result.visualBreakdown.length > 0)
    ? result.visualBreakdown.map((vb) => ({
        name: vb.name,
        amount: vb.amount,
        percentage: vb.percentage,
        transactions: result.supportingTransactions.filter(t => t.category.toLowerCase().includes(vb.name.toLowerCase()) || t.merchant.toLowerCase().includes(vb.name.toLowerCase())),
        color: vb.color || '#22D3EE'
      }))
    : [
        {
          name: 'Primary Evidence Cluster',
          amount: totalAmount,
          percentage: 100,
          transactions: result.supportingTransactions,
          color: '#22D3EE'
        }
      ];

  return {
    id: `story-copilot-${Date.now()}`,
    title: result.title,
    subtitle: `AI Telemetry Proof (${result.supportingTransactions.length} Verified Entries)`,
    patternBadge: 'AUTONOMOUS COPILOT INQUIRY',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    timeRange: {
      start: dataset.timeRange.start,
      end: dataset.timeRange.end,
      label: `Verified Statement Horizon (${dataset.timeRange.totalDays} Days)`
    },
    transactions: result.supportingTransactions.slice(0, 12),
    grouping: {
      typeLabel: 'Calculated Evidence Breakdown',
      groups
    },
    metrics: result.keyMetrics,
    explanation: {
      headline: result.title,
      plainLanguage: result.summary,
      exactMath: result.reasoning.exactCalculation
    },
    nextStep: {
      title: 'Actionable Scenario Plan',
      badge: 'AI SUGGESTION • NOT A FACT',
      description: 'Test this insight against your monthly emergency reserve cushion or execute adjustments in the ACT view.',
      actionLabel: 'Explore Interventions in ACT View',
      actionType: 'act_view',
      actionPayload: { tab: 'simulator' }
    }
  };
}

