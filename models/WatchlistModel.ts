import { Connection, Model, Schema } from "mongoose";
import { IWatchlistModel, Ticker } from "../interfaces/IWatchlistModel";
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
            symbol: String,
            alertPrice: Number
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
    return this.model.findOneAndUpdate({ watchlistName, userID }, { tickers }, { new: false });
  }

  public async getWatchlistsByUserID(userID: string) {
    return this.model.find({ userID: userID });
  }

  public async getWatchlist(watchlistName: string) {
    return this.model.findOne({ watchlistName });
  }

  public async getWatchlistTickers(watchlistName: string, userID: string) {
    return this.model.findOne({ watchlistName, userID })?.select("tickers");
  }

  public async getWatchlistByWatchlistNameAndUserId(userID: string, watchlistName: string) {
    return this.model.findOne({ watchlistName, userID });
  }

  public async getWatchlists() {
    return this.model.find();
  }

  public async deleteWatchlist(watchlistName: string, userID: string): Promise<any> {
    return this.model.deleteOne({ watchlistName, userID });
  }
}

export { WatchlistModel };
