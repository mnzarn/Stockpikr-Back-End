import { App } from "./App";
import { config } from "./config";

const port = config.PORT;
let server: any = new App().express;
server.listen(port);
console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
