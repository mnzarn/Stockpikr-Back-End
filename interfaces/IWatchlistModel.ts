import mongoose from "mongoose";

interface IWatchlistModel extends mongoose.Document {
    watchlistID: string,
    userID: string,
    tickers: string[],
}

export { IWatchlistModel }