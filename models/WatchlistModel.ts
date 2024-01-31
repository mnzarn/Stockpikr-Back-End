import { Model, Schema } from "mongoose";
import { DataAccess } from "../DataAccess";
import { IWatchlistModel, Ticker } from "../interfaces/IWatchlistModel";

class WatchlistModel {
  public schema: Schema;
  public model: Model<IWatchlistModel>;

  public constructor() {
    DataAccess.mongooseInstance.then(() => {
      this.createSchema();
      this.createModel();
    });
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        watchlistName: String,
        userID: String,
        tickers: [String]
      },
      {
        collection: "watchlists",
        versionKey: false
      }
    );
  }

  public async createModel() {
    await DataAccess.connect();
    this.model = DataAccess.mongooseConnection.model<IWatchlistModel>("watchlists", this.schema);
  }

  public async addWatchlist(userID: string, watchlistName: string, tickers: Ticker[]) {
    const newWatchlist = new this.model({
      watchlistName: watchlistName.trim(), // make sure there's no excessive trailing or leading space
      userID: userID,
      tickers: tickers
    });

    await newWatchlist.save();
    return watchlistName;
  }

  public async updateWatchlist(watchlistName: string, userID: string, watchlist: { tickers?: Ticker[] }) {
    const { tickers } = watchlist;
    return this.model.findOneAndUpdate({ watchlistName, userID }, { tickers }, { new: true });
  }

  public async getWatchlistsByUserID(userID: string) {
    return this.model.find({ userID: userID });
  }

  public async getWatchlist(watchlistName: string) {
    return this.model.find({ watchlistName });
  }

  public async getWatchlistByWatchlistNameAndUserId(userID: string, watchlistName: string) {
    return this.model.findOne({ watchlistName, userID });
  }

  public async getWatchlists() {
    return this.model.find();
  }

  public async deleteWatchlist(watchlistName: string) {
    return this.model.deleteOne({ watchlistName });
  }
}

export { WatchlistModel };
