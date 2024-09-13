import { Handler } from "express";

import { Permission } from "@http-server";

export interface IAuthExpressHandler {
  requiresAuth: Handler;
  hasPermissions(requiredPermissions: Permission | Permission[]): Handler;
}
