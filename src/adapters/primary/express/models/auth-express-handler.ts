import { Handler } from "express";

import { Scope } from "@http-server";

export interface IExpressAuthHandler {
  requiresAuth: Handler;
  requiredScopes(requiredScopes: Scope | Scope[]): Handler;
}
