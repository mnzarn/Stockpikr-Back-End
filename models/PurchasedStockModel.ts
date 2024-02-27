import { Connection, Model, Schema } from "mongoose";
import { IPurchasedStockModel, Ticker } from "../interfaces/IPurchasedStockModel";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";

import { IStockQuote } from "../interfaces/IStockQuote";

import BaseModel from "./BaseModel";

class PurchasedStockModel extends BaseModel {
  public model: Model<IPurchasedStockModel>;
  private static instance: PurchasedStockModel;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema = (): void => {
    this.schema = new Schema(
      {
        userID: String,
        tickers: [
          {
            _id: false,
            symbol: String,
            quantity: Number,
            purchaseDate: Date,
            purchasePrice: Number,
          }
        ]
      },
      {
        collection: "purchasedStocks"
      }
    );
  };

  public createModel = () => {
    if (!this.connection.models["purchasedStocks"]) {
      this.model = this.connection.model<IPurchasedStockModel>("purchasedStocks", this.schema);
    } else {
      this.model = this.connection.models["purchasedStocks"];
    }
  };

  public static getInstance(connection: Connection): PurchasedStockModel {
    if (!PurchasedStockModel.instance) {
      PurchasedStockModel.instance = new PurchasedStockModel(connection);
    }
    return PurchasedStockModel.instance;
  }

  public async addPurchasedStock(userID: string, tickers: Ticker[]) {
    const existingDocument = await this.model.findOne({ userID });

    if (existingDocument) {
        existingDocument.tickers.push(...tickers);
        console.log("Existing user found, updating tickers:", existingDocument);

        return existingDocument.save();
    } else {
        const newPurchasedStock = new this.model({
            userID: userID,
            tickers: tickers
        });
        console.log("New user created:", newPurchasedStock);

        return newPurchasedStock.save();
    }
}

  public async updatePurchasedStock(userID: string, tickers?: Ticker[]) {
    return this.model.findOneAndUpdate({ userID }, { tickers }, { new: false });
  }
  
  public async getPurchasedStock(watchlistID: string, userID: string, symbol: string) {
    return this.model.findOne({ watchlistID: watchlistID, userID: userID, symbol: symbol });
  }

  public async getPurchasedStocksByUserID(userID: string) {
    const purchasedStocks = await this.model.find({ userID: userID });

    // const tickerSymbols = purchasedStocks.flatMap(stock => stock.tickers.map(ticker => ticker.symbol));
    // const stockQuotes = await this.fetchStockQuotes(tickerSymbols);

    // purchasedStocks.forEach(stock => {
    //     stock.tickers.forEach(ticker => {
    //         const stockQuote = stockQuotes.find(quote => quote.symbol === ticker.symbol);
    //         if (stockQuote) {
    //             ticker.priceChange = this.calculatePriceChange(ticker, stockQuote);
    //             ticker.gainOrLoss = this.calculateGainOrLoss(ticker, stockQuote);
    //             ticker.marketValue = this.calculateMarketValue(ticker, stockQuote);
    //         }
    //     });
    // });

    return purchasedStocks;
}

  public async deleteTickersInPurchasedStock(userID: string, tickerSymbols: string[]) {
    return this.model.updateMany({ userID }, { $pull: { tickers: { symbol: { $in: tickerSymbols } } } });
  }

  // private calculatePriceChange(ticker: Ticker, stockQuote: IStockQuote): number {
  //   return stockQuote.price - ticker.purchasePrice;
  // }

  // private calculateMarketValue(ticker: Ticker, stockQuote: IStockQuote): number {
  //   return stockQuote.price * ticker.quantity;
  // }

  // private calculateGainOrLoss(ticker: Ticker, stockQuote: IStockQuote): number {
  //   return (stockQuote.price - ticker.purchasePrice) * ticker.quantity;
  // }

  // private async fetchStockQuotes(tickerSymbols: string[]): Promise<IStockQuote[]> {
  //   const latestStockInfoModel = LatestStockInfoModel.getInstance(this.connection);
  //   const stockQuotes = await latestStockInfoModel.getLatestStockQuotes(tickerSymbols);
  //   return stockQuotes.map(quote => ({
  //       symbol: quote.symbol,
  //       name: quote.name,
  //       price: quote.price,
  //       changesPercentage: quote.changesPercentage,
  //       change: quote.change,
  //       dayLow: quote.dayLow,
  //       dayHigh: quote.dayHigh,
  //       yearHigh: quote.yearHigh,
  //       yearLow: quote.yearLow,
  //       marketCap: quote.marketCap,
  //       priceAvg50: quote.priceAvg50,
  //       priceAvg200: quote.priceAvg200,
  //       exchange: quote.exchange,
  //       volume: quote.volume,
  //       avgVolume: quote.avgVolume,
  //       open: quote.open,
  //       previousClose: quote.previousClose,
  //       eps: quote.eps,
  //       pe: quote.pe,
  //       earningsAnnouncement: quote.earningsAnnouncement.toString(),
  //       sharesOutstanding: quote.sharesOutstanding
  //   }));
  // }


}

export { PurchasedStockModel };

