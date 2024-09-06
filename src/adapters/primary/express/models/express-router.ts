import { Router } from "express";

export interface IExpressRouter {
  getRouter(): Router;
}
