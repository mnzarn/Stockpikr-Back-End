import { Connection, Model, Schema } from "mongoose";
import IStockData from "../interfaces/IStockData";
import BaseModel from "./BaseModel";

class StockDataModel extends BaseModel {
  public model: Model<IStockData>;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        symbol: String,
        name: String,
        currency: String,
        stockExchange: String,
        exchangeShortName: String
      },
      {
        collection: "stock-data",
        versionKey: false
      }
    );
  }

  public async createModel() {
    this.model = this.connection.model<IStockData>("stock-data", this.schema);
  }

  public async addStockData(stockData: IStockData) {
    const newStock = new this.model(stockData);

    await newStock.save();
    return stockData.symbol;
  }

  public async updateStockData(stockData: {
    symbol: string;
    name?: string;
    currency?: string;
    stockExchange?: string;
    exchangeShortName?: string;
  }) {
    const { symbol, name, currency, stockExchange, exchangeShortName } = stockData;
    try {
      const updatedStockData = await this.model.findOneAndUpdate(
        { symbol },
        { name, currency, stockExchange, exchangeShortName },
        { new: true }
      );

      return updatedStockData;
    } catch (error) {
      console.error("Error updating stock data:", error);
      return null;
    }
  }

  public async getStockDataBySymbol(symbol: string) {
    try {
      const user = await this.model.findOne({ symbol });
      return user;
    } catch (error) {
      console.error("Error fetching stock data by symbol:", error);
      return null;
    }
  }

  public async getStocks() {
    try {
      // TODO: add pagination
      console.log("model: ", this.model);
      const users = await this.model.find();
      return users || [];
    } catch (err) {
      throw err;
    }
  }
}

export { StockDataModel };
