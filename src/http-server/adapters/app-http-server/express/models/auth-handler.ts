import { Handler } from "express";

import { Permission } from "@http-server";

export interface IAuthHandler {
  issuerBaseURL: string;
  requiresAuth: Handler;
  requirePermissions(requiredPermissions: Permission[]): Handler;
}
