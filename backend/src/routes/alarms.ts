import { Router } from "express";
import { createLiveAlarms } from "../services/alarms.js";
import { collectSystemMetrics } from "../services/systemMetrics.js";

export const alarmsRouter = Router();

alarmsRouter.get("/", async (_request, response, next) => {
  try {
    const alarms = createLiveAlarms(await collectSystemMetrics());

    response.json({
      data: alarms,
      summary: {
        ok: alarms.filter((alarm) => alarm.state === "OK").length,
        warning: alarms.filter((alarm) => alarm.state === "WARNING").length,
        alarm: alarms.filter((alarm) => alarm.state === "ALARM").length
      },
      source: "local-system",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});
