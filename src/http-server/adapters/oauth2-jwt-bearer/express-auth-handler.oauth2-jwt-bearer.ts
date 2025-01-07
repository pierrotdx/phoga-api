import { Handler } from "express";
import { auth, claimCheck } from "express-oauth2-jwt-bearer";

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
    return claimCheck((claims) => {
      const reqScopes = Array.isArray(requiredScopes)
        ? requiredScopes
        : [requiredScopes];
      const claimPermissions = claims.permissions as string[];
      const hasAllRequiredScopes = !reqScopes.some(
        (scope) => !claimPermissions.includes(scope),
      );
      return hasAllRequiredScopes;
    });
  }
}
