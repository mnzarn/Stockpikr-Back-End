import { Router } from "express";
import { IWatchlistModel, MinimalWatchlistTicker, WatchlistTicker } from "../interfaces/IWatchlistModel";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { WatchlistModel } from "../models/WatchlistModel";

const calcPriceDifference = (firstPrice: number, secondPrice: number): number => {
  if (secondPrice === 0) return 0;
  return firstPrice / secondPrice - 1;
};

const displayPriceDiffPercentage = (priceDiff: number): number => {
  return Number((priceDiff * 100).toFixed(4).replace(/\.?0+$/, ""));
};

export const calPriceDifferentPercentage = (firstPrice: number, secondPrice: number): number => {
  const priceDiff = calcPriceDifference(firstPrice, secondPrice);
  return displayPriceDiffPercentage(priceDiff);
};

const transformMinimalToDetailedTickers = async (
  latestStockInfo: LatestStockInfoModel,
  tickers: MinimalWatchlistTicker[]
): Promise<WatchlistTicker[]> => {
  let returnedTickers: WatchlistTicker[] = [];
  const detailedTickers = await latestStockInfo.getLatestStockQuotes(tickers.map((t) => t.symbol));
  for (const ticker of tickers) {
    const detailedTicker = detailedTickers.find((t) => t.symbol === ticker.symbol);
    returnedTickers.push({
      ...ticker,
      ...detailedTicker,
      currentVsAlertPricePercentage: calPriceDifferentPercentage(detailedTicker.price, ticker.alertPrice),
      nearHighVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.dayHigh, detailedTicker.price),
      yearHighVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.yearHigh, detailedTicker.price),
      nearLowVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.dayLow, detailedTicker.price),
      yearLowVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.yearLow, detailedTicker.price),
      earningsAnnouncement: detailedTicker.earningsAnnouncement as any
    });
  }
  return returnedTickers;
};

const watchlistRouterHandler = (Watchlists: WatchlistModel, latestStockInfo: LatestStockInfoModel) => {
  const watchlistRouter = Router();

  watchlistRouter.get("/:name", async (req, res, next) => {
    try {
      const { name } = req.params;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      if (!userID) return res.status(400).json({ error: "User ID is empty" });
      let watchlist = await Watchlists.getWatchlist(name, userID);
      if (watchlist) {
        watchlist.tickers = await transformMinimalToDetailedTickers(latestStockInfo, watchlist.tickers);
        res.status(200).json(watchlist);
      } else {
        res.status(404).json({ error: "Watchlist not found" });
      }
    } catch (error) {
      console.error("Error fetching watchlist data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Get all watchlists
  watchlistRouter.get("/", async (req, res, next) => {
    try {
      // TODO: add pagination to avoid ddos
      let watchlists = await Watchlists.getWatchlists();
      if (watchlists && watchlists.length && watchlists.length > 0) {
        for (let wl of watchlists) {
          wl.tickers = await transformMinimalToDetailedTickers(latestStockInfo, wl.tickers);
        }
        res.status(200).json(watchlists);
      } else {
        res.status(404).json({ error: "Watchlists not found" });
      }
    } catch (error) {
      console.error("Error fetching watchlist data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Get all watchlists by userID
  watchlistRouter.get("/user/:id", async (req, res, next) => {
    try {
      const id = req.session["uuid"] ? req.session["uuid"] : req.params.id;
      let watchlists = await Watchlists.getWatchlistsByUserID(id);
      if (watchlists && watchlists.length && watchlists.length > 0) {
        for (let wl of watchlists) {
          wl.tickers = await transformMinimalToDetailedTickers(latestStockInfo, wl.tickers);
        }
        res.status(200).json(watchlists);
      } else {
        res.status(404).json({ error: "Watchlists not found" });
      }
    } catch (error) {
      console.error("Error fetching watchlist data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Update watchlist information by ID
  watchlistRouter.put("/watchlist/:name", async (req, res, next) => {
    try {
      // TODO: validate wl id, user id, and body
      const watchlistName = req.params.name;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      if (!watchlistName) return res.status(400).json({ error: "Watchlist name is empty" });
      if (!userID) return res.status(400).json({ error: "User ID is empty" });

      let originalTickers = await Watchlists.getWatchlistTickers(watchlistName, userID);
      let newTickers: MinimalWatchlistTicker[] = originalTickers.tickers;
      let updatedWatchlist: IWatchlistModel;

      let ticker: MinimalWatchlistTicker = req.body;
      let stockQuote = await latestStockInfo.getLatestStockQuoteDetailed(ticker.symbol);
      if (!stockQuote) {
        res
          .status(404)
          .json({ error: `Cannot find the provided stock symbol ${ticker.symbol} to add to the watchlist` });
        return;
      }
      const tickerIndex = newTickers.findIndex((t) => t.symbol === ticker.symbol);
      // if the submitted ticker is new (not included in the watchlist -> we push it to the tickers list)
      if (tickerIndex === -1) {
        newTickers.push(ticker);
        updatedWatchlist = await Watchlists.updateWatchlist(watchlistName, userID, newTickers);
      } else updatedWatchlist = await Watchlists.updateWatchlistTicker(watchlistName, userID, ticker);
      // otherwise we
      res.status(200).json(updatedWatchlist);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Update watchlist ticker alert price by ID
  watchlistRouter.put("/:name", async (req, res, next) => {
    try {
      // TODO: validate wl id, user id, and body
      const watchlistName = req.params.name;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      if (!watchlistName) return res.status(400).json({ error: "Watchlist name is empty" });
      if (!userID) return res.status(400).json({ error: "User ID is empty" });

      let originalTickers = await Watchlists.getWatchlistTickers(watchlistName, userID);
      let updatedTickers: MinimalWatchlistTicker[] = originalTickers.tickers;

      const tickers: MinimalWatchlistTicker[] = req.body;
      for (const ticker of tickers) {
        const tickerIndex = updatedTickers.findIndex((t) => t.symbol === ticker.symbol);
        if (tickerIndex === -1) {
          res
            .status(404)
            .json({ error: `Cannot find the provided stock symbol ${ticker.symbol} in the watchlist to edit` });
          return;
        }
        updatedTickers[tickerIndex].alertPrice = ticker.alertPrice;
      }
      await Watchlists.updateWatchlist(watchlistName, userID, updatedTickers);
      res.status(200).json({});
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

    watchlistRouter.put("/:name/threshold", async (req, res, next) => {
    try {
      // TODO: validate wl id, user id, and body
      const watchlistName = req.params.name;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      if (!watchlistName) return res.status(400).json({ error: "Watchlist name is empty" });
      if (!userID) return res.status(400).json({ error: "User ID is empty" });

      let originalTickers = await Watchlists.getWatchlistTickers(watchlistName, userID);
      let updatedTickers: MinimalWatchlistTicker[] = originalTickers.tickers;

      const ticker: MinimalWatchlistTicker = req.body;
      const tickerIndex = updatedTickers.findIndex((t) => t.symbol === ticker.symbol);
      if (tickerIndex === -1) {
        res
          .status(404)
          .json({ error: `Cannot find the provided stock symbol ${ticker.symbol} in the watchlist to edit` });
        return;
      }
      updatedTickers[tickerIndex].threshold = ticker.threshold;

      await Watchlists.updateWatchlist(watchlistName, userID, updatedTickers);
      res.status(200).json({});
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Delete tickers of a watchlist
  watchlistRouter.patch("/tickers/:name", async (req, res, next) => {
    try {
      // TODO: validate wl id, user id, and body
      const watchlistName = req.params.name;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      const result = await Watchlists.deleteTickersInWatchlist(watchlistName, userID, req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Add watchlist
  watchlistRouter.post("/", async (req, res, next) => {
    try {
      const { tickers, watchlistName } = req.body;
      const userID = req.session["uuid"] ? req.session["uuid"] : req.body.userID;
      if (!watchlistName) return res.status(400).json({ error: "Watchlist name is empty" });
      if (!userID) return res.status(400).json({ error: "User ID is empty" });
      const watchlist = await Watchlists.getWatchlistByWatchlistNameAndUserId(userID, watchlistName);
      if (watchlist) {
        return res.status(403).json({ error: "Watchlist with the given name and id already exists. Cannot add new." });
      }

      const watchlistID = await Watchlists.addWatchlist(userID, watchlistName, tickers);

      res.status(200).json(watchlistID);
    } catch (error) {
      console.error("Error adding watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Delete watchlist
  watchlistRouter.delete("/:name", async (req, res, next) => {
    try {
      const { name: watchlistName } = req.params;
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);

      const deletedWatchlist = await Watchlists.deleteWatchlist(watchlistName, userID);

      res.status(200).json(deletedWatchlist);
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return watchlistRouter;
};

export default watchlistRouterHandler;
