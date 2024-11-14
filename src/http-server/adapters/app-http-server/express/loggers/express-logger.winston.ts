import { Handler } from "express";
import expressWinston from "express-winston";
import { transport } from "winston";

import { IExpressLogger } from "../models";

export class ExpressLoggerWinston implements IExpressLogger {
  public readonly handler: Handler;
  private readonly bodyBlacklist = ["password"];

  constructor(transports: transport[]) {
    this.configExpressWinston();
    this.handler = expressWinston.logger({
      transports,
      meta: true,
      msg: "HTTP {{req.method}} {{res.statusCode}} {{ res.responseTime }}ms {{req.url}}",
      statusLevels: true,
      bodyBlacklist: this.bodyBlacklist,
    });
  }

  private configExpressWinston() {
    expressWinston.requestWhitelist.push("body");
    expressWinston.responseWhitelist.push("body");
  }
}
