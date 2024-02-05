import { Router } from "express";
import { PurchasedStockModel } from "../models/PurchasedStockModel";

const purchasedStocksRouterHandler = (PurchasedStocks: PurchasedStockModel) => {
  const purchasedStocksRouter = Router();

  purchasedStocksRouter.post("/", async (req, res, next) => {
    try {
      const watchlistID = req.body.watchlistID;
      const userID = req.session["uuid"] ? req.session["uuid"] : req.body.userID;
      const ticker = req.body.ticker;
      const nearLow = req.body.nearLow;
      const nearHigh = req.body.nearHigh;
      const purchaseDate = req.body.purchaseDate;
      const purchasePrice = req.body.purchasePrice;
      const volume = req.body.volume;
      const purchasedStock = await PurchasedStocks.addPurchasedStock(
        watchlistID,
        userID,
        ticker,
        nearLow,
        nearHigh,
        purchaseDate,
        purchasePrice,
        volume
      );
      if (purchasedStock) {
        res.json(purchasedStock);
      } else {
        res.status(404).json({ error: "Purchased Stock not found" });
      }
    } catch (error) {
      console.error("Error adding purchased stock:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/user/:id", async (req, res, next) => {
    try {
      const id = req.session["uuid"] ? req.session["uuid"] : req.params.id;
      const purchasedStocks = await PurchasedStocks.getPurchasedStocksByUserID(id);
      if (purchasedStocks) {
        res.json(purchasedStocks);
      } else {
        res.status(404).json({ error: "Purchased Stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching purchased stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/watchlist/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const purchasedStocks = await PurchasedStocks.getPurchasedStocksByWatchlistID(id);
      if (purchasedStocks) {
        res.json(purchasedStocks);
      } else {
        res.status(404).json({ error: "Purchased Stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching purchased stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/", async (req, res, next) => {
    try {
      const purchasedStocks = await PurchasedStocks.getAllPurchasedStocks();
      if (purchasedStocks) {
        res.json(purchasedStocks);
      } else {
        res.status(404).json({ error: "Purchased Stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching purchased stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/ticker/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const purchasedStocks = await PurchasedStocks.getPurchasedStocksByTicker(id);
      if (purchasedStocks) {
        res.json(purchasedStocks);
      } else {
        res.status(404).json({ error: "Purchased Stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching purchased stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/watchlist/:watchlistID/ticker/:tickerID", async (req, res, next) => {
    try {
      const { watchlistID, tickerID } = req.params;
      const userID = req.session["uuid"];
      const purchasedStocks = await PurchasedStocks.getPurchasedStock(watchlistID, userID, tickerID);
      if (purchasedStocks) {
        res.json(purchasedStocks);
      } else {
        res.status(404).json({ error: "Purchased Stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching purchased stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  return purchasedStocksRouter;
};

export default purchasedStocksRouterHandler;
