import bodyParser from "body-parser";
import express, { Express, Router } from "express";
import { Test } from "supertest";

import { IPhoto } from "@domain";

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

  addFormDataToReq(req: Test, photo: IPhoto): void {
    req.field("_id", photo._id);
    if (photo.imageBuffer) {
      req.attach("image", photo.imageBuffer);
    }
    if (!photo.metadata) {
      return;
    }
    if (photo.metadata.date) {
      const stringDate = photo.metadata.date.toISOString();
      req.field("date", stringDate);
    }
    if (photo.metadata.location) {
      req.field("location", photo.metadata.location);
    }
    if (photo.metadata.description) {
      req.field("description", photo.metadata.description);
    }
    if (photo.metadata.titles?.length) {
      req.field("titles", photo.metadata.titles);
    }
  }
}
