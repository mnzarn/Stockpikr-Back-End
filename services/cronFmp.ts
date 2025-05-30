import { LatestStockInfoModel } from "../models/LatestStockInfoModel";
import { PurchasedStockModel } from "../models/PurchasedStockModel";
import { UserModel } from "../models/UserModel";
import { WatchlistModel } from "../models/WatchlistModel";
import { getCurrentTimestampSeconds } from "../utils";
import { EmailService } from "./email";
import { StockApiService } from "./fmpApi";

export class CronFmp {
  private storedTimestamp: number = getCurrentTimestampSeconds();
  private previousTickerCount: number = 0;
  private lastRunTime: number = 0;

  private readonly MAX_API_CALLS_PER_DAY = 250;

  constructor(
    private latestStockModel: LatestStockInfoModel,
    private userModel: UserModel,
    private watchlistModel: WatchlistModel,
    private purchasedStockModel: PurchasedStockModel,
    storedTimestamp?: number
  ) {
    this.storedTimestamp = storedTimestamp || getCurrentTimestampSeconds();
    this.lastRunTime = this.storedTimestamp;
  }

  private storeNewTickers = async () => {
    try {
      const tickers = await StockApiService.fetchExchangeSymbols();
      await this.latestStockModel.addBulkTickers(tickers);
    } catch (error) {
      console.error("Error in storeNewTickers:", error);
    }
  };

  private updateLatestTickers = async (tickers: string[]) => {
    try {
      const latestTickers = [];
      for (const ticker of tickers) {
        const stockQuote = await StockApiService.fetchStockQuotes(ticker);
        latestTickers.push(stockQuote);
      }
      await this.latestStockModel.updateBulkTickers(latestTickers);
    } catch (err) {
      if (err instanceof Error && err.message.includes('API limit')) {
        console.warn(`API limit hit while updating latest tickers`);
        return;
      }
    
      console.error('Unexpected error in updateLatestTickers:', err);
    }
  };

  public fetchOrUpdateLatestStocks = async () => {
    console.log("Cron job running");
    const now = getCurrentTimestampSeconds();
    const timestampISO = new Date(now * 1000).toISOString();
    console.log(`[${timestampISO}] Cron job started: fetchOrUpdateLatestStocks`);

    try {
      const allWatchlists = await this.watchlistModel.getWatchlists();
      const tickers = allWatchlists.map(wl => wl.tickers).flat();
      const uniqueTickers = [...new Set(tickers.map(t => t.symbol))];
      const now = getCurrentTimestampSeconds();

      // Calculate allowable interval per API call based on current load
      const currentTickerCount = uniqueTickers.length;

      const maxCallsPerDay = this.MAX_API_CALLS_PER_DAY;
      const minIntervalSeconds = Math.floor((24 * 3600) / Math.max(1, maxCallsPerDay / currentTickerCount));
      
      console.log(`[${timestampISO}] Calculated minimum interval: ${minIntervalSeconds} seconds (${(minIntervalSeconds / 60).toFixed(2)} minutes)`);

      const timeSinceLastRun = now - this.lastRunTime;
      console.log(`[${timestampISO}] Time since last run: ${timeSinceLastRun} seconds`);
      
      const tickerCountChanged = currentTickerCount !== this.previousTickerCount;

      if (tickerCountChanged || timeSinceLastRun >= minIntervalSeconds) {
        console.log(`Running update: ticker count = ${currentTickerCount}, interval = ${minIntervalSeconds}s`);

        await this.updateLatestTickers(uniqueTickers);

        const users = await this.userModel.getUsers();

        for (const user of users) {
          if (!user.notifications || !user.email) continue;

          const userWatchlists = await this.watchlistModel.getWatchlistsByUserID(user.authID);
          for (const wl of userWatchlists) {
            for (const ticker of wl.tickers) {
              const latest = await this.latestStockModel.getLatestStockQuoteDetailed(ticker.symbol);
              if (latest && latest.price == ticker.alertPrice && !ticker.notified) {
                await EmailService.sendAlertEmail(
                  user.email,
                  ticker.symbol,
                  latest.price,
                  ticker.alertPrice
                );

                ticker.notified = true;
                console.log(`📧 Email sent to ${user.email} for ${ticker.symbol}`);
              }
            }
            await this.watchlistModel.updateWatchlist(wl.watchlistName, user.userID, wl.tickers);
          }

          const userPostions = await this.purchasedStockModel.getPurchasedStocksByUserID(user.authID);
          for (const up of userPostions) {
            for (const ticker of up.tickers) {
              const latest = await this.latestStockModel.getLatestStockQuoteDetailed(ticker.symbol);
              if (latest && latest.price == ticker.sellPrice && !ticker.notified) {
                await EmailService.sendSellAlertEmail(
                  user.email,
                  ticker.symbol,
                  latest.price,
                  ticker.sellPrice
                );

                ticker.notified = true;
                console.log(`📧 Email sent for ${ticker.symbol}`);
              }
            }
            await this.purchasedStockModel.updatePurchasedStock(String(up.purchasedstocksName), user.userID, up.tickers);
          }
        }

        this.lastRunTime = now;
        this.previousTickerCount = currentTickerCount;

        console.log("Update completed");
      } else {
        const waitRemaining = minIntervalSeconds - timeSinceLastRun;
        console.log(`[${timestampISO}] Skipping update. Need to wait ${waitRemaining} more seconds (${(waitRemaining / 60).toFixed(2)} minutes).`);
      }
    } catch (error) {
      console.error("Error in fetchOrUpdateLatestStocks:", error);
    }
  };
}