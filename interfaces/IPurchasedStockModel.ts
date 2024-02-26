import mongoose from "mongoose";

interface IPurchasedStockModel extends mongoose.Document {
  userID: string,
  tickers: Ticker[]
}

interface Ticker {
  symbol: string,
  purchaseDate: Date,
  quantity: number,
  purchasePrice: number,
}

export { IPurchasedStockModel, Ticker };
