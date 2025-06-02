import { Connection, Model, Schema } from "mongoose";
import { IPositionModel, MinimalPositionTicker } from "../interfaces/IPositionModel";
import BaseModel from "./BaseModel";

class PositionModel extends BaseModel {
  public model: Model<IPositionModel>;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        positionName: String,
        userID: String,
        tickers: [
          {
            _id: false,
            symbol: String,
            alertPrice: Number,
            notified: {
              type: Boolean,
              default: false
            }
          }
        ]
      },
      {
        collection: "positions",
        versionKey: false
      }
    );
  }

  public async createModel() {
    this.model = this.connection.model<IPositionModel>("positions", this.schema);
  }

  public async addPosition(userID: string, positionName: string, tickers: MinimalPositionTicker[]) {
    const newPosition = new this.model({
      positionName: positionName.trim(), // make sure there's no excessive trailing or leading space
      userID: userID,
      tickers: tickers
    });

    await newPosition.save();
    return positionName;
  }

  public async updatePosition(positionName: string, userID: string, tickers?: MinimalPositionTicker[]) {
    return this.model.findOneAndUpdate(
      { positionName, userID },
      { $set: { tickers } },
      { new: true }
    );
  }

  public async updatePositionTicker(positionName: string, userID: string, ticker: MinimalPositionTicker) {
    return this.model.findOneAndUpdate(
      { positionName, userID },
      { $set: { "tickers.$[el].alertPrice": ticker.purchasePrice, "tickers.$[el].notified": false } },
      { arrayFilters: [{ "el.symbol": ticker.symbol }], new: true }
    );
  }

  public async deleteTickersInPosition(positionName: string, userID: string, tickerSymbols: string[]) {
    return this.model.updateMany({ positionName, userID }, { $pull: { tickers: { symbol: { $in: tickerSymbols } } } });
  }

  public async getPositionsByUserID(userID: string) {
    return this.model.find({ userID }, {}, { lean: true });
  }

  public async getPosition(positionName: string, userID: string) {
    return this.model.findOne({ positionName, userID }, {}, { lean: true });
  }

  public async getPositionTickers(positionName: string, userID: string) {
    return this.model.findOne({ positionName, userID }, {}, { lean: true })?.select("tickers");
  }

  public async getPositionByPositionNameAndUserId(userID: string, positionName: string) {
    return this.model.findOne({ positionName, userID }, {}, { lean: true });
  }

  public async getPositions() {
    return this.model.find({}, {}, { lean: true });
  }

  public async deletePosition(positionName: string, userID: string): Promise<any> {
    return this.model.deleteOne({ positionName, userID });
  }
}

export { PositionModel };

