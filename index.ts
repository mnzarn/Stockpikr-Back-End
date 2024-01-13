import { App } from "./App";
import { config } from "./config";

const port = config.PORT;
const app = new App();
const server = app.express;
server.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default server;
