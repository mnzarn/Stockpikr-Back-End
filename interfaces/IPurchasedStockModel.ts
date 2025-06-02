import mongoose from "mongoose";

interface IPurchasedStockModel extends mongoose.Document {
  userID: string,
  purchasedstocksName: String,
  tickers: Ticker[]
}

interface Ticker {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: Date | null;
  price: number;
  priceChange: number;
  gainOrLoss: number;
  marketValue: number;
  targetSellPrice: number;
}

export { IPurchasedStockModel, Ticker };

