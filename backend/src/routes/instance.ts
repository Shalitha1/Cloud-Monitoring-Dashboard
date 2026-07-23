import { Router } from "express";
import { mockInstance } from "../data/mockData.js";
import { collectSystemMetrics } from "../services/systemMetrics.js";

export const instanceRouter = Router();

instanceRouter.get("/", async (_request, response, next) => {
  try {
    const metrics = await collectSystemMetrics();

    response.json({
      data: {
        ...mockInstance,
        uptimeSeconds: metrics.uptimeSeconds
      },
      source: {
        identity: "mock",
        uptime: "local-system"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
