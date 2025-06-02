import mongoose from "mongoose";
import { IStockQuote } from "./IStockQuote";

export interface IPositionModel extends mongoose.Document {
  positionName: string; // unique identifier for a position set
  userID: string;
  tickers: MinimalPositionTicker[];
}

export type MinimalPositionTicker = {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: Date | null;
};

export type CustomPositionData = {
  gainOrLoss: number;
  marketValue: number;
  priceChange: number;
};

export type PositionTicker = MinimalPositionTicker & IStockQuote & CustomPositionData;
