import { CronStateModel } from "../models/CronStateModel";
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
  private apiLimitHit: boolean = false;
  private apiLimitResetTime: number = 0; // Unix timestamp (in seconds)

  private readonly CRON_STATE_ID = "fmpStockUpdate";
  private readonly MAX_API_CALLS_PER_DAY = 102;

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
        this.apiLimitHit = true;

        // Set the reset time to start of the next day (midnight UTC)
        const now = new Date();
        const tomorrow = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1, // Next day
          0, 0, 0, 0
        ));
        this.apiLimitResetTime = Math.floor(tomorrow.getTime() / 1000);

        return;
      }
    
      console.error('Unexpected error in updateLatestTickers:', err);
    }
  };

  private async loadCronState() {
    const state = await CronStateModel.findById(this.CRON_STATE_ID);
    if (state) {
      this.lastRunTime = state.lastRunTime;
      this.apiLimitHit = state.apiLimitHit;
      this.apiLimitResetTime = state.apiLimitResetTime;
    }
  }

  private async saveCronState() {
    await CronStateModel.findByIdAndUpdate(
      this.CRON_STATE_ID,
      {
        _id: this.CRON_STATE_ID,
        lastRunTime: this.lastRunTime,
        apiLimitHit: this.apiLimitHit,
        apiLimitResetTime: this.apiLimitResetTime,
      },
      { upsert: true }
    );
  }

  public fetchOrUpdateLatestStocks = async () => {
    console.log("Cron job running");
    const now = getCurrentTimestampSeconds();
    const timestampISO = new Date(now * 1000).toISOString();
    console.log(`[${timestampISO}] Cron job started: fetchOrUpdateLatestStocks`);

    await this.loadCronState();

    if (this.apiLimitHit && now < this.apiLimitResetTime) {
      const waitHours = ((this.apiLimitResetTime - now) / 3600).toFixed(2);
      console.log(`[${timestampISO}] API limit previously hit. Skipping until reset in ${waitHours} hours.`);
    }
  
    if (this.apiLimitHit && now >= this.apiLimitResetTime) {
      // Reset the flag for the new day
      console.log(`[${timestampISO}] API limit reset time reached. Resuming updates.`);
      this.apiLimitHit = false;
      this.apiLimitResetTime = 0;
    }

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
        
          try {
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
              await this.watchlistModel.updateWatchlist(wl.watchlistName, user.authID, wl.tickers);
            }
        
            const userPostions = await this.purchasedStockModel.getPurchasedStocksByUserID(user.authID);
            for (const up of userPostions) {
              for (const ticker of up.tickers) {
                const latest = await this.latestStockModel.getLatestStockQuoteDetailed(ticker.symbol);
                if (latest && latest.price == ticker.targetSellPrice && !ticker.notified) {
                  await EmailService.sendSellAlertEmail(
                    user.email,
                    ticker.symbol,
                    latest.price,
                    ticker.targetSellPrice
                  );
        
                  ticker.notified = true;
                  console.log(`📧 Email sent for ${ticker.symbol}`);
                }
              }
              await this.purchasedStockModel.updatePurchasedStock(String(up.purchasedstocksName), user.authID, up.tickers);
            }
          } catch (err) {
            console.error(`❌ Error processing user ${user.authID}:`, err);
          }
        }        

        this.lastRunTime = now;
        this.previousTickerCount = currentTickerCount;
        await this.saveCronState();
        console.log("Update completed");
      } else {
        const users = await this.userModel.getUsers();

        for (const user of users) {
          if (!user.notifications || !user.email) continue;
        
          try {
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
              await this.watchlistModel.updateWatchlist(wl.watchlistName, user.authID, wl.tickers);
            }
        
            const userPostions = await this.purchasedStockModel.getPurchasedStocksByUserID(user.authID);
            for (const up of userPostions) {
              for (const ticker of up.tickers) {
                const latest = await this.latestStockModel.getLatestStockQuoteDetailed(ticker.symbol);
                if (latest && latest.price == ticker.targetSellPrice && !ticker.notified) {
                  await EmailService.sendSellAlertEmail(
                    user.email,
                    ticker.symbol,
                    latest.price,
                    ticker.targetSellPrice
                  );
        
                  ticker.notified = true;
                  console.log(`📧 Email sent for ${ticker.symbol}`);
                }
              }
              await this.purchasedStockModel.updatePurchasedStock(String(up.purchasedstocksName), user.authID, up.tickers);
            }
          } catch (err) {
            console.error(`❌ Error processing user ${user.authID}:`, err);
          }
        }        
        const waitRemaining = minIntervalSeconds - timeSinceLastRun;
        console.log(`[${timestampISO}] Skipping update. Need to wait ${waitRemaining} more seconds (${(waitRemaining / 60).toFixed(2)} minutes).`);
      }
    } catch (error) {
      console.error("Error in fetchOrUpdateLatestStocks:", error);
    }
  };
}