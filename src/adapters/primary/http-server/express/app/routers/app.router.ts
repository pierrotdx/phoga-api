import { Router } from "express";
import { PhotoRouter } from "./photo.router";
import { endpoints } from "../../../http-server.constants";

export class AppRouter {
  router: Router;

  constructor(private readonly photoRouter: PhotoRouter) {
    this.router = Router();
    this.setBaseRoute();
    this.router.use(endpoints.photoBase, this.photoRouter.router);
  }

  private setBaseRoute() {
    this.router.get(endpoints.baseUrl, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }
}
