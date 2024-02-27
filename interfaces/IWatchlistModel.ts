import mongoose from "mongoose";
import { IStockQuote } from "./IStockQuote";

export interface IWatchlistModel extends mongoose.Document {
  watchlistName: string; // for simplicity, we can use watchlist name as a unique identifier
  userID: string;
  tickers: MinimalWatchlistTicker[];
}

export type MinimalWatchlistTicker = {
  symbol: string; // should be unique
  alertPrice: number;
};

export type CustomTickerData = {
  currentVsAlertPricePercentage: number;
  nearHighVsCurrentPercentage: number;
  yearHighVsCurrentPercentage: number;
  nearLowVsCurrentPercentage: number;
  yearLowVsCurrentPercentage: number;
};

export type WatchlistTicker = MinimalWatchlistTicker & IStockQuote & CustomTickerData;
