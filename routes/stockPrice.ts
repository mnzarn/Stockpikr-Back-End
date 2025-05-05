import { Router } from "express";
import IStockData from "../interfaces/IStockData";
import { StockDataModel } from "../models/StockData";
import { StockApiService } from "../services/fmpApi";

const stockDataRouterHandler = (stockDataModel: StockDataModel) => {
  const stockDataRouter = Router();

  // POPULATE DB
  // const userID = stockData.addUser('John', 'Doe', '123 Main Street', '1234567890');
  // console.log('User added with ID:', userID);

  //Get one user by ID
  stockDataRouter.get("/:value", async (req, res, next) => {
    try {
      const { value } = req.params;
      const { limit } = req.query;
      const numericLimit = limit ? parseInt(limit as string) : undefined;

      const dbResults = await stockDataModel.searchStocks(value);

      if (dbResults.length > 0) {
        return res.status(200).json(dbResults);
      }

      const apiResults = await StockApiService.fetchStockData(value, numericLimit);

      if (!apiResults || !Array.isArray(apiResults) || apiResults.length === 0) {
        return res.status(404).json({ error: "Stock data not found" });
      }

      for (const stock of apiResults) {
        try {
          const exists = await stockDataModel.model.exists({ symbol: stock.symbol });
          if (!exists) {
            const { symbol, name, currency, stockExchange, exchangeShortName } = stock;
            await stockDataModel.addStockData({ symbol, name, currency, stockExchange, exchangeShortName });
          }
        } catch (saveError) {
          console.error(`Error saving stock (${stock.symbol}):`, saveError);
        }
      }

      return res.status(200).json(apiResults);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Get all users
  stockDataRouter.get("/", async (req, res, next) => {
    try {
      const stocks = await stockDataModel.getStocks();
      if (stocks.length > 0) {
        res.status(200).json(stocks);
      } else {
        res.status(404).json({ error: "stocks not found" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  stockDataRouter.get("/quote/:value", async (req, res, next) => {
    try {
      const { value } = req.params;
      const stockQuotes = await StockApiService.fetchStockQuotes(value);
      if (stockQuotes) {
        res.json(stockQuotes);
      } else {
        res.status(404).json({ error: "Stock quotes not found" });
      }
    } catch (error) {
      console.error("Error fetching stockData data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  stockDataRouter.get("/:symbol/profile", async (req, res, next) => {
    try {
      const { symbol } = req.params;
      const companyProfile = await StockApiService.fetchCompanyProfile(symbol);
      if (companyProfile.length > 0) {
        res.json(companyProfile);
      } else {
        res.status(404).json({ error: "Stock profile not found" });
      }
    } catch (error) {
      console.error("Error fetching stock profile data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  stockDataRouter.get("/market/gainers", async (req, res, next) => {
    try {
      const stockGainers = await StockApiService.fetchGainers();
      if (stockGainers.length > 0) {
        res.json(stockGainers);
      } else {
        res.status(404).json({ error: "Stock gainers not found" });
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  stockDataRouter.get("/market/losers", async (req, res, next) => {
    try {
      const stockLosers = await StockApiService.fetchLosers();
      if (stockLosers.length > 0) {
        res.json(stockLosers);
      } else {
        res.status(404).json({ error: "Stock losers not found" });
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  stockDataRouter.get("/market/actives", async (req, res, next) => {
    try {
      const stockActives = await StockApiService.fetchActives();
      if (stockActives.length > 0) {
        res.json(stockActives);
      } else {
        res.status(404).json({ error: "Stock actives not found" });
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Update user information by ID
  stockDataRouter.put("/:symbol", async (req, res, next) => {
    try {
      const { symbol } = req.params;
      const { name, currency, stockExchange, exchangeShortName } = req.body as IStockData;
      const updateStockData = await stockDataModel.updateStockData({
        symbol,
        name,
        currency,
        stockExchange,
        exchangeShortName
      });

      res.status(200).json(updateStockData);
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  return stockDataRouter;
};

export default stockDataRouterHandler;
