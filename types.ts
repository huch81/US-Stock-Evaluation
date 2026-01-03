
export interface IndexData {
  name: string;
  value: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
  trend: number[]; // 10-15 points representing the day's movement
}

export interface SectorData {
  name: string;
  percentChange: number;
  topGainers: Array<{
    symbol: string;
    change: string;
  }>;
  topLosers: Array<{
    symbol: string;
    change: string;
  }>;
}

export interface MarketState {
  indices: IndexData[];
  vix: {
    value: string;
    change: string;
    percentChange: string;
  };
  fearGreed: {
    value: number;
    label: string;
  };
  putCallRatio: {
    value: number;
    label: string;
  };
  sectors: SectorData[];
  lastUpdated: string;
  sources: Array<{ title: string; uri: string }>;
}
