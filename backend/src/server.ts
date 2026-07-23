import { app } from "./app.js";
import { config } from "./config.js";

const server = app.listen(config.port, config.host, () => {
  console.log(
    `EC2 Monitor API listening at http://${config.host}:${config.port}`
  );
});

function shutdown(signal: string) {
  console.log(`${signal} received; closing HTTP server`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close HTTP server", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
