import { App } from "./App";
import { config } from "./config";
import { Middleware } from "./services/middleware";

export const initServer = (middleware?: Middleware) => {
  const port = config.PORT as number;
  const host = "0.0.0.0";
  const app = new App(middleware);
  const server = app.express;
  server.listen(port, host, async () => {
    console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
  });
  return server;
};
