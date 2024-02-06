import mongoose from "mongoose";

interface IWatchlistModel extends mongoose.Document {
  watchlistName: string; // for simplicity, we can use watchlist name as a unique identifier
  userID: string;
  tickers: Ticker[];
}

interface Ticker {
  symbol: string; // should be unique
  alertPrice: number;
}

export { IWatchlistModel, Ticker };
