import { Router } from "express";
import { collectLocalSystemInfo } from "../services/systemMetrics.js";

export const systemRouter = Router();

systemRouter.get("/", async (_request, response, next) => {
  try {
    response.json({
      data: await collectLocalSystemInfo(),
      source: "local-system",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
