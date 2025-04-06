import { Handler } from "express";

import { Permission } from "@shared/models";

export interface IAuthHandler {
  issuerBaseURL: string;
  requiresAuth: Handler;
  requirePermissions(requiredPermissions: Permission[]): Handler;
}
