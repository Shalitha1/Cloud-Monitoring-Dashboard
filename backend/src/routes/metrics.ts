import { Router } from "express";
import {
  collectSystemMetrics,
  getMetricHistory
} from "../services/systemMetrics.js";

const supportedRanges = new Set(["1h", "6h", "24h", "7d"]);

export const metricsRouter = Router();

metricsRouter.get("/summary", async (_request, response, next) => {
  try {
    response.json({
      data: await collectSystemMetrics(),
      source: "local-system",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

metricsRouter.get("/history", async (request, response, next) => {
  const range = typeof request.query.range === "string" ? request.query.range : "1h";

  if (!supportedRanges.has(range)) {
    response.status(400).json({
      error: {
        code: "INVALID_RANGE",
        message: "range must be one of: 1h, 6h, 24h, 7d"
      }
    });
    return;
  }

  try {
    await collectSystemMetrics();
    response.json({
      data: getMetricHistory(range),
      range,
      source: "local-system-memory",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
