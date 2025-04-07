import { Router } from "express";

export interface IExpressRouter {
  get(): Router;
}
