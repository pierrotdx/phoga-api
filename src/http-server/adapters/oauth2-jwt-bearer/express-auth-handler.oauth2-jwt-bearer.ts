import { Handler } from "express";
import {
  auth,
  requiredScopes as checkRequiredScopes,
} from "express-oauth2-jwt-bearer";

import { IAuthHandler, Scope } from "@http-server";

export class ExpressAuthHandler implements IAuthHandler {
  private _requiresAuth: Handler;
  get requiresAuth() {
    return this._requiresAuth;
  }

  constructor(
    public readonly issuerBaseURL: string,
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
