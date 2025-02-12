import { App, Models } from "./App";
import { Middleware } from "./services/middleware";

export const initServer = (models: Models, middleware?: Middleware) => {
  const defaultMiddleware = new Middleware(); // Ensure a default middleware exists
  const app = new App(models).withMiddleware(middleware ?? defaultMiddleware); // Use default if undefined
  app.routes();
  return app.express;
};
