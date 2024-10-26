import bodyParser from "body-parser";
import express, { Express, Router } from "express";

import { ExpressTestUtils } from "../services";

export class ControllersTestUtils extends ExpressTestUtils {
  generateDumbApp(router?: Router): Express {
    const app = express();
    app.use(bodyParser.json());
    if (router) {
      app.use(router);
    }
    return app;
  }
}
