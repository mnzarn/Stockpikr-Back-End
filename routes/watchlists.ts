import { Router } from "express";
import { WatchlistModel } from "../models/WatchlistModel";

const watchlistRouterHandler = (Watchlists: WatchlistModel) => {
  const watchlistRouter = Router();

  watchlistRouter.get("/:name", async (req, res, next) => {
    try {
      const { name } = req.params;
      const watchlist = await Watchlists.getWatchlist(name);
      if (watchlist) {
        res.json(watchlist);
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
      const watchlists = await Watchlists.getWatchlists();
      if (watchlists.length > 0) {
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
      console.log("Here is the id: ", id);
      const watchlists = await Watchlists.getWatchlistsByUserID(id);
      if (watchlists) {
        res.json(watchlists);
      } else {
        res.status(404).json({ error: "Watchlists not found" });
      }
    } catch (error) {
      console.error("Error fetching watchlist data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Update watchlist information by ID
  watchlistRouter.put("/:name", async (req, res, next) => {
    try {
      // TODO: validate wl id, user id, and body
      const { name: watchlistName } = req.params;
      const userID = req.query.userId as string;
      const { tickers } = req.body;

      const updatedWatchlist = await Watchlists.updateWatchlist(watchlistName, userID, { tickers });

      res.status(200).json(updatedWatchlist);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Add watchlist
  watchlistRouter.post("/", async (req, res, next) => {
    try {
      const { userID, tickers, watchlistName } = req.body;
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

      const deletedWatchlist = await Watchlists.deleteWatchlist(watchlistName);

      res.status(200).json(deletedWatchlist);
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return watchlistRouter;
};

export default watchlistRouterHandler;
