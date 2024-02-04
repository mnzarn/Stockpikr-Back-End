import { App, Models } from "./App";
import { Middleware } from "./services/middleware";

export const initServer = (models: Models, middleware?: Middleware) => {
  let app = new App(models).withMiddleware(middleware);
  app.routes();
  const server = app.express;
  return server;
};
