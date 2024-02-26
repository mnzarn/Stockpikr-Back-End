import { Connection, Model, Schema } from "mongoose";
import { IPurchasedStockModel, Ticker } from "../interfaces/IPurchasedStockModel";
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
    return this.model.find({ userID: userID });
  }

  public async getPurchasedStocksByTicker(symbol: string) {
    return this.model.find({ symbol: symbol });
  }

  public async getAllPurchasedStocks() {
    return this.model.find();
  }

  public async deletePurchasedStock(userID: string, symbol: string): Promise<any> {
    return this.model.deleteOne({ userID: userID, symbol: symbol });
  }

  public async deletePurchasedStocksByUserID(userID: string): Promise<any> {
    return this.model.deleteMany({ userID: userID });
  }
}

export { PurchasedStockModel };

