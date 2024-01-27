import { App } from "./App";
import { config } from "./config";

const port = config.PORT;
const app = new App();
const server = app.express;
const host = "0.0.0.0";
server.listen(port as number, '0.0.0.0', async () => {
  console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
});

export default server;
