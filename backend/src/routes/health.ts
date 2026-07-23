import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    status: "healthy",
    service: "ec2-monitor-api",
    environment: config.environment,
    processUptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
