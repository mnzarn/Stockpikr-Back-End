import { Connection, Model, Schema } from "mongoose";
import { IWatchlistModel, MinimalWatchlistTicker } from "../interfaces/IWatchlistModel";
import BaseModel from "./BaseModel";

class WatchlistModel extends BaseModel {
  public model: Model<IWatchlistModel>;

  public constructor(connection: Connection) {
    super(connection);
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        watchlistName: String,
        userID: String,
        tickers: [
          {
            _id: false,
            symbol: String,
            alertPrice: Number,
            threshold: Number
          }
        ]
      },
      {
        collection: "watchlists",
        versionKey: false
      }
    );
  }

  public async createModel() {
    this.model = this.connection.model<IWatchlistModel>("watchlists", this.schema);
  }

  public async addWatchlist(userID: string, watchlistName: string, tickers: MinimalWatchlistTicker[]) {
    const newWatchlist = new this.model({
      watchlistName: watchlistName.trim(), // make sure there's no excessive trailing or leading space
      userID: userID,
      tickers: tickers
    });

    await newWatchlist.save();
    return watchlistName;
  }

  public async updateWatchlist(watchlistName: string, userID: string, tickers?: MinimalWatchlistTicker[]) {
    return this.model.findOneAndUpdate({ watchlistName, userID }, { tickers }, { new: true, lean: true });
  }

  public async updateWatchlistTicker(watchlistName: string, userID: string, ticker: MinimalWatchlistTicker) {
    return this.model.findOneAndUpdate(
      { watchlistName, userID },
      { $set: { "tickers.$[el].alertPrice": ticker.alertPrice } },
      { arrayFilters: [{ "el.symbol": ticker.symbol }], new: true, lean: true }
    );
  }

  public async updateWatchlistTickerThreshold(watchlistName: string, userID: string, ticker: MinimalWatchlistTicker) {
    return this.model.findOneAndUpdate(
      { watchlistName, userID },
      { $set: { "tickers.$[el].threshold": ticker.threshold } },
      { arrayFilters: [{ "el.symbol": ticker.symbol }], new: true, lean: true }
    );
  }

  public async deleteTickersInWatchlist(watchlistName: string, userID: string, tickerSymbols: string[]) {
    return this.model.updateMany({ watchlistName, userID }, { $pull: { tickers: { symbol: { $in: tickerSymbols } } } });
  }

  public async getWatchlistsByUserID(userID: string) {
    return this.model.find({ userID }, {}, { lean: true });
  }

  public async getWatchlist(watchlistName: string, userID: string) {
    return this.model.findOne({ watchlistName, userID }, {}, { lean: true });
  }

  public async getWatchlistTickers(watchlistName: string, userID: string) {
    return this.model.findOne({ watchlistName, userID }, {}, { lean: true })?.select("tickers");
  }

  public async getWatchlistByWatchlistNameAndUserId(userID: string, watchlistName: string) {
    return this.model.findOne({ watchlistName, userID }, {}, { lean: true });
  }

  public async getWatchlists() {
    return this.model.find({}, {}, { lean: true });
  }

  public async deleteWatchlist(watchlistName: string, userID: string): Promise<any> {
    return this.model.deleteOne({ watchlistName, userID });
  }
}

export { WatchlistModel };

