import { Router } from "express";
import { Ticker } from "../interfaces/IPurchasedStockModel";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { PurchasedStockModel } from "../models/PurchasedStockModel";

const purchasedStocksRouterHandler = (PurchasedStocks: PurchasedStockModel , latestStockInfo: LatestStockInfoModel) => {
  const purchasedStocksRouter = Router();
/*
  purchasedStocksRouter.post("/", async (req, res, next) => {
    console.log('Received request to add purchased stocks');
    const { symbol, quantity, purchaseDate, purchasePrice, purchasedstocksName } = req.body;
    const parsedDate = new Date(purchaseDate);
    const tickers = [{
      symbol,
      quantity,
      purchaseDate: isNaN(parsedDate.getTime()) ? null : parsedDate,
      purchasePrice,
      price: 0,
      priceChange: 0,
      gainOrLoss: 0,
      marketValue: 0
    }];
    
    const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
    try {
        await PurchasedStocks.addPurchasedStock(userID, purchasedstocksName, tickers);

        console.log('Purchased stocks added successfully');

        res.status(200).json({ message: "Purchased stocks added successfully" });
    } catch (error) {
        console.error("Error adding purchased stocks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
  });

  purchasedStocksRouter.post("/", async (req, res, next) => {
    try {
      const { tickers, purchasedstocksName } = req.body;
      const userID = req.session["uuid"] || req.body.userID;
      if (!purchasedstocksName) return res.status(400).json({ error: "Portfolio name is empty" });
      if (!userID) return res.status(400).json({ error: "User ID is empty" });
  
      const existing = await PurchasedStocks.getPurchasedStockByNameAndUserID(userID, purchasedstocksName);
      if (existing) {
        return res.status(403).json({ error: "Portfolio with this name already exists." });
      }
  
      const created = await PurchasedStocks.addPurchasedStock(userID, purchasedstocksName, tickers);
      res.status(200).json(created);
    } catch (error) {
      console.error("Error adding purchased stock:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }); 
*/
purchasedStocksRouter.post("/", async (req, res, next) => {
  try {
    const userID = req.session["uuid"] || req.body.userID || (req.query.userId as string);
    const { purchasedstocksName } = req.body;
    if (!purchasedstocksName) return res.status(400).json({ error: "Portfolio name is empty" });
    if (!userID) return res.status(400).json({ error: "User ID is empty" });

    // Accept either a single ticker or an array of tickers
    let tickers: Ticker[] = [];
    if (Array.isArray(req.body.tickers)) {
      tickers = req.body.tickers;
    } else if (req.body.symbol) {
      // Support legacy single-ticker body
      const parsedDate = new Date(req.body.purchaseDate);
      tickers = [{
        symbol: req.body.symbol,
        quantity: req.body.quantity,
        purchaseDate: isNaN(parsedDate.getTime()) ? null : parsedDate,
        purchasePrice: req.body.purchasePrice,
        price: 0,
        priceChange: 0,
        gainOrLoss: 0,
        marketValue: 0,
        targetSellPrice: 0,
      }];
    } else {
      return res.status(400).json({ error: "No tickers provided" });
    }

    // Prevent duplicate portfolio names for the user
    const existing = await PurchasedStocks.getPurchasedStockByNameAndUserID(userID, purchasedstocksName);
    if (existing) {
      return res.status(403).json({ error: "Portfolio with this name already exists." });
    }
    console.log('Tickers received from client:', tickers);
    const created = await PurchasedStocks.addPurchasedStock(userID, purchasedstocksName, tickers);
    res.status(200).json(created);
  } catch (error) {
    console.error("Error adding purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
purchasedStocksRouter.get("/", async (req, res, next) => {
    try {
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
      const purchasedStocks = await PurchasedStocks.getPurchasedStocksByUserID(userID);
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
 purchasedStocksRouter.get("/user/:id", async (req, res, next) => {
  try {
    const id = req.session["uuid"] ? req.session["uuid"] : req.params.id;

    const purchasedStocks = await PurchasedStocks.getPurchasedStocksByUserID(id);
    if (purchasedStocks && purchasedStocks.length > 0) {
      res.status(200).json(purchasedStocks);
    } else {
      res.status(404).json({ error: "Purchased stocks not found" });
    }
  } catch (error) {
    console.error("Error fetching purchased stock data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*
  purchasedStocksRouter.put("/:name", async (req, res, next) => {
  try {
    // TODO: validate name, userID, and body
    const purchasedstocksName = req.params.name;
    const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
    if (!purchasedstocksName) return res.status(400).json({ error: "Portfolio name is empty" });
    if (!userID) return res.status(400).json({ error: "User ID is empty" });

    const originalTickers = await PurchasedStocks.getPurchasedStockTickers(purchasedstocksName, userID);
    let newTickers: Ticker[] = originalTickers?.tickers || [];
    let updatedPortfolio;

    const ticker: Ticker = req.body;

    const stockQuote = await latestStockInfo.getLatestStockQuoteDetailed(ticker.symbol);
    if (!stockQuote) {
      return res.status(404).json({ error: `Cannot find stock symbol ${ticker.symbol}` });
    }

    const tickerIndex = newTickers.findIndex(t => t.symbol === ticker.symbol);

    if (tickerIndex === -1) {
      // Add new ticker
      newTickers.push(ticker);
      updatedPortfolio = await PurchasedStocks.updatePurchasedStock(purchasedstocksName, userID, newTickers);
    } else {
      // Update existing ticker
      updatedPortfolio = await PurchasedStocks.updatePurchasedStockTicker(purchasedstocksName, userID, ticker);
    }

    res.status(200).json(updatedPortfolio);
  } catch (error) {
    console.error("Error updating purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
purchasedStocksRouter.put("/:name", async (req, res, next) => {
  try {
    const purchasedstocksName = req.params.name;
    const userID = req.session["uuid"] || (req.query.userId as string);
    if (!purchasedstocksName) return res.status(400).json({ error: "Portfolio name is empty" });
    if (!userID) return res.status(400).json({ error: "User ID is empty" });

    const originalTickers = await PurchasedStocks.getPurchasedStockTickers(purchasedstocksName, userID);
    const updatedTickers: Ticker[] = originalTickers?.tickers || [];

    const tickers: Ticker[] = req.body;
    for (const ticker of tickers) {
      const tickerIndex = updatedTickers.findIndex(t => t.symbol === ticker.symbol);
      if (tickerIndex === -1) {
        return res.status(404).json({ error: `Symbol ${ticker.symbol} not found in portfolio` });
      }
      updatedTickers[tickerIndex] = { ...updatedTickers[tickerIndex], ...ticker };
    }

    await PurchasedStocks.updatePurchasedStock(purchasedstocksName, userID, updatedTickers);
    res.status(200).json({});
  } catch (error) {
    console.error("Error updating purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});*/
purchasedStocksRouter.put("/:name", async (req, res, next) => {
  try {
    const purchasedstocksName = req.params.name;
    const userID = req.session["uuid"] || (req.query.userId as string);
    console.log("Purchased stocks name:", purchasedstocksName);
    if (!purchasedstocksName) return res.status(400).json({ error: "Portfolio name is empty" });
    if (!userID) return res.status(400).json({ error: "User ID is empty" });

    const originalTickers = await PurchasedStocks.getPurchasedStockTickers(purchasedstocksName, userID);
    let newTickers: Ticker[] = originalTickers?.tickers || [];
    let updatedPortfolio;

    // Accept either a single ticker or an array of tickers
    const tickers: Ticker[] = Array.isArray(req.body) ? req.body : [req.body];

    for (const ticker of tickers) {
      const stockQuote = await latestStockInfo.getLatestStockQuoteDetailed(ticker.symbol);
      if (!stockQuote) {
        return res.status(404).json({ error: `Cannot find stock symbol ${ticker.symbol}` });
      }
      const tickerIndex = newTickers.findIndex(t => t.symbol === ticker.symbol);
      if (tickerIndex === -1) {
        // Add new ticker
        newTickers.push(ticker);
      } else {
        // Update existing ticker
        newTickers[tickerIndex] = { ...newTickers[tickerIndex], ...ticker };
      }
    }
    
    updatedPortfolio = await PurchasedStocks.updatePurchasedStock(purchasedstocksName, userID, newTickers);

    if (!updatedPortfolio) {
      return res.status(404).json({ error: "Portfolio not found or update failed" });
    }

    res.status(200).json(updatedPortfolio);
  } catch (error) {
    console.error("Error updating purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

purchasedStocksRouter.patch("/tickers/:name", async (req, res, next) => {
  try {
    const purchasedstocksName = req.params.name;
    const userID = req.session["uuid"] || (req.query.userId as string);
    const result = await PurchasedStocks.deleteTickersInPurchasedStock(purchasedstocksName, userID, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting tickers from purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



purchasedStocksRouter.delete("/:name", async (req, res, next) => {
  try {
    const purchasedstocksName = req.params.name;
    const userID = req.session["uuid"] || (req.query.userId as string);
    const deleted = await PurchasedStocks.deletePurchasedStock(purchasedstocksName, userID);
    res.status(200).json(deleted);
  } catch (error) {
    console.error("Error deleting purchased stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

return purchasedStocksRouter;
};

export default purchasedStocksRouterHandler;


/*


  purchasedStocksRouter.patch("/", async (req, res, next) => {
    try {
      const userID = req.session["uuid"] ? req.session["uuid"] : (req.query.userId as string);
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

export default purchasedStocksRouterHandler; */