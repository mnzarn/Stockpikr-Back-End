import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { getCurrentTimestampSeconds } from "../utils";
import { StockApiService } from "./fmpApi";

export class CronFmp {
  // we keep track of the stored timestamp in memory for simplicity. It gets updated every
  constructor(
    private latestStockModel: LatestStockInfoModel,
    private storedTimestamp: number = getCurrentTimestampSeconds(),
    private queryStocksInterval: number = 24 * 60 * 60 // default is 1 day
  ) {}

  private storeNewTickers = async () => {
    const tickers = await StockApiService.fetchExchangeSymbols();
    await this.latestStockModel.addBulkTickers(tickers);
  };

  private updateLatestTickers = async () => {
    const latestTickers = await StockApiService.fetchExchangeSymbols();
    await this.latestStockModel.updateBulkTickers(latestTickers);
  };

  // TODO: write test cases
  fetchOrUpdateLatestStocks = async () => {
    const latestStockInfo = await this.latestStockModel.getAllLatestStockQuotes();
    if (!latestStockInfo || latestStockInfo.length === 0) await this.storeNewTickers();
    else {
      const timestampInSeconds = getCurrentTimestampSeconds();
      // only update quotes if we find a quote that has not been updated for at least a day
      if (timestampInSeconds - this.queryStocksInterval > this.storedTimestamp) {
        await this.updateLatestTickers();
        this.storedTimestamp = timestampInSeconds;
      }
    }
  };
}
