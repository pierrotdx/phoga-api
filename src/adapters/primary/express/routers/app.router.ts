import { Router } from "express";

import { entryPoints, EntryPointId } from "@http-server";

import { PhotoRouter } from "./photo.router";

export class AppRouter {
  router: Router;

  constructor(private readonly photoRouter: PhotoRouter) {
    this.router = Router();
    this.setBaseRoute();
    const photoPath = entryPoints.getRelativePath(EntryPointId.PhotoBase);
    this.router.use(photoPath, this.photoRouter.router);
  }

  private setBaseRoute() {
    const basePath = entryPoints.getRelativePath(EntryPointId.Base);
    this.router.get(basePath, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }
}
