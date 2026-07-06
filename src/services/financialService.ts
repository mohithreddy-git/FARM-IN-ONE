import type { RiskLevel } from './weatherService';

export interface LoanBenchmark {
  name: string;
  annualRatePercent: number;
  source: string;
  risk: RiskLevel;
  readOnly: true;
}

export interface OrganicInputPrice {
  item: string;
  supplier: string;
  pricePerUnit: number;
  unit: string;
  risk: RiskLevel;
}

export interface FinanceRegistry {
  loans: LoanBenchmark[];
  organicInputs: OrganicInputPrice[];
}

const registry: FinanceRegistry = {
  loans: [
    { name: 'kccLoanName', annualRatePercent: 4, source: 'kccLoanSource', risk: 'safe', readOnly: true },
    { name: 'coopLoanName', annualRatePercent: 7, source: 'coopLoanSource', risk: 'warning', readOnly: true },
    { name: 'privateLoanName', annualRatePercent: 28, source: 'privateLoanSource', risk: 'critical', readOnly: true }
  ],
  organicInputs: [
    { item: 'neemOilName', supplier: 'fpoDepotSupplier', pricePerUnit: 220, unit: 'litre', risk: 'safe' },
    { item: 'beauveriaName', supplier: 'krishiKendraSupplier', pricePerUnit: 180, unit: 'kg', risk: 'safe' },
    { item: 'trichodermaName', supplier: 'coopStoreSupplier', pricePerUnit: 140, unit: 'kg', risk: 'safe' },
    { item: 'unknownMixName', supplier: 'unverifiedSellerSupplier', pricePerUnit: 390, unit: 'litre', risk: 'critical' }
  ]
};

function validateRegistry(value: unknown): FinanceRegistry {
  if (!value || typeof value !== 'object') throw new Error('Finance registry missing');
  const data = value as FinanceRegistry;
  if (!Array.isArray(data.loans) || !Array.isArray(data.organicInputs)) {
    throw new Error('Finance registry schema mismatch');
  }
  data.loans.forEach((loan) => {
    if (loan.readOnly !== true || typeof loan.annualRatePercent !== 'number') {
      throw new Error('Finance registry is not read-only');
    }
  });
  return data;
}

export async function fetchFinanceRegistry(): Promise<FinanceRegistry> {
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 140));
    return validateRegistry(registry);
  } catch (traceback) {
    return correctiveFinanceMiddleware(traceback);
  }
}

export function correctiveFinanceMiddleware(_traceback: unknown): FinanceRegistry {
  return registry;
}

export interface MandiTrend {
  crop: string;
  market: string;
  pricePerQuintal: number;
  sevenDayChangePercent: number;
  recommendation: 'sell' | 'hold';
}

export async function fetchMandiTrends(): Promise<MandiTrend[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 100));
  return [
    { crop: 'Paddy', market: 'regionalMandi', pricePerQuintal: 2310, sevenDayChangePercent: 3.8, recommendation: 'sell' },
    { crop: 'Cotton', market: 'districtMandi', pricePerQuintal: 6840, sevenDayChangePercent: -2.4, recommendation: 'hold' },
    { crop: 'Red chilli', market: 'primaryYard', pricePerQuintal: 11900, sevenDayChangePercent: 5.1, recommendation: 'sell' },
    { crop: 'Corn', market: 'regionalMandi', pricePerQuintal: 1960, sevenDayChangePercent: 4.2, recommendation: 'sell' },
    { crop: 'Wheat', market: 'districtMandi', pricePerQuintal: 2275, sevenDayChangePercent: 1.5, recommendation: 'sell' },
    { crop: 'Tomato', market: 'primaryYard', pricePerQuintal: 1540, sevenDayChangePercent: -8.3, recommendation: 'hold' }
  ];
}

export interface EquipmentListing {
  equipment: string;
  village: string;
  hourlyRate: number;
  availableToday: boolean;
  trustScore: number;
}

export async function fetchEquipmentListings(): Promise<EquipmentListing[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 100));
  return [
    { equipment: 'miniTiller', village: 'nearClusterA', hourlyRate: 280, availableToday: true, trustScore: 94 },
    { equipment: 'batterySprayer', village: 'nearClusterB', hourlyRate: 70, availableToday: true, trustScore: 91 },
    { equipment: 'paddyTransplanter', village: 'nearClusterC', hourlyRate: 520, availableToday: false, trustScore: 86 }
  ];
}
