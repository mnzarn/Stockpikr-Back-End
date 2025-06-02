import { Router } from "express";
import { Ticker } from "../interfaces/IPurchasedStockModel";
import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { PositionModel } from "../models/PositionModel";

const calcPriceDifference = (firstPrice: number, secondPrice: number): number => {
  if (secondPrice === 0) return 0;
  return firstPrice / secondPrice - 1;
};

const displayPriceDiffPercentage = (priceDiff: number): number => {
  return Number((priceDiff * 100).toFixed(4).replace(/\.?0+$/, ""));
};

const calPriceDifferentPercentage = (firstPrice: number, secondPrice: number): number => {
  const priceDiff = calcPriceDifference(firstPrice, secondPrice);
  return displayPriceDiffPercentage(priceDiff);
};

const transformMinimalToDetailedTickers = async (
  latestStockInfo: LatestStockInfoModel,
  tickers: Ticker[]
) => {
  let returnedTickers = [];
  const detailedTickers = await latestStockInfo.getLatestStockQuotes(tickers.map((t) => t.symbol));
  for (const ticker of tickers) {
    const detailedTicker = detailedTickers.find((t) => t.symbol === ticker.symbol);
    if (!detailedTicker) continue;
    returnedTickers.push({
      ...ticker,
      ...detailedTicker,
      currentVsAlertPricePercentage: calPriceDifferentPercentage(detailedTicker.price, ticker.purchasePrice),
      nearHighVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.dayHigh, detailedTicker.price),
      yearHighVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.yearHigh, detailedTicker.price),
      nearLowVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.dayLow, detailedTicker.price),
      yearLowVsCurrentPercentage: calPriceDifferentPercentage(detailedTicker.yearLow, detailedTicker.price),
    });
  }
  return returnedTickers;
};

const positionsRouterHandler = (Positions: PositionModel, latestStockInfo: LatestStockInfoModel) => {
  const router = Router();

  router.get("/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const userID = req.session["uuid"] || req.query.userId;
      if (!userID) return res.status(400).json({ error: "User ID is empty" });
      let position = await Positions.getPosition(name, userID);
      if (position) {
        //position.tickers = await transformMinimalToDetailedTickers(latestStockInfo, position.tickers);
        res.status(200).json(position);
      } else {
        res.status(404).json({ error: "Position not found" });
      }
    } catch (error) {
      console.error("Error fetching position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/user/:id", async (req, res) => {
    try {
      const userID = req.session["uuid"] || req.params.id;
      const positions = await Positions.getPositionsByUserID(userID);
      if (positions?.length > 0) {
        for (let p of positions) {
          //p.tickers = await transformMinimalToDetailedTickers(latestStockInfo, p.tickers);
        }
        res.status(200).json(positions);
      } else {
        res.status(404).json({ error: "No positions found" });
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { tickers, positionName } = req.body;
      const userID = req.session["uuid"] || req.body.userID;
      if (!positionName || !userID) return res.status(400).json({ error: "Missing required fields" });
const existing = await Positions.getPositionByPositionNameAndUserId(userID, positionName);      if (existing) return res.status(403).json({ error: "Position already exists" });

      const id = await Positions.addPosition(userID, positionName, tickers);
      res.status(200).json(id);
    } catch (error) {
      console.error("Error creating position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.put("/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const userID = req.session["uuid"] || req.query.userId;
      if (!name || !userID) return res.status(400).json({ error: "Missing required fields" });
      const tickers = req.body;
      const updated = await Positions.updatePosition(name, userID, tickers);
      res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.patch("/tickers/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const userID = req.session["uuid"] || req.query.userId;
      const result = await Positions.deleteTickersInPosition(name, userID, req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting tickers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.delete("/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const userID = req.session["uuid"] || req.query.userId;
      const deleted = await Positions.deletePosition(name, userID);
      res.status(200).json(deleted);
    } catch (error) {
      console.error("Error deleting position:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};

export default positionsRouterHandler;
