import { Connection, Model, Schema } from "mongoose";
import { ILatestStockInfoModel } from "../interfaces/ILatestStockInfoModel";
import BaseModel from "./BaseModel";

class LatestStockInfoModel extends BaseModel {
  public model: Model<ILatestStockInfoModel>;
  private static instance: LatestStockInfoModel;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema = (): void => {
    this.schema = new Schema(
      {
        symbol: String,
        name: String,
        price: Number,
        changesPercentage: Number,
        change: Number,
        dayLow: Number,
        dayHigh: Number,
        yearHigh: Number,
        yearLow: Number,
        marketCap: Number,
        priceAvg50: Number,
        priceAvg200: Number,
        exchange: String,
        volume: Number,
        avgVolume: Number,
        open: Number,
        previousClose: Number,
        eps: Number,
        pe: Number,
        earningsAnnouncement: Date,
        sharesOutstanding: Number,
        timestamp: Number,
        storedTimestamp: Number
      },
      {
        collection: "latestStockQuotes"
      }
    );
  };

  public createModel = () => {
    if (!this.connection.models["latestStockQuotes"]) {
      this.model = this.connection.model<ILatestStockInfoModel>("latestStockQuotes", this.schema);
    } else {
      this.model = this.connection.models["latestStockQuotes"];
    }
  };

  public static getInstance(connection: Connection): LatestStockInfoModel {
    if (!LatestStockInfoModel.instance) {
      LatestStockInfoModel.instance = new LatestStockInfoModel(connection);
    }
    return LatestStockInfoModel.instance;
  }

  public async addNewTickerInfo(stockQuote: ILatestStockInfoModel) {
    const latest = await this.getLatestStockQuoteDetailed(stockQuote.symbol);
    if (latest) {
      throw `The stock quote symbol ${stockQuote.symbol} already exists in the database. Cannot add new ticker!`;
    }
    const newPurchasedStock = new this.model({
      symbol: stockQuote.symbol,
      name: stockQuote.name,
      price: stockQuote.price,
      changesPercentage: stockQuote.changesPercentage,
      change: stockQuote.change,
      dayLow: stockQuote.dayLow,
      dayHigh: stockQuote.dayHigh,
      yearHigh: stockQuote.yearHigh,
      yearLow: stockQuote.yearLow,
      marketCap: stockQuote.marketCap,
      priceAvg50: stockQuote.priceAvg50,
      priceAvg200: stockQuote.priceAvg200,
      exchange: stockQuote.exchange,
      volume: stockQuote.volume,
      avgVolume: stockQuote.avgVolume,
      open: stockQuote.open,
      previousClose: stockQuote.previousClose,
      eps: stockQuote.eps,
      pe: stockQuote.pe,
      earningsAnnouncement: stockQuote.earningsAnnouncement,
      sharesOutstanding: stockQuote.sharesOutstanding,
      timestamp: stockQuote.timestamp
    });

    return newPurchasedStock.save();
  }

  public async addBulkTickers(_stockQuotes: ILatestStockInfoModel[]) {
    const stockQuotes = await Promise.all(
      _stockQuotes.filter(async (quote) => {
        const result = await this.getLatestStockQuoteDetailed(quote.symbol);
        // ignore quotes that already exists
        if (result) return false;
        return true;
      })
    );
    return this.model.insertMany(stockQuotes);
  }

  // TODO: how to update all fields for multiple symbols at once?
  public async updateBulkTickers(stockQuotes: ILatestStockInfoModel[]) {
    await this.model.deleteMany({ symbol: { $in: stockQuotes.map((quote) => quote.symbol) } });
    await this.addBulkTickers(stockQuotes);
  }

  public async updateTickerInfo(symbol: string, stockQuote: ILatestStockInfoModel) {
    return this.model.findOneAndUpdate(
      {
        symbol: symbol
      },
      {
        stockQuote
      },
      { upsert: true }
    );
  }

  public async getLatestStockQuoteDetailed(symbol: string) {
    return this.model.findOne({ symbol }, {}, { lean: true });
  }

  public async getLatestStockQuotes(symbols: string[]) {
    return this.model.find({ symbol: { $in: symbols } }, {}, { lean: true });
  }

  public async getLatestUpdate(symbol: string) {
    return this.model.findOne(
      { symbol: symbol },
      { previousClose: 1, open: 1, changesPercentage: 1, change: 1, dayLow: 1, dayHigh: 1 },
      { lean: true }
    );
  }

  public async getLatestStockQuotesByExchange(exchange: string) {
    return this.model.find({ exchange: exchange }, {}, { lean: true });
  }

  public async getAllLatestStockQuotes(_limit?: number, _offset?: number) {
    const limit = _limit > 20 ? 20 : _limit;
    const offset = _offset ? +_offset : 0;
    return this.model.find({}, {}, { limit, lean: true }).skip(limit * offset);
  }

  public async searchStockQuotes(input: string, _limit?: number, _offset?: number) {
    const limit = _limit > 20 ? 20 : _limit;
    const offset = _offset ? +_offset : 0;
    return this.model.find({ symbol: { $regex: input } }, {}, { limit, lean: true }).skip(limit * offset);
  }

  public async deleteStockPriceInfoByTicker(symbol: string): Promise<any> {
    return this.model.deleteOne({ symbol });
  }
}

export { LatestStockInfoModel };
