import { Handler } from "express";
import {
  auth,
  requiredScopes as checkRequiredScopes,
} from "express-oauth2-jwt-bearer";

import { Scope } from "@http-server";

import { IExpressAuthHandler } from "../express";

export class ExpressAuthHandler implements IExpressAuthHandler {
  private _requiresAuth: Handler;
  get requiresAuth() {
    return this._requiresAuth;
  }

  constructor(
    private readonly issuerBaseURL: string,
    private readonly audience: string,
  ) {
    this._requiresAuth = auth({
      audience: this.audience,
      issuerBaseURL: this.issuerBaseURL,
    });
  }

  requiredScopes(requiredScopes: Scope | Scope[]): Handler {
    return checkRequiredScopes(requiredScopes);
  }
}
