import { Router } from "express";

import { entryPoints } from "@http-server";

import { PhotoRouter } from "./photo.router";

export class AppRouter {
  router: Router;

  constructor(private readonly photoRouter: PhotoRouter) {
    this.router = Router();
    this.setBaseRoute();
    this.router.use(entryPoints.photoBase, this.photoRouter.router);
  }

  private setBaseRoute() {
    this.router.get(entryPoints.baseUrl, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }
}
