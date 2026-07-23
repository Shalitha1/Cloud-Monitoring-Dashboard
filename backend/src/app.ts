import express from "express";
import helmet from "helmet";
import { alarmsRouter } from "./routes/alarms.js";
import { healthRouter } from "./routes/health.js";
import { instanceRouter } from "./routes/instance.js";
import { metricsRouter } from "./routes/metrics.js";
import { systemRouter } from "./routes/system.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "16kb" }));

app.get("/api", (_request, response) => {
  response.json({
    service: "ec2-monitor-api",
    version: "0.1.0",
    endpoints: [
      "/api/health",
      "/api/system",
      "/api/instance",
      "/api/metrics/summary",
      "/api/metrics/history?range=1h",
      "/api/alarms"
    ]
  });
});

app.use("/api/health", healthRouter);
app.use("/api/system", systemRouter);
app.use("/api/instance", instanceRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/alarms", alarmsRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested API endpoint does not exist"
    }
  });
});

app.use((
  error: unknown,
  _request: express.Request,
  response: express.Response,
  _next: express.NextFunction
) => {
  console.error(error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }
  });
});
