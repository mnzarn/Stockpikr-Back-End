import cron from "node-cron";
import { DataAccess } from "./DataAccess";
import { config } from "./config";
import { LatestStockInfoModel } from "./models/LatestStockInfoModel";
import { PurchasedStockModel } from "./models/PurchasedStockModel";
import { StockDataModel } from "./models/StockData";
import { UserModel } from "./models/UserModel";
import { WatchlistModel } from "./models/WatchlistModel";
import { initServer } from "./server";
import { CronFmp } from "./services/cronFmp";
import { Middleware } from "./services/middleware";

const port = config.PORT as number;
const host = "0.0.0.0";

(async () => {
  DataAccess.connect();
  const connection = DataAccess.mongooseConnection;
  const userModel = new UserModel(connection);
  const stockDataModel = new StockDataModel(connection);
  const watchlistModel = new WatchlistModel(connection);
  const latestStockInfoModel = new LatestStockInfoModel(connection);
  const purchasedStockModel = new PurchasedStockModel(connection);
  const middleware = config.NODE_ENV === "development" ? undefined : new Middleware();
  const server = initServer(
    { userModel, stockDataModel, watchlistModel, latestStockInfoModel, purchasedStockModel },
    middleware
  );
  server.listen(port, host, async () => {
    console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
  });
  const cronFmp = new CronFmp(latestStockInfoModel, userModel, watchlistModel, purchasedStockModel);
  // we cron every 10 mins, but only fetch data from fmp api if there's no tickers stored or the tickers are more than a day old
  // usually, a cron job lib is not suitable for async tasks because it would potentially causing race conditions if the task takes 
  // more than 5 mins to run however, our logic should not take 5 mins. If it does -> there's something wrong
  cron.schedule("*/5 * * * *", cronFmp.fetchOrUpdateLatestStocks, {
    runOnInit: true
  });
})();
