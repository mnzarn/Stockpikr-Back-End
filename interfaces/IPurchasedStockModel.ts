import mongoose from "mongoose";

interface IPurchasedStockModel extends mongoose.Document {
  watchlistID: string;
  userID: string;
  ticker: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  volume?: number;
  nearLow: number;
  nearHigh: number;
}

export { IPurchasedStockModel };
