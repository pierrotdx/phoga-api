import { Router } from "express";

import { EntryPointId } from "@http-server";

import { IExpressRouter } from "../../models";
import { addSubRouter } from "../../services";
import { AdminPhotoRouter } from "./admin-photo.router";

export class AdminRouter implements IExpressRouter {
  private readonly router: Router;

  constructor(private readonly adminPhotoRouter: AdminPhotoRouter) {
    this.router = Router();
    addSubRouter(
      this.router,
      this.adminPhotoRouter,
      EntryPointId.AdminPhotoBase,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
