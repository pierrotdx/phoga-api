import bodyParser from "body-parser";
import express, { Express, Router } from "express";

import { ExpressSharedTestUtils } from "../services";

export class ControllersTestUtils extends ExpressSharedTestUtils {
  generateDumbApp(router?: Router): Express {
    const app = express();
    app.use(bodyParser.json());
    if (router) {
      app.use(router);
    }
    return app;
  }
}
