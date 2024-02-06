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
      // const stockData = await stockDataModel.getStockDataBySymbol(symbol);
      // FIXME: change to querying stocks from the backend
      // const stocks = await stockDataModel.getStocks();
      const stockData = await StockApiService.fetchStockData(value, limit as any);
      console.log("stock data: ", stockData);
      if (stockData) {
        res.json(stockData);
      } else {
        res.status(404).json({ error: "Stock data not found" });
      }
    } catch (error) {
      console.error("Error fetching stockData data:", error);
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
      console.error("Error fetching company profile data:", error);
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
