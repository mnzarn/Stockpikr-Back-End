import { Router } from "express";
import { WatchlistModel } from "../models/WatchlistModel";

const watchlistRouter = Router();
export const Watchlists = new WatchlistModel();

//Get one watchlist by ID
watchlistRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const watchlist = await Watchlists.getWatchlistByID(id);
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
    const id = req.params.id;
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
watchlistRouter.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { tickers } = req.body;

    const updatedWatchlist = await Watchlists.updateWatchlist(id, tickers);

    res.status(200).json(updatedWatchlist);
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Add watchlist
watchlistRouter.post("/", async (req, res, next) => {
  try {
    const { userID, tickers } = req.body;

    const watchlistID = await Watchlists.addWatchlist(userID, tickers);

    res.status(200).json(watchlistID);
  } catch (error) {
    console.error("Error adding watchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Delete watchlist
watchlistRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedWatchlist = await Watchlists.deleteWatchlist(id);

    res.status(200).json(deletedWatchlist);
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default watchlistRouter;
