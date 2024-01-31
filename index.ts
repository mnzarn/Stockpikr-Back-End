import { Middleware } from "services/middleware";
import { initServer } from "./server";

initServer(new Middleware());
