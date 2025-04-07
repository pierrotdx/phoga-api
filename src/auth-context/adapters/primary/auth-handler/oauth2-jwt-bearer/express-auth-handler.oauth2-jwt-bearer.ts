import { Permission } from "#shared/models";
import { Handler } from "express";
import { JWTPayload, auth, claimCheck } from "express-oauth2-jwt-bearer";

import { IAuthHandler } from "../../../../core";

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

  requirePermissions(requiredPermissions: Permission[] = []): Handler {
    return claimCheck((payload: JWTPayload) => {
      const tokenPermissions = (payload.permissions as string[]) || [];
      const tokenHasMissingPermission = requiredPermissions.some(
        (reqPerm) => !tokenPermissions.includes(reqPerm),
      );
      const hasAllRequiredPermissions = !tokenHasMissingPermission;
      return hasAllRequiredPermissions;
    });
  }
}
