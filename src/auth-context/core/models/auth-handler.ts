import { Permission } from "#shared/models";
import { Handler } from "express";

export interface IAuthHandler {
  issuerBaseURL: string;
  requiresAuth: Handler;
  requirePermissions(requiredPermissions: Permission[]): Handler;
}
