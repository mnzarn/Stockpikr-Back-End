import { Connection, Model, Schema } from "mongoose";
import { IPurchasedStockModel } from "../interfaces/IPurchasedStockModel";
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
        watchlistID: String,
        userID: String,
        ticker: String,
        purchaseDate: Date,
        purchasePrice: Number,
        volume: Number,
        nearLow: Number,
        nearHigh: Number
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

  public async addPurchasedStock(
    watchlistID: string,
    userID: string,
    ticker: string,
    nearLow: number,
    nearHigh: number,
    purchaseDate: Date = null,
    purchasePrice: number = null,
    volume: number = null
  ) {
    const newPurchasedStock = new this.model({
      watchlistID: watchlistID,
      userID: userID,
      ticker: ticker,
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice,
      volume: volume,
      nearLow: nearLow,
      nearHigh: nearHigh
    });

    return newPurchasedStock.save();
  }

  public async updatePurchasedStock(
    watchlistID: string,
    userID: string,
    ticker: string,
    nearLow: number,
    nearHigh: number,
    purchaseDate: Date = null,
    purchasePrice: number = null,
    volume: number = null
  ) {
    return this.model.findOneAndUpdate({
      watchlistID: watchlistID,
      userID: userID,
      ticker: ticker,
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice,
      volume: volume,
      nearLow: nearLow,
      nearHigh: nearHigh
    });
  }

  public async getPurchasedStock(watchlistID: string, userID: string, ticker: string) {
    return this.model.findOne({ watchlistID: watchlistID, userID: userID, ticker: ticker });
  }

  public async getPurchasedStocksByUserID(userID: string) {
    return this.model.find({ userID: userID });
  }

  public async getPurchasedStocksByWatchlistID(watchlistID: string) {
    return this.model.find({ watchlistID: watchlistID });
  }

  public async getPurchasedStocksByTicker(ticker: string) {
    return this.model.find({ ticker: ticker });
  }

  public async getAllPurchasedStocks() {
    return this.model.find();
  }

  public async deletePurchasedStock(watchlistID: string, userID: string, ticker: string): Promise<any> {
    return this.model.deleteOne({ watchlistID: watchlistID, userID: userID, ticker: ticker });
  }

  public async deletePurchasedStocksByWatchlistID(watchlistID: string): Promise<any> {
    return this.model.deleteMany({ watchlistID: watchlistID });
  }

  public async deletePurchasedStocksByUserID(userID: string): Promise<any> {
    return this.model.deleteMany({ userID: userID });
  }
}

export { PurchasedStockModel };
