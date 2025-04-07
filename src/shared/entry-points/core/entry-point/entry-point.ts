import { Permission } from "#shared/models";
import path from "path";

import { IEntryPoint, IEntryPointOptions } from "../models";

export class EntryPoint implements IEntryPoint {
  private readonly parent: IEntryPoint;
  private readonly permissions: Permission[];

  constructor(
    private readonly relativePath: string,
    options?: IEntryPointOptions,
  ) {
    if (options?.parent) {
      this.parent = options.parent;
    }
    if (options?.permissions) {
      this.permissions = options.permissions;
    }
  }

  getParent(): IEntryPoint {
    return this.parent;
  }

  getPermissions(): Permission[] {
    const permissions = this.permissions || [];
    const parentPermissions = this.parent?.getPermissions() || [];
    const allPermissions = [...permissions, ...parentPermissions];
    return allPermissions;
  }

  getRelativePath() {
    return this.relativePath;
  }

  getFullPathRaw() {
    if (!this.parent) {
      return this.getRelativePath();
    }
    const allPathFragments = [
      this.parent.getFullPathRaw(),
      this.getRelativePath(),
    ];
    return path.join(...allPathFragments).replace(/\\/g, "/");
  }

  getFullPathWithParams(params: any) {
    const rawPath = this.getFullPathRaw();
    return this.getPathWithParams(rawPath, params);
  }

  private getPathWithParams(rawPath: string, params: any): string {
    let pathWithParams = rawPath;
    Object.entries(params).forEach(([key, value]) => {
      const pathParam = `:${key}`;
      const isInRawPath = rawPath.includes(pathParam);
      if (isInRawPath && typeof value === "string") {
        pathWithParams = pathWithParams.replace(pathParam, value);
      }
    });
    return pathWithParams;
  }
}
