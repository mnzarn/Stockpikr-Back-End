export interface IStockPriceChange {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
}
