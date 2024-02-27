import mongoose from "mongoose";

interface IPurchasedStockModel extends mongoose.Document {
  userID: string,
  tickers: Ticker[]
}

interface Ticker {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: Date | null;
  priceChange?: number;
  gainOrLoss?: number;
  marketValue?: number;
}

export { IPurchasedStockModel, Ticker };

