import { Handler } from "express";

import { Scope } from "@http-server";

export interface IAuthExpressHandler {
  requiresAuth: Handler;
  requiredScopes(requiredScopes: Scope | Scope[]): Handler;
}
