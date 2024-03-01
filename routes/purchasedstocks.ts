import { Router } from "express";
import { PurchasedStockModel } from "../models/PurchasedStockModel";

const purchasedStocksRouterHandler = (PurchasedStocks: PurchasedStockModel) => {
  const purchasedStocksRouter = Router();

  purchasedStocksRouter.post("/", async (req, res, next) => {
    console.log('Received request to add purchased stocks');
    const { symbol, quantity, purchaseDate, purchasePrice } = req.body;

    const tickers = [{
      symbol,
      quantity,
      purchaseDate: purchaseDate === 'null' ? null : new Date(purchaseDate),
      purchasePrice,
    }];
    
   
    const userID = req.session["uuid"] ? req.session["uuid"] : req.body.userID;
    try {
        await PurchasedStocks.addPurchasedStock(userID, tickers);

        console.log('Purchased stocks added successfully');

        res.status(200).json({ message: "Purchased stocks added successfully" });
    } catch (error) {
        console.error("Error adding purchased stocks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.get("/", async (req, res, next) => {
    try {
      const id = req.session["uuid"] ? req.session["uuid"] : req.body.userID;
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

  purchasedStocksRouter.patch("/", async (req, res, next) => {
    try {
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.body.userID as string);
      console.log(req.body)
      const result = await PurchasedStocks.deleteTickersInPurchasedStock(userID, req.body);
      console.log(result)
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // purchasedStocksRouter.get("/", async (req, res, next) => {
  //   try {
  //     const purchasedStocks = await PurchasedStocks.getAllPurchasedStocks();
  //     if (purchasedStocks) {
  //       res.json(purchasedStocks);
  //     } else {
  //       res.status(404).json({ error: "Purchased Stocks not found" });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching purchased stock data:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // purchasedStocksRouter.get("/ticker/:id", async (req, res, next) => {
  //   try {
  //     const id = req.params.id;
  //     const purchasedStocks = await PurchasedStocks.getPurchasedStocksByTicker(id);
  //     if (purchasedStocks) {
  //       res.json(purchasedStocks);
  //     } else {
  //       res.status(404).json({ error: "Purchased Stocks not found" });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching purchased stock data:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // purchasedStocksRouter.get("/watchlist/:watchlistID/ticker/:tickerID", async (req, res, next) => {
  //   try {
  //     const { watchlistID, tickerID } = req.params;
  //     const userID = req.session["uuid"];
  //     const purchasedStocks = await PurchasedStocks.getPurchasedStock(watchlistID, userID, tickerID);
  //     if (purchasedStocks) {
  //       res.json(purchasedStocks);
  //     } else {
  //       res.status(404).json({ error: "Purchased Stocks not found" });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching purchased stock data:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });
  return purchasedStocksRouter;
};

export default purchasedStocksRouterHandler;
