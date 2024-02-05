export interface IStockDetails {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  balance: number;
  price: number;
  changesPercentage: number;
  thirtyDayChange: number;
  oneYearChange: number;
  todayChangePercent: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  open: number;
  previousClose: number;
}
