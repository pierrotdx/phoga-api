import { Handler, Router } from "express";

export interface IExpressRouter {
  getRouter: () => Router;
  addSubRouter: (
    expressSubRouter: IExpressRouter,
    path: string,
    permissionHandler?: Handler,
  ) => void;
}
