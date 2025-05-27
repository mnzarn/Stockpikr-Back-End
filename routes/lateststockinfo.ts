import { Router } from "express";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { StockApiService } from "../services/fmpApi";

const latestStockInfoRouterHandler = (LatestStocks: LatestStockInfoModel) => {
  const latestStockInfoRouter = Router();

  latestStockInfoRouter.post("/", async (req, res, next) => {
    try {
      const latestStockInfo = await LatestStocks.addNewTickerInfo(req.body);
      if (latestStockInfo) {
        res.json(latestStockInfo);
      } else {
        res.status(404).json({ error: "Latest Stock Info not found" });
      }
    } catch (error) {
      console.error("Error adding latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  latestStockInfoRouter.put("/:symbol", async (req, res, next) => {
    try {
      const symbol = req.params.symbol;
      const latestStockInfo = await LatestStocks.updateTickerInfo(symbol, req.body);
      if (latestStockInfo) {
        res.json(latestStockInfo);
      } else {
        res.status(404).json({ error: "Latest Stock Info not found" });
      }
    } catch (error) {
      console.error("Error adding latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  latestStockInfoRouter.get("/", async (req, res, next) => {
    try {
      const { limit, offset } = req.query;
      const latestStockInfo = await LatestStocks.getAllLatestStockQuotes(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      if (latestStockInfo) {
        res.json(latestStockInfo);
      } else {
        res.status(404).json({ error: "Latest Stock Info not found" });
      }
    } catch (error) {
      console.error("Error fetching latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  latestStockInfoRouter.get("/search/:input", async (req, res, next) => {
    try {
      const { limit, offset } = req.query;
      const { input } = req.params;
      const latestStockInfos = await LatestStocks.searchStockQuotes(
        input,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      if (latestStockInfos) {
        res.json(latestStockInfos);
      } else {
        res.status(404).json({ error: "Latest Stock Infos not found" });
      }
    } catch (error) {
      console.error("Error fetching latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  latestStockInfoRouter.get("/quotes/:symbols", async (req, res, next) => {
    try {
      const symbols = req.params.symbols;
      const listSymbols = symbols.split(",");
      const latestStockInfo = await LatestStocks.getLatestStockQuotes(listSymbols);
      if (latestStockInfo) {
        res.json(latestStockInfo);
      } else {
        res.status(404).json({ error: "Latest Stock Info not found" });
      }
    } catch (error) {
      console.error("Error fetching latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  latestStockInfoRouter.get("/quote/:symbol", async (req, res, next) => {
    try {
      const symbol = req.params.symbol;
      console.log("symbol: ", symbol);

      const dbResult = await LatestStocks.getLatestStockQuoteDetailed(symbol);

      if (dbResult) {
        return res.status(200).json(dbResult);
      }

      const apiResult = await StockApiService.fetchStockQuotes(symbol);
      
      if (!apiResult) {
        return res.status(404).json({ error: "Stock data not found" });
      }

      await LatestStocks.addNewTickerInfo(apiResult);

      return res.status(200).json(apiResult);

    } catch (error: any) {
      const message = error?.message || 'Internal server error';
      const status = message.includes('API limit') ? 429 : 500;
      res.status(status).json({ error: message });
    }
  });

  latestStockInfoRouter.delete("/:symbol", async (req, res, next) => {
    try {
      const symbol = req.params.symbol;
      const latestStockInfo = await LatestStocks.deleteStockPriceInfoByTicker(symbol);
      if (latestStockInfo) {
        res.json(latestStockInfo);
      } else {
        res.status(404).json({ error: "Latest Stock Info not found" });
      }
    } catch (error) {
      console.error("Error deleting latest stock info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  return latestStockInfoRouter;
};

export default latestStockInfoRouterHandler;
