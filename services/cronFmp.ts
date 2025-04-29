import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { getCurrentTimestampSeconds } from "../utils";
import { StockApiService } from "./fmpApi";

export class CronFmp {
  private storedTimestamp: number = getCurrentTimestampSeconds();
  private queryStocksInterval: number = 60; // default is 1 day

  constructor(private latestStockModel: LatestStockInfoModel, storedTimestamp?: number) {
  this.storedTimestamp = storedTimestamp || getCurrentTimestampSeconds();
}
  private storeNewTickers = async () => {
    try {
      console.log("storeNewTickers called");
      const tickers = await StockApiService.fetchExchangeSymbols();
      console.log(`Fetched ${tickers.length} tickers in storeNewTickers.`);
      await this.latestStockModel.addBulkTickers(tickers);
      console.log("storeNewTickers completed.");
    } catch (error) {
      console.error("Error in storeNewTickers:", error);
    }
  };

  private updateLatestTickers = async () => {
    try {
      console.log("updateLatestTickers called");
      const latestTickers = await StockApiService.fetchExchangeSymbols();
      console.log(`Fetched ${latestTickers.length} tickers in updateLatestTickers.`);
      await this.latestStockModel.updateBulkTickers(latestTickers);
      console.log("updateLatestTickers completed.");
    } catch (error) {
      console.error("Error in updateLatestTickers:", error);
    }
  };

  public fetchOrUpdateLatestStocks = async () => {
    console.log("Cron job started: fetchOrUpdateLatestStocks");
    try {
      const latestStockInfo = await this.latestStockModel.getAllLatestStockQuotes();
      console.log("Fetched latest stock info from DB:", latestStockInfo);

      if (!latestStockInfo || latestStockInfo.length === 0) {
        console.log("No stock info found. Calling storeNewTickers...");
        await this.storeNewTickers();
        console.log("storeNewTickers completed.");
      } else {
        const timestampInSeconds = getCurrentTimestampSeconds();
        console.log("Current timestamp:", timestampInSeconds, "Stored timestamp:", this.storedTimestamp);

        if (timestampInSeconds - this.queryStocksInterval > this.storedTimestamp) {
          console.log("Calling updateLatestTickers...");
          await this.updateLatestTickers();
          console.log("updateLatestTickers completed.");
          this.storedTimestamp = timestampInSeconds;
        } else {
          console.log("No update needed. Data is up-to-date.");
        }
      }
    } catch (error) {
      console.error("Error in fetchOrUpdateLatestStocks:", error);
    }
  };
}