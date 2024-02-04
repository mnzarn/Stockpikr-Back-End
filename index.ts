import { DataAccess } from "DataAccess";
import { StockDataModel } from "models/StockData";
import { UserModel } from "models/UserModel";
import { WatchlistModel } from "models/WatchlistModel";
import { Middleware } from "services/middleware";
import { config } from "./config";
import { initServer } from "./server";

const port = config.PORT as number;
const host = "0.0.0.0";

(async () => {
  DataAccess.connect();
  const connection = DataAccess.mongooseConnection;
  const userModel = new UserModel(connection);
  const stockDataModel = new StockDataModel(connection);
  const watchlistModel = new WatchlistModel(connection);
  const middleware = config.NODE_ENV === "development" ? undefined : new Middleware();
  const server = initServer({ userModel, stockDataModel, watchlistModel }, middleware);
  server.listen(port, host, async () => {
    console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
  });
})();
