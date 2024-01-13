import { Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { DataAccess } from "../DataAccess";
import { IWatchlistModel } from "../interfaces/IWatchlistModel";

class WatchlistModel {
  public schema: Schema;
  public model: Model<IWatchlistModel>;

  public constructor() {
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Schema(
      {
        watchlistID: String,
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

  public async addWatchlist(userID: string, tickers: string[]) {
    const watchlistID = uuidv4();
    console.log(watchlistID);

    const newWatchlist = new this.model({
      watchlistID: watchlistID,
      userID: userID,
      tickers: tickers
    });

    await newWatchlist.save();
    return watchlistID;
  }

  public async updateWatchlist(watchlistID: string, tickers: string[]) {
    return this.model.findOneAndUpdate({ watchlistID: watchlistID }, { tickers }, { new: true });
  }

  public async getWatchlistByID(watchlistID: string) {
    return this.model.findOne({ watchlistID: watchlistID });
  }

  public async getWatchlistsByUserID(userID: string) {
    return this.model.find({ userID: userID });
  }

  public async getWatchlists() {
    return this.model.find();
  }

  public async deleteWatchlist(watchlistID: string) {
    this.model.deleteOne({ watchlistID: watchlistID });
  }
}

export { WatchlistModel };
