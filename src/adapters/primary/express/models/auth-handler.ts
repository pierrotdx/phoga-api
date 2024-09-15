import { Handler } from "express";

import { Scope } from "@http-server";

export interface IAuthHandler {
  issuerBaseURL: string;
  requiresAuth: Handler;
  requiredScopes(requiredScopes: Scope | Scope[]): Handler;
}
