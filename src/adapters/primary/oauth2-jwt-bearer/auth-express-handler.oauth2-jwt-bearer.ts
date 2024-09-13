import { Handler } from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";

import { Permission } from "@http-server";

import { IAuthExpressHandler } from "../express";

export class AuthExpressHandler implements IAuthExpressHandler {
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

  hasPermissions(requiredPermissions: Permission | Permission[]): Handler {
    return requiredScopes(requiredPermissions);
  }
}
