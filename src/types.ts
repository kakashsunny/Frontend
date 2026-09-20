export type ActView = 'see' | 'understand' | 'ask' | 'act';

export type DNAFilterLayer = 'all' | 'spending' | 'income' | 'patterns' | 'risk' | 'habits';

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'cleared' | 'pending' | 'anomaly';
export type AnomalySeverity = 'high' | 'medium' | 'low';

export interface Transaction {
  id: string;
  date: string;
  rawDate?: string;
  merchant: string;
  subcategory?: string;
  amount: number;
  category: string;
  type: TransactionType;
  status: TransactionStatus;
  anomalyConfidence?: number;
  anomalyReason?: string;
  anomalySeverity?: AnomalySeverity;
  isSubscription?: boolean;
  recurringFrequency?: 'monthly' | 'annual' | 'weekly';
  tags: string[];
  note?: string;
  mode?: string;
  account: string;
  currency: string;
  // Spatial coordinates for DNA visualization
  dnaCoords?: {
    orbitRadius: number;
    angle: number;
    height: number;
    speed: number;
    color: string;
  };
}

export interface DNANode {
  id: string;
  label: string;
  category: 'spending' | 'income' | 'risk' | 'habit' | 'pattern';
  amount: number;
  date: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  pulseRate: number;
  details: string;
  merchant?: string;
  anomalyReason?: string;
}

export interface AnomalyAlert {
  id: string;
  title: string;
  merchant: string;
  amount: number;
  date: string;
  severity: AnomalySeverity;
  confidence: number;
  rationale: string;
  status: 'detected' | 'disputed' | 'resolved' | 'acknowledged';
  suggestedAction: string;
  category: string;
  priorAverageAmount?: number;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  category: string;
  priceCreep?: {
    previousAmount: number;
    increasePercent: number;
    detectedDate: string;
  };
  usageStatus: 'frequent' | 'moderate' | 'idle' | 'unopened';
  suggestedAction?: string;
}

export interface TaxDeductionItem {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  irsCode: string;
  description: string;
  category: string;
  estimatedTaxSaved: number;
}

export interface MonthlyCashflow {
  monthYear: string;
  income: number;
  expense: number;
  netSavings: number;
  transfers: number;
}

export interface CalculationExplanation {
  metric: string;
  formula: string;
  description: string;
  datasetInputValues: string;
  exactMath: string;
}

export interface FinancialDataset {
  id: string;
  name: string;
  dataSourceName: string;
  currency: string;
  currencySymbol: string;
  personaTitle: string;
  tagline: string;
  totalLiquidity: number;
  totalIncomeAllTime: number;
  totalExpenseAllTime: number;
  totalTransfersAllTime: number;
  monthlyIncome: number;
  monthlyBurnRate: number;
  safeToSpendDaily: number;
  liquidRunwayMonths: number;
  entropyScore: number; // 0-100 (degree of financial chaos/variance)
  resilienceScore: number; // 0-100 (financial health index)
  discretionaryBudget: number;
  discretionaryRemaining: number;
  savingsRate: number;
  timeRange: {
    start: string;
    end: string;
    totalDays: number;
  };
  transactions: Transaction[];
  anomalies: AnomalyAlert[];
  subscriptions: SubscriptionItem[];
  taxDeductions: TaxDeductionItem[];
  monthlyCashflows: MonthlyCashflow[];
  calculationExplanations: CalculationExplanation[];
  topMerchants: {
    name: string;
    amount: number;
    percentage: number;
    category: string;
    count: number;
  }[];
  categoryBreakdowns: {
    category: string;
    amount: number;
    budget: number;
    percentage: number;
    trend: number;
    color: string;
    count: number;
  }[];
  paymentModeBreakdown: {
    mode: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  dataPayload?: any;
}
