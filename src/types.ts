export type OddsFormat = 'american' | 'decimal' | 'fractional';
export type BetType = 'moneyline' | 'spread' | 'over/under' | 'parlay' | 'prop' | 'other';
export type BetStatus = 'pending' | 'won' | 'lost';

export interface Bet {
  id: string;
  sport: string;
  league: string;
  event: string;
  betType: BetType;
  stake: number;
  odds: {
    value: number;
    format: OddsFormat;
  };
  sportsbook: string;
  placedAt: string;
  status: BetStatus;
  profit: number;
  description: string;
}

export interface BetStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStaked: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  averageOdds: number;
  sportBreakdown: Record<string, number>;
  betTypeBreakdown: Record<BetType, number>;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface BetFilters {
  dateRange: DateRange;
  sport: string;
  betType: BetType | '';
  sportsbook: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}