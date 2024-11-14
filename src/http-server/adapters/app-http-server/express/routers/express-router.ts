import { Handler, Router } from "express";

import { IExpressRouter } from "../models";

export abstract class ExpressRouter implements IExpressRouter {
  protected readonly router: Router;

  constructor() {
    this.router = Router();
  }

  readonly getRouter = () => {
    return this.router;
  };

  protected readonly addSubRouter = (
    expressSubRouter: IExpressRouter,
    path: string,
    permissionHandler?: Handler,
  ) => {
    const subRouter = expressSubRouter.getRouter();
    if (permissionHandler) {
      this.router.use(path, permissionHandler, subRouter);
    } else {
      this.router.use(path, subRouter);
    }
  };
}
