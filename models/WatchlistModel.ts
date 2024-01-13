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
    try {
      const updatedWatchlist = await this.model.findOneAndUpdate(
        { watchlistID: watchlistID },
        { tickers },
        { new: true }
      );

      return updatedWatchlist;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async getWatchlistByID(watchlistID: string) {
    try {
      const watchlist = await this.model.findOne({ watchlistID: watchlistID });
      return watchlist;
    } catch (error) {
      console.log(error);
    }
  }

  public async getWatchlistsByUserID(userID: string) {
    try {
      const watchlists = await this.model.find({ userID: userID });
      return watchlists;
    } catch (error) {
      console.log(error);
    }
  }

  public async getWatchlists() {
    try {
      const watchlists = await this.model.find();
      return watchlists;
    } catch (error) {
      console.log(error);
    }
  }

  public async deleteWatchlist(watchlistID: string) {
    try {
      await this.model.deleteOne({ watchlistID: watchlistID });
    } catch (error) {
      console.log(error);
    }
  }
}

export { WatchlistModel };
