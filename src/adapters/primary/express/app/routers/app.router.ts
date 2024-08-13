import { Router } from "express";
import { PhotoRouter } from "./photo.router";

export class AppRouter {
  router: Router;

  constructor(private readonly photoRouter: PhotoRouter) {
    this.router = Router();
    this.setBaseRoute();
    this.router.use("/photo", this.photoRouter.router);
  }

  private setBaseRoute() {
    this.router.get("", (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }
}
